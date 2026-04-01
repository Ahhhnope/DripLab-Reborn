import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sharedUser } from './Useruser.JS'

export function useUserOrders() {
  const router = useRouter()
  const currentRoute = '/account/orders'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',         icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',            icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',   icon: 'package',     route: '/account/orders' },
  ]

  const user = sharedUser

  const orderSteps = ref([
    { label: 'Chờ xử lý',      icon: 'check',          state: 'done' },
    { label: 'Đã xác nhận',    icon: 'inventory_2',    state: 'active' },
    { label: 'Đang xử lý',     icon: 'settings',       state: 'pending' },
    { label: 'Đang giao hàng', icon: 'local_shipping', state: 'pending' },
    { label: 'Đã giao tới',    icon: 'home',           state: 'pending' },
  ])

  const progressWidth = computed(() => {
    const doneCount = orderSteps.value.filter(s => s.state === 'done').length
    const total = orderSteps.value.length - 1
    return `${(doneCount / total) * 100}%`
  })

  const shipping = ref({
    name:    'Tuân Nguyễn Đình',
    phone:   '+84 123 456 789',
    address: 'Căn 48b Chung cư Royal City\n72A Nguyễn Trãi, quận Thanh Xuân\nHà Nội\nViệt Nam'
  })

  const activeOrder = ref([
    {
      id: 1,
      name:  'DL-8080-41',
      price: '450.000 VNĐ',
      receiptData: {
        id: '#DL-8080-41', date: '30/03/2026',
        total: '450.000 VNĐ', subtotal: '428.600 VNĐ', tax: '21.400 VNĐ',
        items: [{
          name: 'Cà phê hạt Drip Lab', qty: 2, price: '450.000 VNĐ',
          img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7'
        }]
      }
    }
  ])

  const allReceipts = ref([
    {
      id: '#DL-9283-01', category: 'Thiết bị cà phê',
      date: '12/10/2023', total: '1.280.000 VNĐ',
      subtotal: '1.219.050 VNĐ', tax: '60.950 VNĐ',
      items: [
        { name: 'Ethiopian Yirgacheffe', qty: 1, price: '245.000 VNĐ', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' },
        { name: 'Bình pha V60',          qty: 1, price: '350.000 VNĐ', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }
      ]
    },
    {
      id: '#DL-8122-42', category: 'Cà phê thủ công',
      date: '28/09/2023', total: '450.000 VNĐ',
      subtotal: '428.600 VNĐ', tax: '21.400 VNĐ',
      items: [{ name: 'Cà phê Artisan Blend', qty: 1, price: '450.000 VNĐ', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }]
    },
    {
      id: '#DL-7501-19', category: 'Gói đăng ký hàng tháng',
      date: '01/09/2023', total: '320.000 VNĐ',
      subtotal: '304.800 VNĐ', tax: '15.200 VNĐ',
      items: [{ name: 'Hộp đăng ký hàng tháng', qty: 1, price: '320.000 VNĐ', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }]
    },
    {
      id: '#DL-6401-08', category: 'Dụng cụ cà phê',
      date: '15/08/2023', total: '670.000 VNĐ',
      subtotal: '638.100 VNĐ', tax: '31.900 VNĐ',
      items: [{ name: 'Bộ dụng cụ Pour Over', qty: 1, price: '670.000 VNĐ', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }]
    },
    {
      id: '#DL-5309-33', category: 'Cà phê thủ công',
      date: '02/07/2023', total: '280.000 VNĐ',
      subtotal: '266.700 VNĐ', tax: '13.300 VNĐ',
      items: [{ name: 'Cà phê Single Origin Kenya', qty: 1, price: '280.000 VNĐ', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }]
    },
    {
      id: '#DL-4201-17', category: 'Thiết bị cà phê',
      date: '18/06/2023', total: '950.000 VNĐ',
      subtotal: '904.800 VNĐ', tax: '45.200 VNĐ',
      items: [{ name: 'Ấm cổ ngỗng Gooseneck', qty: 1, price: '950.000 VNĐ', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }]
    },
  ])

  // ── Filter state ──
  const searchId       = ref('')
  const filterCategory = ref('')
  const filterFromDate = ref('')
  const filterToDate   = ref('')
  const showFilter     = ref(false)

  // Danh sách category duy nhất để hiện trong dropdown
  const categoryOptions = computed(() => {
    const cats = allReceipts.value.map(r => r.category)
    return [...new Set(cats)]
  })

  // ── Parse date dd/mm/yyyy → Date ──
  function parseDate(str) {
    if (!str) return null
    const [d, m, y] = str.split('/')
    return new Date(`${y}-${m}-${d}`)
  }

  // ── Filtered + sliced ──
  const filteredReceipts = computed(() => {
    return allReceipts.value.filter(r => {
      const matchId = !searchId.value ||
        r.id.toLowerCase().includes(searchId.value.toLowerCase())

      const matchCategory = !filterCategory.value ||
        r.category === filterCategory.value

      const rDate    = parseDate(r.date)
      const fromDate = filterFromDate.value ? new Date(filterFromDate.value) : null
      const toDate   = filterToDate.value   ? new Date(filterToDate.value)   : null

      const matchFrom = !fromDate || rDate >= fromDate
      const matchTo   = !toDate   || rDate <= toDate

      return matchId && matchCategory && matchFrom && matchTo
    })
  })

  const visibleCount = ref(3)

  const receipts = computed(() =>
    filteredReceipts.value.slice(0, visibleCount.value)
  )

  const hasMore = computed(() =>
    visibleCount.value < filteredReceipts.value.length
  )

  function loadMore() {
    visibleCount.value = Math.min(
      visibleCount.value + 3,
      filteredReceipts.value.length
    )
  }

  function applyFilter() {
    visibleCount.value = 3
    showFilter.value   = false
  }

  function resetFilter() {
    searchId.value       = ''
    filterCategory.value = ''
    filterFromDate.value = ''
    filterToDate.value   = ''
    visibleCount.value   = 3
  }

  const showModal       = ref(false)
  const selectedReceipt = ref(null)

  function openModal(receipt) {
    selectedReceipt.value = receipt
    showModal.value = true
  }

  function closeModal() { showModal.value = false }
  function goTo(route)  { router.push(route) }
  function logout()     { router.push('/login') }

  return {
    user, navItems, currentRoute,
    orderSteps, progressWidth,
    shipping, activeOrder,
    receipts, hasMore, loadMore,
    searchId, filterCategory, filterFromDate, filterToDate,
    showFilter, categoryOptions,
    applyFilter, resetFilter,
    showModal, selectedReceipt,
    openModal, closeModal,
    goTo, logout
  }
}