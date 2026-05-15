import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'

export function useForgotPassword() {
  const router = useRouter()

  // ── Step control ──────────────────────────────────────────
  // step 1: nhập email
  // step 2: nhập OTP
  // step 3: nhập mật khẩu mới
  // step 4: thành công
  const step = ref(1)

  // ── Form fields ───────────────────────────────────────────
  const email      = ref('')
  const otp        = ref('')
  const newPwd     = ref('')
  const confirmPwd = ref('')
  const showNewPwd = ref(false)
  const showCfmPwd = ref(false)

  // ── UI state ──────────────────────────────────────────────
  const isLoading  = ref(false)
  const errorMsg   = ref('')
  const successMsg = ref('')

  // ── Resend cooldown (60s) ─────────────────────────────────
  const resendCooldown = ref(0)
  let cooldownTimer = null

  function startCooldown() {
    resendCooldown.value = 60
    cooldownTimer = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(cooldownTimer)
      }
    }, 1000)
  }

  // ── Step 1: gửi OTP về email ──────────────────────────────
  async function handleSendOtp() {
    errorMsg.value = ''
    if (!email.value) {
      errorMsg.value = 'Vui lòng nhập địa chỉ email.'
      return
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email.value)) {
      errorMsg.value = 'Email không hợp lệ.'
      return
    }

    isLoading.value = true
    try {
      await api.post('/auth/forgot-password', { email: email.value })
      successMsg.value = `Mã OTP đã được gửi tới ${email.value}`
      step.value = 2
      startCooldown()
    } catch (err) {
      errorMsg.value = err.response?.data?.message || 'Không tìm thấy tài khoản với email này.'
    } finally {
      isLoading.value = false
    }
  }

  // ── Step 2: xác nhận OTP ──────────────────────────────────
  async function handleVerifyOtp() {
    errorMsg.value = ''
    if (!otp.value || otp.value.length < 4) {
      errorMsg.value = 'Vui lòng nhập đầy đủ mã OTP.'
      return
    }

    isLoading.value = true
    try {
      await api.post('/auth/verify-otp', { email: email.value, otp: otp.value })
      step.value = 3
    } catch (err) {
      errorMsg.value = err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.'
    } finally {
      isLoading.value = false
    }
  }

  // ── Gửi lại OTP ───────────────────────────────────────────
  async function handleResendOtp() {
    if (resendCooldown.value > 0) return
    errorMsg.value = ''
    isLoading.value = true
    try {
      await api.post('/auth/forgot-password', { email: email.value })
      successMsg.value = 'Đã gửi lại mã OTP.'
      otp.value = ''
      startCooldown()
    } catch (err) {
      errorMsg.value = err.response?.data?.message || 'Gửi lại OTP thất bại.'
    } finally {
      isLoading.value = false
    }
  }

  // ── Step 3: đặt lại mật khẩu ─────────────────────────────
  async function handleResetPassword() {
    errorMsg.value = ''

    if (!newPwd.value || newPwd.value.length < 6) {
      errorMsg.value = 'Mật khẩu phải có ít nhất 6 ký tự.'
      return
    }
    if (newPwd.value !== confirmPwd.value) {
      errorMsg.value = 'Mật khẩu xác nhận không khớp.'
      return
    }

    isLoading.value = true
    try {
      await api.post('/auth/reset-password', {
        email: email.value,
        otp: otp.value,
        newPassword: newPwd.value
      })
      step.value = 4
    } catch (err) {
      errorMsg.value = err.response?.data?.message || 'Đặt lại mật khẩu thất bại.'
    } finally {
      isLoading.value = false
    }
  }

  // ── Navigation ────────────────────────────────────────────
  function goBack() {
    if (step.value > 1 && step.value < 4) {
      step.value--
      errorMsg.value = ''
    } else {
      router.push('/login')
    }
  }

  function goLogin() { router.push('/login') }

  return {
    step,
    email, otp, newPwd, confirmPwd,
    showNewPwd, showCfmPwd,
    isLoading, errorMsg, successMsg,
    resendCooldown,
    handleSendOtp,
    handleVerifyOtp,
    handleResendOtp,
    handleResetPassword,
    goBack,
    goLogin,
  }
}