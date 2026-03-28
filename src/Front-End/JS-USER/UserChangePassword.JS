import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useUserChangePassword() {
  const router = useRouter()

  const currentRoute = '/account/password'

  const navItems = [
    { id: 'account',  label: 'Tài khoản',         icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu',  icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',          icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',           icon: 'package',     route: '/account/orders' },
  ]

  const user = ref({
    name:   'Tuân Nguyễn Đình',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD1ZW68pBEupULBdQQvsJBx4zsNuuZJGpwXDdh8NbcA8dhyRO-XnKk4_u0vHgK3JS7I3ixMTfi7hQ-h1HgjYX9ViGY18zJeb9jxRrYHmVIMidrVerQicquMEonvthNlHrO5gCKer1L0ST2AjCyTLchpQ7xI3z5hFZZzzYL8uaXzQagiKkZIHHE0xMSaCiBqrYjDMUA_heW5FBT4IcJh8XSknWPwp7RMYR54MokfC-HtDCrfQqX8b3kNsVeIstZdlgCgYiYlL2fE-NC'
  })

  const passwordForm = ref({
    current: '',
    newPass: '',
    confirm: ''
  })

  const message     = ref('')
  const messageType = ref('') // 'success' | 'error'

  function savePassword() {
    if (!passwordForm.value.current || !passwordForm.value.newPass) {
      message.value     = 'Vui lòng điền đầy đủ thông tin!'
      messageType.value = 'error'
      return
    }
    if (passwordForm.value.newPass !== passwordForm.value.confirm) {
      message.value     = 'Mật khẩu mới không khớp!'
      messageType.value = 'error'
      return
    }
    message.value     = 'Đổi mật khẩu thành công!'
    messageType.value = 'success'
    passwordForm.value = { current: '', newPass: '', confirm: '' }
    // Khi có backend: await axios.put('/api/user/password', passwordForm.value)
  }

  function goTo(route) {
    router.push(route)
  }

  function logout() {
    router.push('/login')
  }

  return {
    user, passwordForm,
    navItems, currentRoute,
    message, messageType,
    savePassword, goTo, logout
  }
}