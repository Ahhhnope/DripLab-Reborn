import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export function useRegister() {
  const router = useRouter()

  const name     = ref('')
  const email    = ref('')
  const phone    = ref('')
  const password = ref('')
  const confirm  = ref('')
  const showPwd  = ref(false)
  const showCfm  = ref(false)
  const isLoading = ref(false)
  const errorMsg  = ref('')
  const step      = ref(1)

  const strength = computed(() => {
    const p = password.value
    if (!p) return 0
    let s = 0
    if (p.length >= 8)         s++
    if (/[A-Z]/.test(p))       s++
    if (/[0-9]/.test(p))       s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })

  const strengthLabel = computed(() =>
    ['', 'Weak', 'Fair', 'Good', 'Strong'][strength.value]
  )

  const strengthColor = computed(() =>
    ['', '#D4735A', '#C4A246', '#8BBB6A', '#5A9E7A'][strength.value]
  )

  async function handleRegister() {
    errorMsg.value = ''
    if (!name.value || !email.value || !phone.value || !password.value || !confirm.value) {
      errorMsg.value = 'Vui lòng điền đầy đủ thông tin.'
      return
    }
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
    if (!phoneRegex.test(phone.value.replace(/\s/g, ''))) {
      errorMsg.value = 'Số điện thoại không hợp lệ.'
      return
    }
    if (password.value !== confirm.value) {
      errorMsg.value = 'Mật khẩu xác nhận không khớp.'
      return
    }
    if (strength.value < 2) {
      errorMsg.value = 'Mật khẩu quá yếu, vui lòng chọn mật khẩu mạnh hơn.'
      return
    }
    isLoading.value = true
    await new Promise(r => setTimeout(r, 1600))
    isLoading.value = false
    step.value = 2
  }

  function goLogin() { router.push('/login') }
  function goHome()  { router.push('/homepage') }

  return {
    name,
    email,
    phone,
    password,
    confirm,
    showPwd,
    showCfm,
    isLoading,
    errorMsg,
    step,
    strength,
    strengthLabel,
    strengthColor,
    handleRegister,
    goLogin,
    goHome,
  }
}
