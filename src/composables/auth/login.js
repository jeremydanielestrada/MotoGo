import { formActionDefault, supabase } from '@/utils/supabase'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

// by convention, composable function names start with "use"
export function useLogin() {
  // Utilize pre-defined vue functions
  const router = useRouter()

  // Load Variables
  const formDataDefault = {
    email: '',
    password: '',
  }
  const formData = ref({
    ...formDataDefault,
  })
  const formAction = ref({
    ...formActionDefault,
  })
  const refVForm = ref()

  const onSubmit = async () => {
    // Reset Form Action utils; Turn on processing at the same time
    formAction.value = { ...formActionDefault, formProcess: true }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.value.email,
      password: formData.value.password,
    })

    if (error) {
      // Add Error Message and Status Code
      formAction.value.formErrorMessage = error.message
      formAction.value.formStatus = error.status
    } else if (data) {
      // Fetch user role (assuming it's stored in user metadata)
      const { user } = data
      const isDriver = user?.user_metadata?.is_driver === true

      // Redirect based on role
      if (isDriver) {
        router.replace('/system/rider-dashboard') // Redirect to riders dashboard for drivers
      } else {
        router.replace('/system/passenger-dashboard') // Redirect to passenger dashboard for others
      }

      // Add Success Message
      formAction.value.formSuccessMessage = 'Successfully Logged Account.'
    }

    // Reset Form
    refVForm.value?.reset()
    // Turn off processing
    formAction.value.formProcess = false
  }

  const onFormSubmit = () => {
    refVForm.value?.validate().then(({ valid }) => {
      if (valid) onSubmit()
    })
  }

  return { formData, formAction, refVForm, onFormSubmit }
}
