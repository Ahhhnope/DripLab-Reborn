import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../Authorization/Auth'
import api from '../../api/axios'

const ALL_WARDS = [
  'Phường Hàng Bạc', 'Phường Hàng Bài', 'Phường Hàng Boong', 'Phường Hàng Bồ',
  'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã',
  'Phường Hàng Trống', 'Phường Chương Dương', 'Phường Cửa Đông', 'Phường Cửa Nam',
  'Phường Đồng Xuân', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Phúc Tân',
  'Phường Tràng Tiền', 'Phường Trần Hưng Đạo',
  'Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ',
  'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh',
  'Phường Nhúc Lệ', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công',
  'Phường Trúc Bạch', 'Phường Vĩnh Phúc',
  'Phường Cát Linh', 'Phường Hàng Bột', 'Phường Khâm Thiên', 'Phường Khương Thượng',
  'Phường Kim Liên', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Nam Đồng',
  'Phường Ngã Tư Sở', 'Phường Nguyễn Trãi', 'Phường Ô Chợ Dừa', 'Phường Phương Liên',
  'Phường Phương Mai', 'Phường Quang Trung', 'Phường Quốc Tử Giám', 'Phường Thịnh Quang',
  'Phường Thổ Quan', 'Phường Trung Liệt', 'Phường Trung Phụng', 'Phường Trung Tự',
  'Phường Văn Chương', 'Phường Văn Miếu',
  'Phường Bách Khoa', 'Phường Bạch Đằng', 'Phường Bạch Mai', 'Phường Bùi Thị Xuân',
  'Phường Cầu Dền', 'Phường Đồng Nhân', 'Phường Đồng Tâm', 'Phường Lê Đại Hành',
  'Phường Minh Khai', 'Phường Ngô Thì Nhậm', 'Phường Nguyễn Du', 'Phường Phạm Đình Hổ',
  'Phường Phố Huế', 'Phường Quỳnh Lôi', 'Phường Quỳnh Mai', 'Phường Thanh Lương',
  'Phường Thanh Nhàn', 'Phường Trương Định', 'Phường Tương Mai', 'Phường Vĩnh Tuy',
  'Phường Đại Kim', 'Phường Định Công', 'Phường Giáp Bát', 'Phường Hoàng Liệt',
  'Phường Hoàng Văn Thụ', 'Phường Lĩnh Nam', 'Phường Mai Động', 'Phường Tân Mai',
  'Phường Thanh Trì', 'Phường Thịnh Liệt', 'Phường Trần Phú', 'Phường Vĩnh Hưng', 'Phường Yên Sở',
  'Phường Hạ Đình', 'Phường Khương Đình', 'Phường Khương Mai', 'Phường Khương Trung',
  'Phường Kim Giang', 'Phường Nhân Chính', 'Phường Phương Liệt', 'Phường Thanh Xuân Bắc',
  'Phường Thanh Xuân Nam', 'Phường Thanh Xuân Trung', 'Phường Thượng Đình',
  'Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô',
  'Phường Nghĩa Tân', 'Phường Quan Hoa', 'Phường Trung Hoà', 'Phường Yên Hoà',
  'Phường Bưởi', 'Phường Nhật Tân', 'Phường Phú Thượng', 'Phường Quảng An',
  'Phường Tứ Liên', 'Phường Thuỵ Khuê', 'Phường Xuân La', 'Phường Yên Phụ',
  'Phường Bồ Đề', 'Phường Cự Khối', 'Phường Đức Giang', 'Phường Gia Thuỵ',
  'Phường Giang Biên', 'Phường Long Biên', 'Phường Ngọc Lâm', 'Phường Ngọc Thuỵ',
  'Phường Phúc Đồng', 'Phường Phúc Lợi', 'Phường Sài Đồng', 'Phường Thạch Bàn',
  'Phường Thượng Thanh', 'Phường Việt Hưng',
  'Phường Cổ Nhuế 1', 'Phường Cổ Nhuế 2', 'Phường Đông Ngạc', 'Phường Đức Thắng',
  'Phường Liên Mạc', 'Phường Phú Diễn', 'Phường Phúc Diễn',
  'Phường Tây Tựu', 'Phường Thụy Phương', 'Phường Thượng Cát', 'Phường Xuân Đỉnh', 'Phường Xuân Tảo',
  'Phường Cầu Diễn', 'Phường Đại Mỗ', 'Phường Mễ Trì', 'Phường Mỹ Đình 1',
  'Phường Mỹ Đình 2', 'Phường Phú Đô', 'Phường Phương Canh', 'Phường Tây Mỗ',
  'Phường Trung Văn', 'Phường Xuân Phương',
  'Phường Biên Giang', 'Phường Dương Nội', 'Phường Đồng Mai', 'Phường Hà Cầu',
  'Phường La Khê', 'Phường Mộ Lao', 'Phường Phú La',
  'Phường Phú Lãm', 'Phường Phú Lương', 'Phường Phúc La',
  'Phường Vạn Phúc', 'Phường Văn Quán', 'Phường Yên Nghĩa', 'Phường Yết Kiêu',
  'Xã Đông Anh', 'Xã Sóc Sơn', 'Xã Mê Linh', 'Xã Gia Lâm', 'Xã Thường Tín',
  'Xã Thanh Oai', 'Xã Chương Mỹ', 'Xã Quốc Oai', 'Xã Thạch Thất', 'Xã Phúc Thọ',
].sort((a, b) => a.localeCompare(b, 'vi'))

