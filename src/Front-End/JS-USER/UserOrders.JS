import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sharedUser} from './Useruser.JS'

export function useUserOrders() {
  const router = useRouter()

  const currentRoute = '/account/orders'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',        icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',         icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',          icon: 'package',     route: '/account/orders' },
  ]

  const user = sharedUser

  // ── Order Steps ──
  // state: 'done' | 'active' | 'pending'
  const orderSteps = ref([
    { label: 'Chưa giải quyết',    icon: 'check',           state: 'done' },
    { label: 'Đã xác nhận',  icon: 'inventory_2',      state: 'active' },
    { label: 'Đang xử lý', icon: 'settings',         state: 'pending' },
    { label: 'Đang giao hàng',   icon: 'local_shipping',   state: 'pending' },
    { label: 'Đã giao tới',  icon: 'home',             state: 'pending' },
  ])

  const progressWidth = computed(() => {
    const doneCount = orderSteps.value.filter(s => s.state === 'done').length
    const total = orderSteps.value.length - 1
    return `${(doneCount / total) * 100}%`
  })

  // ── Shipping ──
  const shipping = ref({
    name:    'Tuân Nguyễn Đình',
    phone:   '+84 123 456 789',
    address: 'Căn 48b Chung cư Royal City\n72A Nguyễn Trãi, quận Thanh Xuân\nHa Noi\nVietnam'
  })

  // ── Active Order ──
 const activeOrder = ref([
  {
    id: 1,
    name:  'DL-8080-41',
    price: '$45.00',
    receiptData: {
      id: '#DL-8080-41',
      date: '30/03/2026',
      total: '$45.00',
      subtotal: '$42.86',
      tax: '$2.14',
      items: [
        {
          name: 'Drip Lab Coffee Beans',
          qty: 2,
          price: '$45.00',
          img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7'
        }
      ]
    }
  }
])

  // ── Receipts ──
  const allReceipts = ref([
    {
      id: '#DL-9283-01', category: 'Coffee Equipment',
      date: '12/10/2023', total: '$128',
      subtotal: '$59.50', tax: '$2.97',
      items: [
        { name: 'Ethiopian Yirgacheffe', qty: 1, price: '$24.50', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' },
        { name: 'V60 Glass Dripper',     qty: 1, price: '$35.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }
      ]
    },
    {
      id: '#DL-8122-42', category: 'Artisan Beans',
      date: '28/09/2023', total: '$45.00',
      subtotal: '$42.86', tax: '$2.14',
      items: [{ name: 'Artisan Blend Beans', qty: 1, price: '$45.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }]
    },
    {
      id: '#DL-7501-19', category: 'Monthly Subscription',
      date: '01/09/2023', total: '$32.00',
      subtotal: '$30.48', tax: '$1.52',
      items: [{ name: 'Monthly Subscription Box', qty: 1, price: '$32.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }]
    },
    {
      id: '#DL-6401-08', category: 'Coffee Gear',
      date: '15/08/2023', total: '$67.00',
      subtotal: '$63.81', tax: '$3.19',
      items: [{ name: 'Pour Over Kit', qty: 1, price: '$67.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }]
    },
    {
      id: '#DL-5309-33', category: 'Artisan Beans',
      date: '02/07/2023', total: '$28.00',
      subtotal: '$26.67', tax: '$1.33',
      items: [{ name: 'Single Origin Kenya', qty: 1, price: '$28.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }]
    },
    {
      id: '#DL-4201-17', category: 'Coffee Equipment',
      date: '18/06/2023', total: '$95.00',
      subtotal: '$90.48', tax: '$4.52',
      items: [{ name: 'Gooseneck Kettle', qty: 1, price: '$95.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }]
    },
  ])
  
  const visibleCount = ref(3)

  const receipts = computed(() =>
    allReceipts.value.slice(0, visibleCount.value)
  )

  const hasMore = computed(() =>
    visibleCount.value < allReceipts.value.length
  )

  function loadMore() {
    visibleCount.value = Math.min(
      visibleCount.value + 3,
      allReceipts.value.length
    )
  }

  const showModal      = ref(false)
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
    showModal, selectedReceipt,
    openModal, closeModal,
    goTo, logout
  }
}