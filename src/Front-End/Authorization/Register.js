import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
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

export function useRegister() {
  const router = useRouter()

  const name     = ref('')
  const email    = ref('')
  const phone    = ref('')
  const password = ref('')
  const confirm  = ref('')
  const showPwd  = ref(false)
  const showCfm  = ref(false)

  const fullAddress = ref('')
  const ward        = ref('')
  const wardSearch  = ref('')
  const city        = 'Hà Nội'

  const isLoading = ref(false)
  const errorMsg  = ref('')
  const step      = ref(1)

  const strength = computed(() => {
    const p = password.value
    if (!p) return 0
    let s = 0
    if (p.length >= 8)          s++
    if (/[A-Z]/.test(p))        s++
    if (/[0-9]/.test(p))        s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })
  const strengthLabel = computed(() => ['', 'Weak', 'Fair', 'Good', 'Strong'][strength.value])
  const strengthColor = computed(() => ['', '#D4735A', '#C4A246', '#8BBB6A', '#5A9E7A'][strength.value])

  function onWardInput() {
    const match = ALL_WARDS.find(w => w === wardSearch.value)
    ward.value = match || ''
  }

  function onWardChange() {
    const match = ALL_WARDS.find(w => w === wardSearch.value)
    ward.value = match || ''
  }

  function handleNext() {
    errorMsg.value = ''
    if (!name.value || !email.value || !phone.value || !password.value || !confirm.value) {
      errorMsg.value = 'Vui lòng điền đầy đủ thông tin.'; return
    }
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
    if (!phoneRegex.test(phone.value.replace(/\s/g, ''))) {
      errorMsg.value = 'Số điện thoại không hợp lệ.'; return
    }
    if (password.value !== confirm.value) {
      errorMsg.value = 'Mật khẩu xác nhận không khớp.'; return
    }
    if (strength.value < 2) {
      errorMsg.value = 'Mật khẩu quá yếu, vui lòng chọn mật khẩu mạnh hơn.'; return
    }
    step.value = 2
  }

  async function handleRegister() {
    errorMsg.value = ''
    if (!fullAddress.value) {
      errorMsg.value = 'Vui lòng nhập số nhà, tên đường.'; return
    }
    if (!ward.value) {
      errorMsg.value = 'Vui lòng chọn phường / xã hợp lệ.'; return
    }
    if (isLoading.value) return
    isLoading.value = true
    try {
      const registerRes = await api.post('/auth/register', {
        fullName: name.value,
        email:    email.value,
        phone:    phone.value,
        password: password.value,
        defaultAddress: fullAddress.value + ", " + ward.value + ", "+ city,
        loyaltyPoint: 0,
        tier: {id: 1},
        usedPoint: 0,
        avatar: '/IMG/lel.png'
      })

      // ── LOG để xem backend trả về gì ──
      console.log('✅ Register response:', registerRes.data)

      // Đọc token + customerId từ response (điều chỉnh field name sau khi xem log)
      const token      = registerRes.data?.token
                      ?? registerRes.data?.accessToken
                      ?? null
      const customerId = registerRes.data?.customerId
                      ?? registerRes.data?.id
                      ?? null

      console.log('Token:', token, '| CustomerId:', customerId)

      // ── Bước 2: Lưu địa chỉ ──
      // await api.post('/customers/address', {
      //   customerId,
      //   fullAddress: fullAddress.value,
      //   ward:        ward.value,
      //   city,
      //   isDefault:   true,
      // }, token ? {
      //   headers: { Authorization: `Bearer ${token}` }
      // } : {})

      step.value = 3
    } catch (err) {
      console.error('❌ Error registering:', err.response?.data)
      errorMsg.value = err.response?.data?.message || 'Đăng ký thất bại.'
    } finally {
      isLoading.value = false
    }
  }

  function goBack()  { step.value = 1; errorMsg.value = '' }
  function goLogin() { router.push('/login') }
  function goHome()  { router.push('/homepage') }

  return {
    name, email, phone, password, confirm, showPwd, showCfm,
    fullAddress, ward, wardSearch, ALL_WARDS, city,
    isLoading, errorMsg, step,
    strength, strengthLabel, strengthColor,
    onWardInput, onWardChange,
    handleNext, handleRegister,
    goBack, goLogin, goHome,
  }
}