export function useUserAddress() {
  const router = useRouter()
  const auth   = useAuthStore()

  const currentRoute = '/account/address'
  const city = 'Hà Nội'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',         icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',           icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',  icon: 'package',     route: '/account/orders' },
    { id: 'points',   label: 'Điểm của tôi',      icon: 'loyalty',     route: '/account/points' }
  ]

  // ── Parse địa chỉ hiện tại từ store ra 2 phần ──
  // defaultAddress lưu dạng: "123 Đường Lê Lợi, Phường Hàng Bạc, Hà Nội"
  const currentAddress = auth.user?.defaultAddress || ''
  const parts = currentAddress.split(', ')
  
  const fullAddress = ref(parts[0] || '')
  const wardSearch  = ref(parts[1] || '')
  const ward        = ref(ALL_WARDS.find(w => w === parts[1]) ? parts[1] : '')

  const message     = ref('')
  const messageType = ref('')
  const isLoading   = ref(false)

  function onWardInput() {
    ward.value = ALL_WARDS.find(w => w === wardSearch.value) || ''
  }
  function onWardChange() {
    ward.value = ALL_WARDS.find(w => w === wardSearch.value) || ''
  }

  async function saveAddress() {
    message.value = ''
    if (!fullAddress.value.trim()) {
      message.value     = 'Vui lòng nhập số nhà, tên đường.'
      messageType.value = 'error'
      return
    }
    if (!ward.value) {
      message.value     = 'Vui lòng chọn phường / xã hợp lệ.'
      messageType.value = 'error'
      return
    }
    if (isLoading.value) return
    isLoading.value = true
    try {
      const newAddress = `${fullAddress.value.trim()}, ${ward.value}, ${city}`
      await api.put('/users/me', {
        defaultAddress: newAddress
      })
      // Sync lại store
      auth.user.defaultAddress = newAddress
      message.value     = 'Lưu địa chỉ thành công!'
      messageType.value = 'success'
    } catch (err) {
      console.error('❌ Error saving address:', err.response?.data)
      message.value     = err.response?.data?.message || 'Lưu địa chỉ thất bại.'
      messageType.value = 'error'
    } finally {
      isLoading.value = false
    }
  }

  function goTo(route) { router.push(route) }

  return {
    fullAddress, wardSearch, ward, ALL_WARDS, city,
    navItems, currentRoute,
    message, messageType, isLoading,
    saveAddress, goTo,
    onWardInput, onWardChange,
  }
}