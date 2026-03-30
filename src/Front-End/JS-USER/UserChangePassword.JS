import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sharedUser } from './Useruser.JS'

export function useUserChangePassword() {
  const router = useRouter()

  const currentRoute = '/account/password'

  const navItems = [
    { id: 'account',  label: 'Tài khoản',         icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu',  icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',          icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',           icon: 'package',     route: '/account/orders' },
  ]

  const user = sharedUser

  const passwordForm = ref({
    current: '',
    newPass: '',
    confirm: ''
  })

  const message     = ref('')
  const messageType = ref('')

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