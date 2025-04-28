import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useAuthUserStore = defineStore('authUser', () => {
  // States
  const userData = ref(null)

  // Getters - Add a getter for user_metadata to match your component's expectations
  const user_metadata = ref(null)

  // Reset State Action
  function $reset() {
    userData.value = null
    user_metadata.value = null
  }

  // Actions
  // Retrieve User Session if Logged
  async function isAuthenticated() {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error.message)
      return false
    }

    if (data.session) {
      const { id, email, user_metadata: metadata } = data.session.user
      userData.value = { id, email, ...metadata }
      user_metadata.value = metadata // Store the original user_metadata
    }

    console.log('isAuthenticated:', !!data.session) // Debugging log
    return !!data.session
  }

  // Retrieve User Information
  async function getUserInformation() {
    const {
      data: {
        // Retrieve Id, Email and Metadata thru Destructuring
        user: { id, email, user_metadata: metadata },
      },
    } = await supabase.auth.getUser()

    // Set the retrieved information to state
    userData.value = { id, email, ...metadata }
    user_metadata.value = metadata // Store the original user_metadata
  }

  // Update User Information
  async function updateUserInformation(updatedData) {
    const {
      data: {
        // Retrieve Id, Email and Metadata thru Destructuring
        user: { id, email, user_metadata: metadata },
      },
      error,
    } = await supabase.auth.updateUser({
      data: {
        ...updatedData, // Include ratings in the updated data
      },
    })

    // Check if it has error
    if (error) {
      return { error }
    }
    // If no error set updatedData to userData state
    else if (metadata) {
      userData.value = { id, email, ...metadata }
      user_metadata.value = metadata // Store the original user_metadata

      return { data: userData.value }
    }
  }

  // Update User Profile Image

  // async function updateUserImage(file, userId) {
  //   console.log('File received:', file)
  //   console.log('User ID:', userId)

  //   // Upload the file with the user ID and file extension
  //   const { data, error } = await supabase.storage
  //     .from('profiles') /// have to change
  //     .upload('avatars/' + userId + '-avatar.png', file, {
  //       cacheControl: '3600',
  //       upsert: true,
  //     })
  //   console.log('Upload response:', data, 'Error:', error)

  //   // Check if it has error
  //   if (error) {
  //     return { error }
  //   }
  //   // If no error set data to userData state with the image_url
  //   else if (data) {
  //     // Retrieve Image Public Url
  //     const { data: imageData, erro: urlError } = supabase.storage
  //       .from('profiles')
  //       .getPublicUrl(data.path)
  //     console.log('Public URL response:', imageData, 'Error:', urlError)

  //     // Update the user information with the new image_url
  //     //  return dapat
  //     const updateResult = await updateUserInformation({
  //       ...userData.value,
  //       image_url: imageData.publicUrl,
  //     })
  //     console.log('Update user information response:', updateResult)
  //   }
  // }

  // async function updateUserImage(file, userId) {
  //   console.log('File received:', file)
  //   console.log('User ID:', userId)

  //   try {
  //     // Upload the file with the user ID and file extension
  //     const { data, error } = await supabase.storage
  //       .from('profiles')
  //       .upload('avatars/' + userId + '-avatar.png', file, {
  //         cacheControl: '3600',
  //         upsert: true,
  //       })

  //     console.log('Upload response:', data, 'Error:', error)

  //     // Check if it has error
  //     if (error) {
  //       console.error('Upload error:', error)
  //       return { error }
  //     }

  //     // Get the public URL for the uploaded image
  //     const { data: imageData, error: urlError } = supabase.storage
  //       .from('profiles')
  //       .getPublicUrl(data.path)

  //     console.log('Public URL response:', imageData, 'Error:', urlError)

  //     if (urlError) {
  //       console.error('Error getting public URL:', urlError)
  //       return { error: urlError }
  //     }

  //     // Update the user information with the new image_url
  //     const updateResult = await updateUserInformation({
  //       image_url: imageData.publicUrl,
  //     })

  //     console.log('Update user information response:', updateResult)
  //     return updateResult
  //   } catch (err) {
  //     console.error('Unexpected error in updateUserImage:', err)
  //     return { error: err }
  //   }
  // }

  /// working function
  async function updateUserImage(file, userId) {
    try {
      // Create unique filename
      const timestamp = Date.now()
      const filename = `avatars/${userId}-${timestamp}-avatar.png`

      // Upload with unique name
      const { data, error } = await supabase.storage.from('profiles').upload(filename, file, {
        cacheControl: '0', // Don't cache this file
        upsert: false, // Don't overwrite, create new
      })

      if (error) {
        console.error('Upload error:', error)
        return { error }
      }

      // Get public URL
      const { data: imageData } = supabase.storage.from('profiles').getPublicUrl(data.path)

      // Update user metadata with new URL
      const updateResult = await updateUserInformation({
        image_url: `${imageData.publicUrl}?t=${timestamp}`, // Add cache buster
      })

      // Force session refresh to get updated metadata
      await supabase.auth.refreshSession()

      // Get updated user info
      await getUserInformation()

      return updateResult
    } catch (err) {
      console.error('Error in updateUserImage:', err)
      return { error: err }
    }
  }

  // Add Rating

  async function addRating(entityId, rating) {
    const { data, error } = await supabase
      .from('ratings') // Replace with your actual table name
      .insert({
        user_id: userData.value.id,
        entity_id: entityId,
        rating,
      })

    if (error) {
      console.error('Error adding rating:', error.message)
      return { error }
    }

    return { data }
  }

  return {
    userData,
    user_metadata, // Expose user_metadata as a top-level property
    $reset,
    isAuthenticated,
    getUserInformation,
    updateUserInformation,
    updateUserImage,
    addRating,
  }
})
