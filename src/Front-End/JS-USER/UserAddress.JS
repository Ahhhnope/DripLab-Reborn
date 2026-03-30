import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useUserAddress() {
  const router = useRouter()

  const currentRoute = '/account/address'

  const navItems = [
    { id: 'account',  label: 'Tài khoản',        icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa chỉ',         icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',          icon: 'package',     route: '/account/orders' },
  ]

  const user = ref({
    name:   'Tuân Nguyễn Đình',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD1ZW68pBEupULBdQQvsJBx4zsNuuZJGpwXDdh8NbcA8dhyRO-XnKk4_u0vHgK3JS7I3ixMTfi7hQ-h1HgjYX9ViGY18zJeb9jxRrYHmVIMidrVerQicquMEonvthNlHrO5gCKer1L0ST2AjCyTLchpQ7xI3z5hFZZzzYL8uaXzQagiKkZIHHE0xMSaCiBqrYjDMUA_heW5FBT4IcJh8XSknWPwp7RMYR54MokfC-HtDCrfQqX8b3kNsVeIstZdlgCgYiYlL2fE-NC'
  })

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