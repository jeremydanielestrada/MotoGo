import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'

export const useMessagStore = defineStore('message', () => {
  const authUser = useAuthUserStore()
  const messages = ref([])

  // ✅ Send a message
  async function sendMessage({ passenger_id, content }) {
    const rider_id = authUser.userData?.id

    if (!rider_id || !passenger_id || !content) {
      console.error('Missing fields to send message')
      return
    }

    const { data, error } = await supabase.from('messages').insert([
      {
        rider_id,
        passenger_id,
        content,
      },
    ])

    if (error) {
      console.error('Error sending message:', error)
    } else {
      console.log('Message sent:', data)
      await fetchMessages() // Refresh messages
    }
  }

  // ✅ Fetch messages for current user
  async function fetchMessages() {
    const user_id = authUser.userData?.id

    if (!user_id) {
      console.error('User not logged in')
      return
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`rider_id.eq.${user_id},passenger_id.eq.${user_id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      messages.value = data
    }
  }

  return {
    messages,
    sendMessage,
    fetchMessages,
  }
})
