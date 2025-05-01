import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useMessageStore = defineStore('messages', () => {
  // State
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const activeSubscription = ref(null)
  const typingUsers = ref({})
  const unreadMessages = ref({})
  const lastFetchTime = ref(null)
  const retryCount = ref(0)
  const maxRetries = 3

  // Get all messages for the current user
  async function fetchMessages() {
    isLoading.value = true
    error.value = null

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user?.id) {
        error.value = 'User not logged in'
        return
      }
      const userId = userData.user.id

      // Use the last fetch time to only get new messages if available
      let query = supabase
        .from('messages')
        .select('*')
        .or(`rider_id.eq.${userId},passenger_id.eq.${userId}`)
      
      if (lastFetchTime.value) {
        // Only fetch messages newer than the last fetch time
        query = query.gt('created_at', lastFetchTime.value)
      }

      const { data, error: msgError } = await query

      if (msgError) {
        error.value = 'Failed to fetch messages'
        return
      }

      // Update last fetch time
      lastFetchTime.value = new Date().toISOString()

      if (data && data.length > 0) {
        // Merge new messages with existing ones, avoiding duplicates
        const newMessages = data.map((msg) => ({
          ...msg,
          created_at: msg.created_at || new Date().toISOString(),
        }))
        
        // Add new messages to the store
        const existingIds = new Set(messages.value.map(msg => msg.id))
        const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id))
        
        messages.value = [...uniqueNewMessages, ...messages.value]
          .sort((a, b) => new Date(b.created_at || new Date()) - new Date(a.created_at || new Date()))
      }

      // Set up real-time subscription
      setupMessageSubscription(userId)
    } catch (err) {
      console.error('Error fetching messages:', err)
      error.value = 'Unexpected error occurred'
    } finally {
      isLoading.value = false
    }
  }

  // Refresh messages - can be called manually to force a refresh
  async function refreshMessages() {
    // Reset lastFetchTime to get all messages
    lastFetchTime.value = null
    retryCount.value = 0
    await fetchMessages()
  }

  // Real-time subscription
  function setupMessageSubscription(userId) {
    // Clean up any existing subscription first
    cleanup()
    
    // Don't attempt to subscribe if we've exceeded retry attempts
    if (retryCount.value >= maxRetries) {
      console.warn(`Maximum retry attempts (${maxRetries}) reached. Stopping subscription attempts.`)
      return
    }
    
    try {
      // Create a new subscription channel with a unique name to avoid conflicts
      const channelName = `messages-changes-${userId}-${Date.now()}`
      
      // Create the channel
      const channel = supabase.channel(channelName)
      
      // Set up the subscription
      activeSubscription.value = channel
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `rider_id=eq.${userId}` 
          },
          (payload) => {
            handleNewMessage(payload, userId)
          }
        )
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `passenger_id=eq.${userId}` 
          },
          (payload) => {
            handleNewMessage(payload, userId)
          }
        )
        .subscribe((status) => {
          console.log(`Supabase subscription status: ${status}`)
          if (status === 'SUBSCRIBED') {
            // Reset retry count on successful subscription
            retryCount.value = 0
          } else if (status === 'CHANNEL_ERROR' || status === 'SUBSCRIPTION_ERROR') {
            console.error('Failed to subscribe to real-time messages')
            
            // Increment retry count
            retryCount.value++
            
            // Try to resubscribe after a delay if subscription fails
            if (retryCount.value < maxRetries) {
              console.log(`Retry attempt ${retryCount.value}/${maxRetries} for subscription...`)
              setTimeout(() => {
                // Clean up the failed subscription
                if (activeSubscription.value) {
                  supabase.removeChannel(activeSubscription.value)
                  activeSubscription.value = null
                }
                
                // Try to subscribe again
                setupMessageSubscription(userId)
              }, 3000 * retryCount.value) // Exponential backoff
            } else {
              console.warn(`Maximum retry attempts (${maxRetries}) reached. Please refresh manually.`)
            }
          }
        })
    } catch (err) {
      console.error('Error setting up subscription:', err)
      retryCount.value++
    }
  }

  // Handle new message from subscription
  function handleNewMessage(payload, userId) {
    console.log('New message received:', payload.new)
    
    const newMessage = {
      ...payload.new,
      created_at: payload.new.created_at || new Date().toISOString(),
    }
    
    // Check if message already exists to avoid duplicates
    if (!messages.value.some((msg) => msg.id === newMessage.id)) {
      console.log('Adding new message to store')
      // Add to messages array and maintain sort order
      messages.value = [newMessage, ...messages.value]
        .sort((a, b) => new Date(b.created_at || new Date()) - new Date(a.created_at || new Date()))
    } else {
      console.log('Message already exists in store, skipping')
    }
    
    // Determine partner ID for unread messages
    const partnerId =
      payload.new.rider_id === userId ? payload.new.passenger_id : payload.new.rider_id
    
    // Mark as unread if the message is from the partner
    if (partnerId !== userId) {
      if (!unreadMessages.value[partnerId]) unreadMessages.value[partnerId] = []
      unreadMessages.value[partnerId].push(payload.new.id)
    }
  }

  // Send a new message
  async function sendMessage({ passenger_id, content }) {
    if (!content || !passenger_id) return { error: 'Missing message content or recipient' }
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user?.id) return { error: 'User not logged in' }
      const sender_id = userData.user.id

      const messageData = {
        rider_id: sender_id,
        passenger_id,
        content,
      }

      const { data, error: msgError } = await supabase.from('messages').insert(messageData).select()
      if (msgError) return { error: msgError.message }

      if (data && data[0]) {
        const newMessage = {
          ...data[0],
          created_at: data[0].created_at || new Date().toISOString(),
        }
        
        // Ensure the message is added to the local state immediately
        if (!messages.value.some((msg) => msg.id === newMessage.id)) {
          messages.value = [newMessage, ...messages.value]
            .sort((a, b) => new Date(b.created_at || new Date()) - new Date(a.created_at || new Date()))
        }
        
        return { data: newMessage }
      }

      return { data: null }
    } catch (err) {
      console.error('Error sending message:', err)
      return { error: 'Unexpected error occurred' }
    }
  }

  // Mark a message as read (UI only)
  function markMessageAsRead(messageId) {
    Object.keys(unreadMessages.value).forEach((partnerId) => {
      unreadMessages.value[partnerId] = unreadMessages.value[partnerId].filter(
        (id) => id !== messageId,
      )
    })
  }

  // Set typing indicator (UI only)
  function setTypingIndicator(partnerId, isTyping) {
    if (!partnerId) return

    if (isTyping) {
      typingUsers.value = { ...typingUsers.value, [partnerId]: true }
    } else {
      const newTypingUsers = { ...typingUsers.value }
      delete newTypingUsers[partnerId]
      typingUsers.value = newTypingUsers
    }
  }

  // Clean up subscriptions
  function cleanup() {
    try {
      if (activeSubscription.value) {
        console.log('Cleaning up subscription')
        supabase.removeChannel(activeSubscription.value)
        activeSubscription.value = null
      }
    } catch (err) {
      console.error('Error cleaning up subscription:', err)
      // Reset the subscription reference even if removal fails
      activeSubscription.value = null
    }
  }

  return {
    messages,
    isLoading,
    error,
    typingUsers,
    unreadMessages,
    fetchMessages,
    refreshMessages,
    sendMessage,
    markMessageAsRead,
    setTypingIndicator,
    cleanup,
  }
})
