import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useUserAccount() {
  const router = useRouter()

  const activeTab = ref('account')

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',          icon: 'person',      route: '/account'},
    { id: 'password', label: 'Thay đổi mật khẩu',  icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa chỉ',            icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',   icon: 'package',     route: '/account/orders' },
  ]

  const user = ref({
    name:   'Tuân Nguyễn Đình',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD1ZW68pBEupULBdQQvsJBx4zsNuuZJGpwXDdh8NbcA8dhyRO-XnKk4_u0vHgK3JS7I3ixMTfi7hQ-h1HgjYX9ViGY18zJeb9jxRrYHmVIMidrVerQicquMEonvthNlHrO5gCKer1L0ST2AjCyTLchpQ7xI3z5hFZZzzYL8uaXzQagiKkZIHHE0xMSaCiBqrYjDMUA_heW5FBT4IcJh8XSknWPwp7RMYR54MokfC-HtDCrfQqX8b3kNsVeIstZdlgCgYiYlL2fE-NC'
  })

  const form = ref({
    name:  'Tuân Nguyễn Đình',
    email: 'tuan.nguyen@driplab.com',
    phone: '+84 123 456 789'
  })

  const passwordForm = ref({
    current: '',
    newPass: '',
    confirm: ''
  })

  const addresses = ref([
    { label: 'Home',   text: '123 Nguyễn Huệ, Quận 1, TP.HCM' },
    { label: 'Office', text: '456 Lê Lợi, Quận 3, TP.HCM' }
  ])

  const orders = ref([
    { id: 'DL00123', date: '20/03/2026', status: 'Delivered', total: 85000 },
    { id: 'DL00118', date: '15/03/2026', status: 'Delivered', total: 120000 },
    { id: 'DL00134', date: '25/03/2026', status: 'Pending',   total: 65000 }
  ])

  
  const fileInput = ref(null)

  
  function triggerFileInput() {
    fileInput.value.click()
  }

  
  function onAvatarChange(event) {
    const file = event.target.files[0]
    if (!file) return

    // Kiểm tra dung lượng max 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      user.value.avatar = e.target.result
      // Khi có backend: upload file lên server
      // const formData = new FormData()
      // formData.append('avatar', file)
      // await axios.post('/api/user/avatar', formData)
    }
    reader.readAsDataURL(file)
  }

  function saveProfile() {
    user.value.name = form.value.name
    alert('Lưu thành công!')
    // Khi có backend: await axios.put('/api/user/profile', form.value)
  }

  function savePassword() {
    if (!passwordForm.value.current || !passwordForm.value.newPass) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }
    if (passwordForm.value.newPass !== passwordForm.value.confirm) {
      alert('Mật khẩu mới không khớp!')
      return
    }
    alert('Đổi mật khẩu thành công!')
    passwordForm.value = { current: '', newPass: '', confirm: '' }
    // Khi có backend: await axios.put('/api/user/password', passwordForm.value)
  }

  function setTab(id) { activeTab.value = id }

  function logout() {
    router.push('/login')
  }

 function goTo(route) {
  router.push(route)
 }

  return {
  user, form, passwordForm,
  addresses, orders,
  navItems,
  activeTab,
  fileInput,           
  triggerFileInput,   
  onAvatarChange,
  setTab, 
  goTo, saveProfile, savePassword, logout
}
}