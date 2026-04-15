import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../Authorization/Auth'
import api from '../../api/axios'

export function useUserAccount() {
  const router = useRouter()
  const authStore = useAuthStore()

  const activeTab = ref('account')

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',         icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',           icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',  icon: 'package',     route: '/account/orders' },
    { id: 'points',   label: 'Điểm của tôi',      icon: 'loyalty',     route: '/account/points' },
  ]

  // Form dữ liệu
  const form = ref({
    fullName: '',
    email: '',
    phone: '',
  })

  const passwordForm = ref({
    current: '',
    newPass: '',
    confirm: '',
  })

  const addresses = ref([])
  const orders = ref([])

  const fileInput = ref(null)
  const pendingAvatar = ref(null)
  const isSaving = ref(false)

  // ====================== ĐỒNG BỘ DỮ LIỆU ======================
  const syncFormFromStore = () => {
    const u = authStore.user
    if (u) {
      form.value.fullName = u.fullName || u.name || ''
      form.value.email    = u.email || ''
      form.value.phone    = u.phone || ''
      
      // Cập nhật địa chỉ mặc định
      addresses.value = [
        { 
          label: 'Địa chỉ mặc định', 
          text: u.defaultAddress || u.address || '' 
        }
      ]
    }
  }

  // Theo dõi và đồng bộ ngay lập tức
  watch(() => authStore.user, syncFormFromStore, { 
    immediate: true,
    deep: true 
  })

  // ====================== CÁC HÀM ======================

  function triggerFileInput() {
    fileInput.value?.click()
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
      pendingAvatar.value = e.target.result
    }
    reader.readAsDataURL(file)
  }

  // Lưu thông tin hồ sơ
  const saveProfile = async () => {
    if (isSaving.value) return
    isSaving.value = true

    try {
      const payload = {
        fullName: form.value.fullName.trim(),
        email:    form.value.email.trim(),
        phone:    form.value.phone.trim(),
      }

      const res = await api.put('/users/me', payload)

      // Cập nhật lại authStore
      authStore.setUser({
        ...authStore.user,
        fullName: res.data.fullName || payload.fullName,
        email:    res.data.email || payload.email,
        phone:    res.data.phone || payload.phone,
      }, authStore.token)

      alert('✅ Lưu thông tin thành công!')
    } catch (err) {
      console.error('Lỗi lưu profile:', err)
      const msg = err.response?.data?.message || 'Lưu thất bại! Vui lòng thử lại.'
      alert(msg)
    } finally {
      isSaving.value = false
    }
  }

  // Đổi mật khẩu
  async function savePassword() {
    if (!passwordForm.value.current || !passwordForm.value.newPass) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }
    if (passwordForm.value.newPass !== passwordForm.value.confirm) {
      alert('Mật khẩu mới không khớp!')
      return
    }

    try {
      await api.put('/users/me/password', {   // ← Nếu backend chưa có endpoint này thì sẽ lỗi
        currentPassword: passwordForm.value.current,
        newPassword: passwordForm.value.newPass,
      })
      alert('✅ Đổi mật khẩu thành công!')
      passwordForm.value = { current: '', newPass: '', confirm: '' }
    } catch (err) {
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại!'
      alert(msg)
    }
  }

  function setTab(id) {
    activeTab.value = id
  }

  function logout() {
    authStore.logout()
    router.push('/login')
  }

  function goTo(route) {
    router.push(route)
  }

  // ====================== RETURN ======================
  return {
    // Dùng trong template
    form,
    passwordForm,
    addresses,
    orders,
    navItems,
    activeTab,
    fileInput,
    pendingAvatar,
    isSaving,

    // Functions
    triggerFileInput,
    onAvatarChange,
    saveProfile,
    savePassword,
    setTab,
    goTo,
    logout,
  }
}