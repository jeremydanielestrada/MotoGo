import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useMessageStore = defineStore('messages', () => {
  // State
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const activeSubscription = ref(null)
  const unreadMessages = ref({})
  const typingUsers = ref({})
  const messageStatus = ref({})

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
        .select('*')
        .or(`rider_id.eq.${userId},passenger_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (msgError) {
        console.error('Error fetching messages:', msgError.message)
        error.value = 'Failed to fetch messages'
        return
      }

      // Since we can't directly fetch other users' metadata from the client,
      // we'll use the existing message data and enhance it where possible
      
      // If we have the current user's metadata, we can at least use that
      const currentUserMeta = userData.user.user_metadata || {}

      // Process messages to include profile information
      const processedMessages = (data || []).map((msg) => {
        // We can at least use our own metadata for messages we're involved in
        let riderImageUrl = null;
        let passengerImageUrl = null;
        
        // If the current user is the rider, use their image URL
        if (msg.rider_id === userId && currentUserMeta.image_url) {
          riderImageUrl = currentUserMeta.image_url;
        }
        
        // If the current user is the passenger, use their image URL
        if (msg.passenger_id === userId && currentUserMeta.image_url) {
          passengerImageUrl = currentUserMeta.image_url;
        }
        
        // Track unread messages (messages sent to current user that aren't read)
        if (!msg.read && 
            ((msg.rider_id !== userId && msg.passenger_id === userId) || 
             (msg.passenger_id !== userId && msg.rider_id === userId))) {
          const partnerId = msg.rider_id === userId ? msg.passenger_id : msg.rider_id;
          if (!unreadMessages.value[partnerId]) {
            unreadMessages.value[partnerId] = [];
          }
          if (!unreadMessages.value[partnerId].includes(msg.id)) {
            unreadMessages.value[partnerId].push(msg.id);
          }
        }
        
        // Set default message status
        messageStatus.value[msg.id] = msg.read ? 'read' : 'delivered';
        
        return {
          ...msg,
          rider_name: msg.rider_name || 'Rider',
          passenger_name: msg.passenger_name || 'Passenger',
          rider_image_url: riderImageUrl,
          passenger_image_url: passengerImageUrl,
          status: msg.read ? 'read' : 'delivered',
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
    cleanup()

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
          
          // Track as unread if it's sent to the current user
          if ((payload.new.rider_id !== userId && payload.new.passenger_id === userId) || 
              (payload.new.passenger_id !== userId && payload.new.rider_id === userId)) {
            const partnerId = payload.new.rider_id === userId ? 
              payload.new.passenger_id : payload.new.rider_id;
            
            if (!unreadMessages.value[partnerId]) {
              unreadMessages.value[partnerId] = [];
            }
            unreadMessages.value[partnerId].push(payload.new.id);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `rider_id=eq.${userId},passenger_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Message updated:', payload)
          // Update message status
          const index = messages.value.findIndex(msg => msg.id === payload.new.id)
          if (index !== -1) {
            messages.value[index] = { ...messages.value[index], ...payload.new }
            messageStatus.value[payload.new.id] = payload.new.read ? 'read' : 'delivered'
          }
        },
      )
      .subscribe()
  }

  // Fetch a single message by ID
  async function fetchMessageById(messageId) {
    try {
      const { data, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (msgError) {
        console.error('Error fetching message:', msgError.message)
        return
      }

      if (!data) return

      // Use existing names if available or fetch them separately
      const riderName = data.rider_name || 'Rider'
      const passengerName = data.passenger_name || 'Passenger'

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
          read: false, // Initialize as unread
          status: 'sent', // Initial status
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
      // Use the correct method to unsubscribe
      supabase.channel(activeSubscription.value.topic || 'messages-changes').unsubscribe()
      activeSubscription.value = null
    }
  }

  // Mark message as read
  async function markMessageAsRead(messageId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
      
      if (error) {
        console.error('Error marking message as read:', error.message)
        return
      }
      
      // Update local state
      const index = messages.value.findIndex(msg => msg.id === messageId)
      if (index !== -1) {
        messages.value[index].read = true
        // Remove from unread messages
        const partnerId = messages.value[index].rider_id === userId.value ? 
          messages.value[index].passenger_id : messages.value[index].rider_id
        
        if (unreadMessages.value[partnerId]) {
          unreadMessages.value[partnerId] = unreadMessages.value[partnerId].filter(id => id !== messageId)
          if (unreadMessages.value[partnerId].length === 0) {
            delete unreadMessages.value[partnerId]
          }
        }
      }
    } catch (err) {
      console.error('Error in markMessageAsRead:', err)
    }
  }
  
  // Set typing indicator
  async function setTypingIndicator(partnerId, isTyping) {
    try {
      // Update local state
      if (isTyping) {
        typingUsers.value[partnerId] = true
      } else {
        delete typingUsers.value[partnerId]
      }
      
      // In a real app, you would broadcast this to the other user
      // For now, we'll just simulate it with a timeout to remove the indicator
      if (isTyping) {
        setTimeout(() => {
          delete typingUsers.value[partnerId]
        }, 3000) // Remove typing indicator after 3 seconds
      }
    } catch (err) {
      console.error('Error in setTypingIndicator:', err)
    }
  }

  // Create a messaging channel when a ride is accepted
  async function createRideMessageChannel(rideData) {
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData?.user?.id) {
        console.error('User not logged in')
        return { error: 'User not logged in' }
      }

      const currentUserId = userData.user.id
      
      // Determine if current user is rider or passenger
      const isRider = rideData.rider_id === currentUserId
      const otherUserId = isRider ? rideData.passenger_id : rideData.rider_id
      
      // Send initial system message
      const { data, error: msgError } = await supabase
        .from('messages')
        .insert({
          rider_id: rideData.rider_id,
          passenger_id: rideData.passenger_id,
          content: `Ride booking #${rideData.booking_reference} has been confirmed. You can now message each other.`,
          created_at: new Date().toISOString(),
          read: false,
          status: 'system',
          ride_id: rideData.id || rideData.booking_reference
        })
        .select()

      if (msgError) {
        console.error('Error creating message channel:', msgError.message)
        return { error: msgError.message }
      }
      
      // Fetch messages to update the UI
      await fetchMessages()
      
      return { data, otherUserId }
    } catch (err) {
      console.error('Unexpected error in createRideMessageChannel:', err)
      return { error: 'Unexpected error occurred' }
    }
  }

  return {
    messages,
    isLoading,
    error,
    unreadMessages,
    typingUsers,
    messageStatus,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    setTypingIndicator,
    createRideMessageChannel,
    cleanup,
  }
})
