import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useMessageStore = defineStore('messages', () => {
  // State
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const activeSubscription = ref(null)

  // Computed
  const userId = computed(() => {
    // Get user ID from Supabase
    try {
      const session = supabase.auth.session()
      return session?.user?.id
    } catch (error) {
      console.error('Error getting user ID:', error)
      return null
    }
  })

  // Get all messages for the current user
  async function fetchMessages() {
    isLoading.value = true
    error.value = null

    try {
      // First, get the current user directly from Supabase
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('Error getting user data:', userError.message)
        error.value = 'Authentication error'
        return
      }

      if (!userData || !userData.user || !userData.user.id) {
        console.error('User not logged in')
        error.value = 'User not logged in'
        return
      }

      const userId = userData.user.id

      // Now fetch messages using the user ID
      const { data, error: msgError } = await supabase
        .from('messages')
        .select(
          `
          *,
          riders:rider_id(id, user_metadata),
          passengers:passenger_id(id, user_metadata)
        `,
        )
        .or(`rider_id.eq.${userId},passenger_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (msgError) {
        console.error('Error fetching messages:', msgError.message)
        error.value = 'Failed to fetch messages'
        return
      }

      // Process messages to include profile information
      const processedMessages = (data || []).map((msg) => {
        // Extract names from metadata
        const riderName =
          msg.riders?.user_metadata?.firstname + ' ' + msg.riders?.user_metadata?.lastname ||
          'Rider'
        const passengerName =
          msg.passengers?.user_metadata?.firstname +
            ' ' +
            msg.passengers?.user_metadata?.lastname || 'Passenger'

        return {
          ...msg,
          rider_name: riderName,
          passenger_name: passengerName,
        }
      })

      messages.value = processedMessages
      setupMessageSubscription(userId)
    } catch (err) {
      console.error('Unexpected error in fetchMessages:', err)
      error.value = 'Unexpected error occurred'
    } finally {
      isLoading.value = false
    }
  }

  // Set up real-time subscription to messages
  function setupMessageSubscription(userId) {
    // Clean up any existing subscription
    if (activeSubscription.value) {
      supabase.removeSubscription(activeSubscription.value)
    }

    // Subscribe to changes
    activeSubscription.value = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `rider_id=eq.${userId},passenger_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New message received:', payload)
          // Fetch the complete message with profiles
          fetchMessageById(payload.new.id)
        },
      )
      .subscribe()
  }

  // Fetch a single message by ID
  async function fetchMessageById(messageId) {
    try {
      const { data, error: msgError } = await supabase
        .from('messages')
        .select(
          `
          *,
          riders:rider_id(id, user_metadata),
          passengers:passenger_id(id, user_metadata)
        `,
        )
        .eq('id', messageId)
        .single()

      if (msgError) {
        console.error('Error fetching message:', msgError.message)
        return
      }

      if (!data) return

      // Extract names from metadata
      const riderName =
        data.riders?.user_metadata?.firstname + ' ' + data.riders?.user_metadata?.lastname ||
        'Rider'
      const passengerName =
        data.passengers?.user_metadata?.firstname +
          ' ' +
          data.passengers?.user_metadata?.lastname || 'Passenger'

      const processedMessage = {
        ...data,
        rider_name: riderName,
        passenger_name: passengerName,
      }

      // Add to messages if not already there
      if (!messages.value.some((msg) => msg.id === processedMessage.id)) {
        messages.value = [processedMessage, ...messages.value]
      }
    } catch (err) {
      console.error('Error fetching single message:', err)
    }
  }

  // Send a new message
  async function sendMessage({ passenger_id, content }) {
    if (!content || !passenger_id) {
      console.error('Missing message content or recipient')
      return { error: 'Missing message content or recipient' }
    }

    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData?.user?.id) {
        console.error('User not logged in')
        return { error: 'User not logged in' }
      }

      const sender_id = userData.user.id

      // Insert the message
      const { data, error: msgError } = await supabase
        .from('messages')
        .insert({
          rider_id: sender_id,
          passenger_id,
          content,
          created_at: new Date().toISOString(),
        })
        .select()

      if (msgError) {
        console.error('Error sending message:', msgError.message)
        return { error: msgError.message }
      }

      // No need to fetch messages again as the subscription will handle it
      return { data }
    } catch (err) {
      console.error('Unexpected error in sendMessage:', err)
      return { error: 'Unexpected error occurred' }
    }
  }

  // Clean up subscriptions
  function cleanup() {
    if (activeSubscription.value) {
      supabase.removeSubscription(activeSubscription.value)
      activeSubscription.value = null
    }
  }

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
    cleanup,
  }
})
