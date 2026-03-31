import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sharedUser, saveUserProfile } from './Useruser.JS'

export function useUserAccount() {
  const router = useRouter()

  const activeTab = ref('account')

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',          icon: 'person',      route: '/account'},
    { id: 'password', label: 'Thay đổi mật khẩu',  icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',            icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',   icon: 'package',     route: '/account/orders' },
  ]

 
  const user = sharedUser

  const savedProfile = JSON.parse(localStorage.getItem('userProfile') || 'null')

 const form = ref({
  name:  savedProfile?.name  || 'Tuân Nguyễn Đình',
  email: savedProfile?.email || 'tuan.nguyen@driplab.com',
  phone: savedProfile?.phone || '+84 123 456 789'
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

    if (file.size > 2 * 1024 * 1024) {
      alert('Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      
      user.value.avatar = e.target.result
      pendingAvatar.value = e.target.result
    }
    reader.readAsDataURL(file)
  }


  const pendingAvatar = ref(null)


  function saveProfile() {
      saveUserProfile({
        name:   form.value.name,
        email:  form.value.email,
        phone:  form.value.phone,
        avatar: pendingAvatar.value || user.value.avatar
      })
      pendingAvatar.value = null
      alert('Lưu thành công!')

    // Lưu vào localStorage để giữ sau reload
    localStorage.setItem('userProfile', JSON.stringify({
      name:   user.value.name,
      email:  form.value.email,
      phone:  form.value.phone,
      avatar: user.value.avatar
    }))

    alert('Lưu thành công!')

    // Khi có backend: await axios.put('/api/user/profile', { ...form.value, avatar: user.value.avatar })
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
    navItems, activeTab,
    fileInput, pendingAvatar,
    triggerFileInput, onAvatarChange,
    setTab, saveProfile, savePassword,
    goTo, logout
  }
}
