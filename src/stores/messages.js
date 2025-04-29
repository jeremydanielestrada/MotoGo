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

      const { data, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .or(`rider_id.eq.${userId},passenger_id.eq.${userId}`)

      if (msgError) {
        error.value = 'Failed to fetch messages'
        return
      }

      // Only keep fields that exist in your schema
      messages.value = (data || [])
        .map((msg) => ({
          ...msg,
          created_at: msg.created_at || new Date().toISOString(),
        }))
        .sort((a, b) => new Date(b.created_at || new Date()) - new Date(a.created_at || new Date()))

      setupMessageSubscription(userId)
    } catch (err) {
      error.value = 'Unexpected error occurred'
    } finally {
      isLoading.value = false
    }
  }

  // Real-time subscription
  function setupMessageSubscription(userId) {
    cleanup()
    activeSubscription.value = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = {
            ...payload.new,
            created_at: payload.new.created_at || new Date().toISOString(),
          }
          if (!messages.value.some((msg) => msg.id === newMessage.id)) {
            messages.value = [newMessage, ...messages.value]
          }
          const partnerId =
            payload.new.rider_id === userId ? payload.new.passenger_id : payload.new.rider_id
          if (partnerId !== userId) {
            if (!unreadMessages.value[partnerId]) unreadMessages.value[partnerId] = []
            unreadMessages.value[partnerId].push(payload.new.id)
          }
        },
      )
      .subscribe()
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
          created_at: new Date().toISOString(),
        }
        messages.value = [newMessage, ...messages.value]
      }
      return { data }
    } catch (err) {
      return { error: 'Unexpected error occurred' }
    }
  }

  // Mark a message as read (UI only)
  function markMessageAsRead(messageId) {
    Object.keys(unreadMessages.value).forEach((partnerId) => {
      const idx = unreadMessages.value[partnerId].indexOf(messageId)
      if (idx !== -1) unreadMessages.value[partnerId].splice(idx, 1)
    })
  }

  // Set typing indicator (UI only)
  function setTypingIndicator(partnerId, isTyping) {
    if (isTyping) {
      typingUsers.value[partnerId] = true
      setTimeout(() => {
        delete typingUsers.value[partnerId]
      }, 3000)
    } else {
      delete typingUsers.value[partnerId]
    }
  }

  // Clean up subscriptions
  function cleanup() {
    if (activeSubscription.value) {
      supabase.channel(activeSubscription.value.topic || 'messages-changes').unsubscribe()
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
    sendMessage,
    setTypingIndicator,
    markMessageAsRead,
    cleanup,
  }
})
