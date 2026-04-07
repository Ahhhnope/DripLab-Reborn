import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'
import { useAuthStore } from './Auth'

export function useLogin() {
  const router = useRouter()
  const auth = useAuthStore()

  const identifier = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const isLoading = ref(false)
  const errorMsg = ref('')

  const isPhoneNum = computed(() => /^(0|\+84)[0-9]{8,10}$/.test(identifier.value.replace(/\s/g, '')))
  const identifierType = computed(() => {
    if (!identifier.value) return 'email'
    return isPhoneNum.value ? 'phone' : 'email'
  })

  async function handleLogin() {
    errorMsg.value = ''

    if (!identifier.value || !password.value) {
      errorMsg.value = 'Vui lòng điền đầy đủ thông tin.'
      return
    }

    isLoading.value = true

    try {
      const response = await api.post('/auth/login', {
        email: identifier.value,
        password: password.value
      })

      const { token, user } = response.data
      
      // Save data to Pinia and LocalStorage
      auth.setUser(user, token)

      // Optional: small delay so the user sees the "Brewing..." animation
      await new Promise(r => setTimeout(r, 800))

      // if (user.role.toUpperCase() === 'ADMIN') {
      //   router.push('/Dashboard');
      // } else {
      //     window.location.href = 'http://localhost:5173/homepage';
      // }
    } catch (err) {
      errorMsg.value = err.response?.data?.message || 'Đăng nhập thất bại'
    } finally {
      isLoading.value = false
    }
  }

  function goRegister() { router.push('/register') }
  function goHome() { router.push('/homepage') }

  return {
    identifier,
    password,
    showPassword,
    isLoading,
    errorMsg,
    identifierType,
    handleLogin,
    goRegister,
    goHome
  }
}