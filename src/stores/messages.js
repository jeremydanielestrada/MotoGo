import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useMessageStore = defineStore('messages', () => {
  // State
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)

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
        .from('messages') // Replace with your actual table name
        .select('*')
        .or(`rider_id.eq.${userId},passenger_id.eq.${userId}`) // Updated column names
        .order('created_at', { ascending: false })

      if (msgError) {
        console.error('Error fetching messages:', msgError.message)
        error.value = 'Failed to fetch messages'
        return
      }

      // Process and group messages as needed
      // This is a simplified example - adjust according to your data structure
      messages.value = data || []
    } catch (err) {
      console.error('Unexpected error in fetchMessages:', err)
      error.value = 'Unexpected error occurred'
    } finally {
      isLoading.value = false
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
        .from('messages') // Replace with your actual table name
        .insert({
          rider_id: sender_id, // Updated column name
          passenger_id,
          content,
          created_at: new Date().toISOString(),
        })
        .select()

      if (msgError) {
        console.error('Error sending message:', msgError.message)
        return { error: msgError.message }
      }

      // Optionally refresh messages after sending
      await fetchMessages()

      return { data }
    } catch (err) {
      console.error('Unexpected error in sendMessage:', err)
      return { error: 'Unexpected error occurred' }
    }
  }

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
  }
})
