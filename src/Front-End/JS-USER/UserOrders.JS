import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export function useUserOrders() {
  const router = useRouter()

  const currentRoute = '/account/orders'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',        icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa chỉ',         icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',          icon: 'package',     route: '/account/orders' },
  ]

  const user = ref({
    name:   'Tuân Nguyễn Đình',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD1ZW68pBEupULBdQQvsJBx4zsNuuZJGpwXDdh8NbcA8dhyRO-XnKk4_u0vHgK3JS7I3ixMTfi7hQ-h1HgjYX9ViGY18zJeb9jxRrYHmVIMidrVerQicquMEonvthNlHrO5gCKer1L0ST2AjCyTLchpQ7xI3z5hFZZzzYL8uaXzQagiKkZIHHE0xMSaCiBqrYjDMUA_heW5FBT4IcJh8XSknWPwp7RMYR54MokfC-HtDCrfQqX8b3kNsVeIstZdlgCgYiYlL2fE-NC'
  })

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
    address: 'số 208 Nguyễn Hữu Cảnh, phường 22, Quận 9\nHo Chi Minh City, 70000\nVietnam'
  })

  // ── Active Order ──
  const activeOrder = ref([
    {
      id: 1,
      name:  'Drip Lab Coffee Beans',
      qty:   2,
      price: '$45.00',
      badge: 'Freshly Roasted',
      img:   'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7'
    }
  ])

  // ── Receipts ──
  const receipts = ref([
    {
      id: '#DL-9283-01', category: 'Coffee Equipment',
      date: 'Oct 12, 2023', total: '$128.50',
      subtotal: '$59.50', tax: '$2.97',
      items: [
        { name: 'Ethiopian Yirgacheffe', qty: 1, price: '$24.50', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' },
        { name: 'V60 Glass Dripper',     qty: 1, price: '$35.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }
      ]
    },
    {
      id: '#DL-8122-42', category: 'Artisan Beans',
      date: 'Sep 28, 2023', total: '$45.00',
      subtotal: '$42.86', tax: '$2.14',
      items: [
        { name: 'Artisan Blend Beans', qty: 1, price: '$45.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }
      ]
    },
    {
      id: '#DL-7501-19', category: 'Monthly Subscription',
      date: 'Sep 01, 2023', total: '$32.00',
      subtotal: '$30.48', tax: '$1.52',
      items: [
        { name: 'Monthly Subscription Box', qty: 1, price: '$32.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF3ymhvLzgh6BuIPZVCkkrYZEk8qLLyQCrQg0gDcX4HzlNsmQvgVTFvcSS41XxWzzaXhdYh5Fmx9yWUUR63_HpQbx7TjamJ9i-9gmcYtn1lMLCZ216G4k68yraLLheA-AjyHl5gSPAstIMGf9zFxKnCYe278OWG86ti1M9r8bofaVfaVO1Lv2w-hWZCzeU2AU5aFFEpYZZEzvwXUkcAogawDETbmi34D4jGjJvLJZjuTzkaymn1VRcPESonSf3TywrX9n0NU746m7' }
      ]
    }
  ])

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
    receipts, showModal, selectedReceipt,
    openModal, closeModal,
    goTo, logout
  }
}