import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export const formActionDefault = {
  formProcess: false,
  formStatus: 200,
  formErrorMessage: '',
  formSuccessMessage: '',
}

export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting session:', error.message)
    return false
  }

  return !!data.session
}

//getting user information
// export const getuserInformation = async () => {
//   const {
//     data: {
//       user: { user_metadata },
//     },
//   } = await supabase.auth.getUser()

//   return user_metadata
// }

// export const getuserInformation = async () => {
//   const { data, error } = await supabase.auth.getUser()

//   if (error || !data?.user) {
//     return null
//   }

//   return data.user.user_metadata
// }

export const getuserInformation = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    return null
  }

  const user = data.user
  const meta = user.user_metadata

  // Return a unified object with id (from sub) and all metadata fields
  return {
    id: user.id, // Use sub as id!
    email: user.email,
    firstname: meta.firstname,
    lastname: meta.lastname,
    image_url: meta.image_url,
    is_driver: meta.is_driver,
    phone: meta.phone,
  }
}
