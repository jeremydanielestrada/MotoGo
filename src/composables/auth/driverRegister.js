import { supabase, formActionDefault } from '@/utils/supabase'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

export function useDriverRegister() {
  // Utilize pre-defined vue functions
  const router = useRouter()

  // Load Variables
  const formDataDefault = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    license_upload: null,
  }
  const formData = ref({
    ...formDataDefault,
  })
  const formAction = ref({
    ...formActionDefault,
  })
  const refVForm = ref()

  // Register Functionality
  const onSubmit = async () => {
    // Reset Form Action utils
    formAction.value = { ...formActionDefault, formProcess: true }

    const { data, error } = await supabase.auth.signUp({
      email: formData.value.email,
      password: formData.value.password,
      options: {
        data: {
          firstname: formData.value.firstname,
          lastname: formData.value.lastname,
          phone: formData.value.phone,
          license_upload: null, // Placeholder for license upload
          is_driver: true, // for the driver confirmation
        },
      },
    })

    if (error) {
      // Add Error Message and Status Code
      formAction.value.formErrorMessage = error.message
      formAction.value.formStatus = error.status
    } else if (data) {
      // Add Success Message
      formAction.value.formSuccessMessage = 'Successfully Registered Account.'
      // Redirect Acct to Dashboard
      router.replace('/system/rider-dashboard')
    }

    // Reset Form
    refVForm.value?.reset()
    // Turn off processing
    formAction.value.formProcess = false
  }

  // Trigger Validators
  const onFormSubmit = () => {
    refVForm.value?.validate().then(({ valid }) => {
      if (valid) onSubmit()
    })
  }

  return { formData, formAction, refVForm, onFormSubmit }
}
