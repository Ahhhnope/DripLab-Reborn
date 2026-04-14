import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'

export function useUserOrders() {
  const router = useRouter()
  const currentRoute = '/account/orders'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',         icon: 'person',        route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',          route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',           icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',  icon: 'package',     route: '/account/orders' },
    { id: 'points',   label: 'Điểm của tôi',      icon: 'loyalty',     route: '/account/points' }
  ]

  // Status mapping for the progress bar
  const orderSteps = ref([
    { label: 'Chờ xác nhận',    icon: 'pending_actions',  status: 'Chờ xác nhận' },
    { label: 'Đang xử lý',      icon: 'settings',         status: 'Đang xử lý' },
    { label: 'Đang vận chuyển', icon: 'local_shipping',   status: 'Đang vận chuyển' },
    { label: 'Đã giao',         icon: 'home',             status: 'Đã giao' },
    { label: 'Đã huỷ',          icon: 'cancel',           status: 'Đã huỷ' },
  ])

  const activeOrder = ref([])
  const allReceipts = ref([])
  const currentStatus = ref('Chờ xác nhận')
  const shipping = ref(null) 

  const STATUS_ORDER = ['Chờ xác nhận', 'Đang xử lý', 'Đang vận chuyển', 'Đã giao']


  const fetchUserProfile = async () => {
    try {
      const response = await api.get('http://localhost:8080/api/users/me')
      const userData = response.data
      
      shipping.value = {
        name: userData.fullName || 'Khách hàng',
        phone: userData.phone || 'Chưa có số điện thoại',
        address: userData.defaultAddress || 'Chưa cập nhật địa chỉ'
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      //fallback template
      shipping.value = { 
        name: 'Khách hàng', 
        phone: 'N/A', 
        address: 'Vui lòng cập nhật địa chỉ' 
      }
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await api.get('http://localhost:8080/api/orders')
      const data = response.data

      const active = data.filter(o => o.status !== 'Đã giao' && o.status !== 'Đã huỷ')
      if (active.length > 0) {
        active.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        activeOrder.value = active
        currentStatus.value = active[0].status
      } else {
        activeOrder.value = []
        currentStatus.value = 'Đã giao'
      }

      allReceipts.value = data.filter(o => o.status === 'Đã giao' || o.status === 'Đã huỷ')
        .map(o => ({
          id: `#DL-${o.orderNumber}`,
          category: o.type || 'POS',
          date: new Date(o.orderDate).toLocaleDateString('vi-VN'),
          total: new Intl.NumberFormat('vi-VN').format(o.finalPrice) + ' VNĐ',
          originalPrice: o.originalPrice,
          taxAmount: o.taxAmount,
          finalPrice: o.finalPrice,
          items: o.orderItems || []
        }))
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  onMounted(() => {
    fetchUserProfile()
    fetchOrders()
    // Poll every 10 seconds so the status bar moves automatically when Admin updates
    // YOOOOO WE GOT AUTO UPDATE LESSS GOOOOOOO
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  })

  const searchId = ref('')
  const filterCategory = ref('')
  const showFilter = ref(false)
  const showModal = ref(false)
  const selectedReceipt = ref(null)

  const receipts = computed(() => {
    return allReceipts.value.filter(r => 
      (!searchId.value || r.id.includes(searchId.value)) &&
      (!filterCategory.value || r.category === filterCategory.value)
    )
  })

  const currentStepIndex = computed(() => {
    if (currentStatus.value === 'Đã huỷ') return -1
    return STATUS_ORDER.indexOf(currentStatus.value)
  })

  const stepsWithState = computed(() => {
    if (currentStatus.value === 'Đã huỷ') {
      return orderSteps.value.map(s =>
        s.status === 'Đã huỷ' ? { ...s, state: 'active' } : { ...s, state: 'cancelled-grey' }
      )
    }
    const idx = currentStepIndex.value
    return orderSteps.value
      .filter(s => s.status !== 'Đã huỷ')
      .map((s, i) => ({
        ...s,
        state: i < idx ? 'done' : i === idx ? 'active' : 'pending'
      }))
  })

  const progressWidth = computed(() => {
    if (currentStatus.value === 'Đã huỷ') return '0%'
    const idx = currentStepIndex.value
    return `${Math.max(0, (idx / (STATUS_ORDER.length - 1)) * 100)}%`
  })

  function openModal(receipt) { selectedReceipt.value = receipt; showModal.value = true }
  function closeModal() { showModal.value = false }
  function goTo(route) { router.push(route) }

  return {
    navItems, currentRoute, orderSteps: stepsWithState, progressWidth,
    activeOrder, receipts, searchId, filterCategory, showFilter,
    showModal, selectedReceipt, openModal, closeModal, goTo,
    shipping 
  }
}