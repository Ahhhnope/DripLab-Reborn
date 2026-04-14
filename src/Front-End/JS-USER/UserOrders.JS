import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
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


const currentStatus = ref('pending')

const STATUS_ORDER = ['pending', 'processing', 'shipping', 'delivered']

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

  const activeOrder = ref([
  {
    id: 1,
    name: 'DL-8080-41',
    price: '193.000 VNĐ',
    receiptData: {
      id: '#DL-8080-41',
      date: '30/03/2026',
      total: '193.000 VNĐ',
      subtotal: '183.810 VNĐ',
      tax: '9.190 VNĐ',
      items: [
        {
          name: 'Cold Brew Mật Ong',
          qty: 1,
          price: '55.000 VNĐ',
          sugar: 75,
          ice: 100,
          img: coldbrewmatong
        },
        {
          name: 'Matcha Latte',
          qty: 2,
          price: '98.000 VNĐ',
          sugar: 50,
          ice: 50,
          img: matchaLatte
        },
        {
          name: 'Bạc Xỉu Kem Xốp',
          qty: 1,
          price: '40.000 VNĐ',
          sugar: 100,
          ice: 25,
          img: bacsiu
        }
      ]
    }
  }
])

const allReceipts = ref([
  {
    id: '#DL-9283-01', category: 'Matcha & Latte',
    date: '12/10/2023', total: '98.000 VNĐ',
    subtotal: '93.350 VNĐ', tax: '4.650 VNĐ',
    items: [
      { name: 'Matcha Nóng',  qty: 1, price: '49.000 VNĐ', sugar: 75,  ice: 0,   img: matchaNong },
      { name: 'Matcha Latte', qty: 1, price: '49.000 VNĐ', sugar: 100, ice: 50,  img: matchaLatte }
    ]
  },
  {
    id: '#DL-8122-42', category: 'Cold Brew',
    date: '28/09/2023', total: '160.000 VNĐ',
    subtotal: '152.380 VNĐ', tax: '7.620 VNĐ',
    items: [
      { name: 'Cold Brew',          qty: 1, price: '50.000 VNĐ', sugar: 50,  ice: 100, img: coldbrew },
      { name: 'Cold Brew Mật Ong',  qty: 1, price: '55.000 VNĐ', sugar: 75,  ice: 75,  img: coldbrewmatong },
      { name: 'Cold Brew Vải Hồng', qty: 1, price: '55.000 VNĐ', sugar: 100, ice: 50,  img: coldbrewvaihong }
    ]
  },
  {
    id: '#DL-7501-19', category: 'Cà phê Phin',
    date: '01/09/2023', total: '58.000 VNĐ',
    subtotal: '55.240 VNĐ', tax: '2.760 VNĐ',
    items: [
      { name: 'Cà phê Phin Đen', qty: 1, price: '29.000 VNĐ', sugar: 0,   ice: 0,   img: phinden },
      { name: 'Cà phê Phin Nâu', qty: 1, price: '29.000 VNĐ', sugar: 50,  ice: 25,  img: phinnau }
    ]
  },
  {
    id: '#DL-6401-08', category: 'Đặc biệt',
    date: '15/08/2023', total: '130.000 VNĐ',
    subtotal: '123.810 VNĐ', tax: '6.190 VNĐ',
    items: [
      { name: 'Geisha',       qty: 1, price: '35.000 VNĐ', sugar: 75,  ice: 75,  img: geisha },
      { name: 'Mocha',        qty: 1, price: '35.000 VNĐ', sugar: 100, ice: 100, img: mocha },
      { name: 'Caffee Latte', qty: 1, price: '60.000 VNĐ', sugar: 50,  ice: 50,  img: latte }
    ]
  },
  {
    id: '#DL-5309-33', category: 'Kem & Bạc Xỉu',
    date: '02/07/2023', total: '110.000 VNĐ',
    subtotal: '104.760 VNĐ', tax: '5.240 VNĐ',
    items: [
      { name: 'Bạc Xỉu Kem Xốp', qty: 1, price: '40.000 VNĐ', sugar: 100, ice: 25,  img: bacsiu },
      { name: 'Capuchino',        qty: 2, price: '70.000 VNĐ', sugar: 75,  ice: 0,   img: capuchino }
    ]
  },
  {
    id: '#DL-4201-17', category: 'Combo Mix',
    date: '18/06/2023', total: '183.000 VNĐ',
    subtotal: '174.290 VNĐ', tax: '8.710 VNĐ',
    items: [
      { name: 'Matcha Nóng',      qty: 1, price: '49.000 VNĐ', sugar: 75,  ice: 0,   img: matchaNong },
      { name: 'Cold Brew',        qty: 1, price: '50.000 VNĐ', sugar: 50,  ice: 100, img: coldbrew },
      { name: 'Bạc Xỉu Kem Xốp', qty: 1, price: '40.000 VNĐ', sugar: 100, ice: 25,  img: bacsiu },
      { name: 'Caffee Latte',     qty: 1, price: '60.000 VNĐ', sugar: 50,  ice: 50,  img: latte }
    ]
  },
])

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
    goTo, logout
  }
}