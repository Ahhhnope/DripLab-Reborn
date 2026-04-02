import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {useAuthStore} from '../Authorization/Auth'


export function useLogin() {
  const router = useRouter()

  const identifier   = ref('')
  const password     = ref('')
  const showPassword = ref(false)
  const isLoading    = ref(false)
  const errorMsg     = ref('')

  // WAT THE F*ck is thissssssss, oh its regex....
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

    // """""Basic""""" validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
    const cleanId = identifier.value.replace(/\s/g, '')



    if (!emailRegex.test(cleanId) && !phoneRegex.test(cleanId)) {
      errorMsg.value = 'Email hoặc số điện thoại không hợp lệ.'
      return
    }

    isLoading.value = true

    // ;-;
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: identifier.value,
        password: password.value
      })

      const { token, user } = response.data

      const auth = useAuthStore()
      auth.setUser(user, token)

      // localStorage.setItem('user', JSON.stringify(user))
      // localStorage.setItem('token', token)

      router.push('/homepage')
    } catch (err) {

      errorMsg.value = err.response?.data?.message || 'Đăng nhập thất bại, xin kiểm tra lại thông tin'

    } finally {
      isLoading.value = false
    }

    await new Promise(r => setTimeout(r, 1400))
    auth.setUser(response.data.fullName, response.data.token)
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Guest' }))


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
