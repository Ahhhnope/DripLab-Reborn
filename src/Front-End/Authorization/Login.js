import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export function useLogin() {
  const router = useRouter()

  const identifier   = ref('')
  const password     = ref('')
  const showPassword = ref(false)
  const isLoading    = ref(false)
  const errorMsg     = ref('')

  // Detect if input looks like a phone number
  const isPhone = computed(() => /^(0|\+84)[0-9]{8,10}$/.test(identifier.value.replace(/\s/g, '')))
  const identifierType = computed(() => {
    if (!identifier.value) return 'email'
    return isPhone.value ? 'phone' : 'email'
  })

  async function handleLogin() {
    errorMsg.value = ''
    if (!identifier.value || !password.value) {
      errorMsg.value = 'Vui lòng điền đầy đủ thông tin.'
      return
    }
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
    const cleanId = identifier.value.replace(/\s/g, '')
    if (!emailRegex.test(cleanId) && !phoneRegex.test(cleanId)) {
      errorMsg.value = 'Email hoặc số điện thoại không hợp lệ.'
      return
    }
    isLoading.value = true
    await new Promise(r => setTimeout(r, 1400))
    isLoading.value = false
    router.push('/homepage')
  }

  function goRegister() { router.push('/register') }
  function goHome()     { router.push('/homepage') }

  return {
    identifier,
    password,
    showPassword,
    isLoading,
    errorMsg,
    identifierType,
    handleLogin,
    goRegister,
    goHome,
  }
}
