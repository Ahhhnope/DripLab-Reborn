import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'
import { useAuthStore } from '../Authorization/Auth'
import { sharedUser } from './Useruser.JS'

import matchaNong      from '../IMG/Matcha-latte.png'
import matchaLatte     from '../IMG/Matcha_tea.jpg'
import capuchino       from '../IMG/flat-white.jpg'
import mocha           from '../IMG/mocha.jpg'
import geisha          from '../IMG/geisha.png'
import phinden         from '../IMG/phin_den.jpg'
import phinnau         from '../IMG/phin_nau.jpg'
import coldbrew        from '../IMG/cold_brew_mat_ong.jpg'
import coldbrewmatong  from '../IMG/cold_brew_mat_ong.jpg'
import coldbrewvaihong from '../IMG/cold_brew_vai_hong.jpg'
import bacsiu          from '../IMG/bac_xiu.jpg'
import latte           from '../IMG/coffee_latte.jpg'

export function useUserOrders() {
  const auth = useAuthStore()
  const activeOrder = ref([]) // Keep as array to match your v-for
  const currentStatus = ref('pending')
  const STATUS_ORDER = ['pending', 'processing', 'shipping', 'delivered']

  const userId = auth.user?.id || 1
  const router = useRouter()
  const currentRoute = '/account/orders'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',         icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',           icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',  icon: 'package',     route: '/account/orders' },
    { id: 'points',   label: 'Điểm của tôi',      icon: 'loyalty',     route: '/account/points' }
  ]

  const user = sharedUser

  const orderSteps = ref([
    { label: 'Chờ xác nhận',    icon: 'pending_actions',  status: 'pending'    },
    { label: 'Đang xử lý',      icon: 'settings',         status: 'processing' },
    { label: 'Đang vận chuyển', icon: 'local_shipping',   status: 'shipping'   },
    { label: 'Đã giao',         icon: 'home',             status: 'delivered'  },
    { label: 'Đã huỷ',          icon: 'cancel',           status: 'cancelled'  },
  ])


  const mapStatus = (status) => {
    const map = {
      'Chờ xác nhận': 'pending',
      'Đang xử lý': 'processing',
      'Đang vận chuyển': 'shipping',
      'Đã giao': 'delivered',
      'Đã huỷ': 'cancelled'
    }
    return map[status] || 'pending'
  }

  const currentStepIndex = computed(() => {
    if (currentStatus.value === 'cancelled') return -1
    return STATUS_ORDER.indexOf(currentStatus.value)
  })

  const stepsWithState = computed(() => {
    if (currentStatus.value === 'cancelled') {
      return orderSteps.value.map(s =>
        s.status === 'cancelled'
          ? { ...s, state: 'active' }
          : { ...s, state: 'cancelled-grey' }
      )
    }

    const idx = currentStepIndex.value
    return orderSteps.value
      .filter(s => s.status !== 'cancelled')
      .map((s, i) => ({
        ...s,
        state: i < idx ? 'done' : i === idx ? 'active' : 'pending'
      }))
  })


  const progressWidth = computed(() => {
    if (currentStatus.value === 'cancelled') return '0%'
    const idx = currentStepIndex.value
    const total = STATUS_ORDER.length - 1
    return `${Math.max(0, (idx / total) * 100)}%`
  })

  const shipping = ref({
    name:    'Tuân Nguyễn Đình',
    phone:   '+84 123 456 789',
    address: 'Căn 48b Chung cư Royal City\n72A Nguyễn Trãi, quận Thanh Xuân\nHà Nội\nViệt Nam'
  })

  const allReceipts = ref([])

  const fetchActiveOrder = async () => {
    try {
      const response = await api.get(`/orders/active/${userId}`);
      
      if (response.data && response.data.length > 0) {
        const order = response.data[0]; 
        const mappedStatus = mapStatus(order.status);

        currentStatus.value = mappedStatus;
      
        if (mappedStatus === 'cancelled') {
          activeOrder.value = [];
          currentStatus.value = 'cancelled';
          return;
        }

        activeOrder.value = [{
          id: order.id,
          name: `DL-${order.id}`,
          price: `${order.finalPrice?.toLocaleString()} VNĐ`,
          receiptData: {
            id: `#DL-${order.id}`,
            date: new Date(order.orderDate).toLocaleDateString('vi-VN'),
            total: `${order.finalPrice?.toLocaleString()} VNĐ`,
            
            items: order.items?.map(item => ({
              name: item.drink?.name || 'Sản phẩm',
              qty: item.quantity,
              // Fix the price calculation to include toppings
              price: `${(item.basePriceAtPurchase + (item.orderItemToppings?.reduce((s, t) => s + t.basePriceAtPurchase, 0) || 0)).toLocaleString()} VNĐ`,
              
              // Ensure this string is built correctly
              toppings: item.orderItemToppings?.map(t => t.topping.name).join(', ') || '',
              
              img: item.drink?.imageUrl,
              sugar: 100, // You can replace these with actual data if stored in DB
              ice: 100
            })) || []
          }
        }];
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };


  // ── Filter state ──
  const searchId       = ref('')
  const filterCategory = ref('')
  const filterFromDate = ref('')
  const filterToDate   = ref('')
  const showFilter     = ref(false)

  const categoryOptions = computed(() => {
    const cats = allReceipts.value.map(r => r.category)
    return [...new Set(cats)]
  })

  function parseDate(str) {
    if (!str) return null
    const [d, m, y] = str.split('/')
    return new Date(`${y}-${m}-${d}`)
  }

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

  let intervalId = null;

  onMounted(() => {
    fetchActiveOrder(); // Initial fetch
    
    // Set up the 5-second timer
    intervalId = setInterval(() => {
      fetchActiveOrder();
      console.log('Order status updated'); // Optional for debugging
    }, 5000);
  });

  // Clean up when the component is destroyed
  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });


  return {
    user, navItems, currentRoute,
    orderSteps: stepsWithState, progressWidth,
    currentStatus,
    shipping, activeOrder,
    receipts, hasMore, loadMore,
    searchId, filterCategory, filterFromDate, filterToDate,
    showFilter, categoryOptions,
    applyFilter, resetFilter,
    showModal, selectedReceipt,
    openModal, closeModal,
    goTo, logout, activeOrder,
    currentStatus,
    fetchActiveOrder
  }
}