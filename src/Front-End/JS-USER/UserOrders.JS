import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'
import { useAuthStore } from '../Authorization/Auth'
import { sharedUser } from './Useruser.JS'

export function useUserOrders() {
  const auth     = useAuthStore()
  const router   = useRouter()
  const user     = auth.user
  const userId   = auth.user?.id || 1

  const currentRoute = '/account/orders'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',         icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',           icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',  icon: 'package',     route: '/account/orders' },
    { id: 'points',   label: 'Điểm của tôi',      icon: 'loyalty',     route: '/account/points' },
  ]

  // ── Status helpers ───────────────────────────────────────
  const STATUS_ORDER = ['pending', 'processing', 'shipping', 'delivered']

  function mapStatus(s) {
    const map = {
      'Chờ xác nhận':    'pending',
      'Đang xử lý':      'processing',
      'Đang vận chuyển': 'shipping',
      'Đã giao':         'delivered',
      'Đã huỷ':          'cancelled',
    }
    return map[s] ?? s?.toLowerCase() ?? 'pending'
  }

  // ── Order steps (tiến trình) ─────────────────────────────
  const _orderSteps = ref([
    { label: 'Chờ xác nhận',    icon: 'pending_actions', status: 'pending'    },
    { label: 'Đang xử lý',      icon: 'settings',        status: 'processing' },
    { label: 'Đang vận chuyển', icon: 'local_shipping',  status: 'shipping'   },
    { label: 'Đã giao',         icon: 'home',            status: 'delivered'  },
    { label: 'Đã huỷ',          icon: 'cancel',          status: 'cancelled'  },
  ])

  // Đơn hàng active đang được chọn để hiển thị tiến trình
  const activeOrders    = ref([])
  const selectedOrderId = ref(null)
  const currentStatus   = ref('pending')

  const selectedActiveOrder = computed(() =>
    activeOrders.value.find(o => o.id === selectedOrderId.value) || null
  )

  const currentStepIndex = computed(() => {
    if (currentStatus.value === 'cancelled') return -1
    return STATUS_ORDER.indexOf(currentStatus.value)
  })

  const orderSteps = computed(() => {
    if (currentStatus.value === 'cancelled') {
      return _orderSteps.value.map(s =>
        s.status === 'cancelled'
          ? { ...s, state: 'active' }
          : { ...s, state: 'pending' }
      )
    }
    const idx = currentStepIndex.value
    return _orderSteps.value
      .filter(s => s.status !== 'cancelled')
      .map((s, i) => ({
        ...s,
        state: i < idx ? 'done' : i === idx ? 'active' : 'pending',
      }))
  })

  const progressWidth = computed(() => {
    if (currentStatus.value === 'cancelled') return '0%'
    const idx   = currentStepIndex.value
    const total = STATUS_ORDER.length - 1
    return `${Math.max(0, (idx / total) * 100)}%`
  })

  function selectOrder(orderId) {
    selectedOrderId.value = orderId
    const o = activeOrders.value.find(o => o.id === orderId)
    if (o) currentStatus.value = o.status
  }

  // ── Tất cả đơn hàng (active + history gộp chung) ────────
  const allOrders = ref([])

  // Helper map một order từ API → object dùng trong UI
  function mapOrder(order) {
    const totalQty = (order.items ?? []).reduce((s, i) => s + (i.quantity ?? 1), 0)
    return {
      id:              order.id,
      name:            `DL-${order.orderNumber ?? order.id}`,
      status:          mapStatus(order.status),
      paymentMethod:   order.paymentMethod ?? 'Tiền mặt',
      totalQty,
      price:           `${(order.finalPrice ?? 0).toLocaleString('vi-VN')} VNĐ`,
      date:            order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '-',
      shippingAddress: order.shippingAddress ?? '',
      receiptData: {
        id:    `#DL-${order.orderNumber ?? order.id}`,
        date:  order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '-',
        total: `${(order.finalPrice ?? 0).toLocaleString('vi-VN')} VNĐ`,
        items: (order.items ?? []).map(item => ({
          name:     item.drink?.name ?? 'Sản phẩm',
          qty:      item.quantity ?? 1,
          price:    `${((item.basePriceAtPurchase ?? 0) + (item.orderItemToppings ?? []).reduce((s, t) => s + (t.basePriceAtPurchase ?? 0), 0)).toLocaleString('vi-VN')} VNĐ`,
          toppings: (item.orderItemToppings ?? []).map(t => t.topping?.name).filter(Boolean).join(', '),
          img:      item.drink?.imageUrl ?? null,
          sugar:    item.sugarLevel ?? 100,
          ice:      item.iceLevel   ?? 100,
        })),
      },
    }
  }

  // Fetch tất cả đơn hàng của user (gọi 1 endpoint tổng)
  async function fetchAllOrders() {
    try {
      // Thử endpoint tổng trước
      const res = await api.get(`/orders/user/${userId}`)
      if (res.data) {
        allOrders.value = res.data.map(mapOrder)
          // Sắp xếp: đơn mới nhất lên đầu
          .sort((a, b) => b.id - a.id)

        // Tách ra active để hiển thị tiến trình
        activeOrders.value = allOrders.value.filter(
          o => !['delivered', 'cancelled'].includes(o.status)
        )

        if (activeOrders.value.length > 0) {
          // Giữ lại đơn đang chọn nếu vẫn còn active
          if (!activeOrders.value.find(o => o.id === selectedOrderId.value)) {
            selectedOrderId.value = activeOrders.value[0].id
          }
          currentStatus.value = activeOrders.value.find(
            o => o.id === selectedOrderId.value
          )?.status ?? 'pending'
        } else {
          selectedOrderId.value = null
          currentStatus.value   = 'delivered'
        }
        return
      }
    } catch (_) {
      // endpoint tổng chưa có → fallback gọi 2 endpoint riêng
    }

    // Fallback: gọi active + history riêng rồi gộp
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get(`/orders/active/${userId}`).catch(() => ({ data: [] })),
        api.get(`/orders/history/${userId}`).catch(() => ({ data: [] })),
      ])

      const active  = (activeRes.data  ?? []).map(mapOrder)
      const history = (historyRes.data ?? []).map(mapOrder)

      // Gộp, tránh trùng id
      const seen = new Set()
      allOrders.value = [...active, ...history]
        .filter(o => { if (seen.has(o.id)) return false; seen.add(o.id); return true })
        .sort((a, b) => b.id - a.id)

      activeOrders.value = active.filter(
        o => !['delivered', 'cancelled'].includes(o.status)
      )

      if (activeOrders.value.length > 0) {
        if (!activeOrders.value.find(o => o.id === selectedOrderId.value)) {
          selectedOrderId.value = activeOrders.value[0].id
        }
        currentStatus.value = activeOrders.value.find(
          o => o.id === selectedOrderId.value
        )?.status ?? 'pending'
      } else {
        selectedOrderId.value = null
        currentStatus.value   = 'delivered'
      }
    } catch (err) {
      console.error('fetchAllOrders error:', err)
    }
  }

  // ── Filter ───────────────────────────────────────────────
  const searchId       = ref('')
  const filterStatus   = ref('')
  const filterFromDate = ref('')
  const filterToDate   = ref('')
  const showFilter     = ref(false)

  function parseDate(str) {
    if (!str) return null
    const [d, m, y] = str.split('/')
    return new Date(`${y}-${m}-${d}`)
  }

  const filteredOrders = computed(() => {
    const k = searchId.value.trim().toLowerCase()
    return allOrders.value.filter(o => {
      const okId     = !k || o.name.toLowerCase().includes(k)
      const okStatus = !filterStatus.value || o.status === filterStatus.value
      const oDate    = parseDate(o.date)
      const from     = filterFromDate.value ? new Date(filterFromDate.value) : null
      const to       = filterToDate.value   ? new Date(filterToDate.value)   : null
      const okFrom   = !from || oDate >= from
      const okTo     = !to   || oDate <= to
      return okId && okStatus && okFrom && okTo
    })
  })

  const visibleCount = ref(10)

  const pagedOrders = computed(() =>
    filteredOrders.value.slice(0, visibleCount.value)
  )

  const hasMore = computed(() =>
    visibleCount.value < filteredOrders.value.length
  )

  function loadMore() {
    visibleCount.value = Math.min(
      visibleCount.value + 10,
      filteredOrders.value.length
    )
  }

  function applyFilter() {
    visibleCount.value = 10
    showFilter.value   = false
  }

  function resetFilter() {
    searchId.value       = ''
    filterStatus.value   = ''
    filterFromDate.value = ''
    filterToDate.value   = ''
    visibleCount.value   = 10
  }

  // ── Modal xem chi tiết ───────────────────────────────────
  const showModal    = ref(false)
  const selectedOrder = ref(null)

  function openModal(order) {
    selectedOrder.value = order
    showModal.value     = true
  }

  function closeModal() {
    showModal.value = false
  }

  // ── Huỷ đơn ─────────────────────────────────────────────
  const showCancelConfirm = ref(false)
  const cancelTarget      = ref(null)

  function confirmCancel(order) {
    cancelTarget.value      = order
    showCancelConfirm.value = true
  }

  async function doCancel() {
    if (!cancelTarget.value) return
    try {
      await api.put(`/orders/${cancelTarget.value.id}/status`, {
        status: 'Đã huỷ'
      })
      // Cập nhật local ngay, không cần chờ poll
      const target = allOrders.value.find(o => o.id === cancelTarget.value.id)
      if (target) target.status = 'cancelled'

      activeOrders.value = activeOrders.value.filter(
        o => o.id !== cancelTarget.value.id
      )
      if (selectedOrderId.value === cancelTarget.value.id) {
        selectedOrderId.value = activeOrders.value[0]?.id ?? null
        currentStatus.value   = activeOrders.value[0]?.status ?? 'delivered'
      }
    } catch (err) {
      console.error('Cancel order error:', err)
      alert('Huỷ đơn thất bại, vui lòng thử lại!')
    } finally {
      showCancelConfirm.value = false
      cancelTarget.value      = null
    }
  }

  // ── Navigation ───────────────────────────────────────────
  function goTo(route)  { router.push(route) }
  function logout()     { router.push('/login') }

  // ── Polling ──────────────────────────────────────────────
  let intervalId = null

  onMounted(() => {
    fetchAllOrders()
    intervalId = setInterval(fetchAllOrders, 15_000) // poll 15s
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  return {
    user, navItems, currentRoute,
    orderSteps, progressWidth,
    activeOrders, selectedOrderId, selectOrder,
    allOrders, filteredOrders, pagedOrders,
    hasMore, loadMore,
    searchId, filterStatus, filterFromDate, filterToDate,
    showFilter, applyFilter, resetFilter,
    showModal, selectedOrder,
    openModal, closeModal,
    showCancelConfirm, cancelTarget,
    confirmCancel, doCancel,
    goTo, logout,
  }
}