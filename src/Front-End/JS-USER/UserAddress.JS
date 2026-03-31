import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sharedUser } from './Useruser.JS'

export function useUserAddress() {
  const router = useRouter()

  const currentRoute = '/account/address'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',        icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',         icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',          icon: 'package',     route: '/account/orders' },
  ]

  const user = sharedUser

  const addressForm = ref({
    street: '',
    apt:    '',
    city:   '',
    state:  '',
    zip:    ''
  })

  const message     = ref('')
  const messageType = ref('')

  function saveAddress() {
    if (!addressForm.value.street || !addressForm.value.city) {
      message.value     = 'Vui lòng điền địa chỉ đường và thành phố!'
      messageType.value = 'error'
      return
    }
    message.value     = 'Lưu địa chỉ thành công!'
    messageType.value = 'success'
    // Khi có backend: await axios.put('/api/user/address', addressForm.value)
  }

  function goTo(route) { router.push(route) }
  function logout()    { router.push('/login') }

  return {
    user, addressForm,
    navItems, currentRoute,
    message, messageType,
    saveAddress, goTo, logout
  }
}