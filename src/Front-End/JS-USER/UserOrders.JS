import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'
import { useAuthStore } from '../Authorization/Auth'
import { sharedUser } from './Useruser.JS'

export function useUserOrders() {
  const auth   = useAuthStore()
  const router = useRouter()
  const user   = sharedUser
  const userId = auth.user?.id || 1

  const currentRoute = '/account/orders'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',         icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',           icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',  icon: 'package',     route: '/account/orders' },
    { id: 'points',   label: 'Điểm của tôi',      icon: 'loyalty',     route: '/account/points' },
  ]

  // ── Status ───────────────────────────────────────────────
  const STATUS_MAP = {
    'Chờ xác nhận':    'pending',
    'Đang xử lý':      'processing',
    'Đang vận chuyển': 'shipping',
    'Đã giao':         'delivered',
    'Đã huỷ':          'cancelled',
  }

  function mapStatus(s) {
    return STATUS_MAP[s] ?? s?.toLowerCase() ?? 'pending'
  }

  // ── Map order từ API ─────────────────────────────────────
  function mapOrder(order) {
    const totalQty = (order.items ?? []).reduce((s, i) => s + (i.quantity ?? 1), 0)

    return {
      id:              order.id,
      name:            `DL-${order.orderNumber ?? order.id}`,
      status:          mapStatus(order.status),
      paymentMethod:   order.paymentMethod ?? 'Tiền mặt',
      totalQty,
      price:           `${(order.finalPrice ?? 0).toLocaleString('vi-VN')} VNĐ`,
      finalPriceNum:   order.finalPrice ?? 0,
      date:            order.orderDate
                         ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                         : '-',
      shippingAddress: order.shippingAddress ?? '',
      receiptData: {
        id:    `#DL-${order.orderNumber ?? order.id}`,
        date:  order.orderDate
                 ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                 : '-',
        total: `${(order.finalPrice ?? 0).toLocaleString('vi-VN')} VNĐ`,
        items: (order.items ?? []).map(item => {
          // Size
          const sizeName  = item.size?.name  ?? null
          const sizePrice = item.size?.price ?? 0

          // Toppings với từng giá riêng
          const toppingList = (item.orderItemToppings ?? []).map(t => ({
            name:  t.topping?.name ?? '',
            price: t.basePriceAtPurchase ?? t.topping?.price ?? 0,
          }))

          const toppingTotal = toppingList.reduce((s, t) => s + t.price, 0)

          const itemUnitPrice = (item.basePriceAtPurchase ?? 0) + sizePrice + toppingTotal

          return {
            name:        item.drink?.name ?? 'Sản phẩm',
            qty:         item.quantity ?? 1,
            price:       `${(itemUnitPrice * (item.quantity ?? 1)).toLocaleString('vi-VN')} VNĐ`,
            // Size
            sizeName,
            sizePrice,
            // Toppings
            toppingList,
            // Compat cũ
            toppings:    toppingList.map(t => t.name).join(', '),
            img:         item.drink?.imageUrl ?? null,
            sugar:       item.sugarLevel ?? 100,
            ice:         item.iceLevel   ?? 100,
          }
        }),
      },
    }
  }

  // ── Fetch ────────────────────────────────────────────────
  const allOrders = ref([])

  // IDs đơn delivered đã nhắc xác nhận (không nhắc lại)
  const dismissedReceiveIds = ref(
    new Set(JSON.parse(localStorage.getItem('dismissedReceive') ?? '[]'))
  )
  // IDs đơn đã tích điểm rồi
  const pointedOrderIds = ref(
    new Set(JSON.parse(localStorage.getItem('pointedOrders') ?? '[]'))
  )

  async function fetchAllOrders() {
    try {
      let data = null

      try {
        const res = await api.get(`/orders/user/${userId}`)
        data = res.data
      } catch {
        const [a, h] = await Promise.all([
          api.get(`/orders/active/${userId}`).catch(() => ({ data: [] })),
          api.get(`/orders/history/${userId}`).catch(() => ({ data: [] })),
        ])
        const seen = new Set()
        data = [...(a.data ?? []), ...(h.data ?? [])].filter(o => {
          if (seen.has(o.id)) return false
          seen.add(o.id)
          return true
        })
      }

      allOrders.value = (data ?? [])
        .map(mapOrder)
        .sort((a, b) => b.id - a.id)

      // Kiểm tra đơn nào vừa chuyển sang "delivered" → nhắc xác nhận
      checkDeliveredOrders()

    } catch (err) {
      console.error('fetchAllOrders:', err)
    }
  }

  // ── Kiểm tra đơn delivered cần xác nhận ─────────────────
  function checkDeliveredOrders() {
    if (showReceiveConfirm.value) return // đang hiện popup rồi

    const pending = allOrders.value.find(
      o => o.status === 'delivered'
        && !dismissedReceiveIds.value.has(o.id)
        && !pointedOrderIds.value.has(o.id)
    )

    if (pending) {
      receiveTarget.value = {
        ...pending,
        // Tính điểm = 1 điểm / 1000 VNĐ, làm tròn
        earnPoints: Math.round(pending.finalPriceNum / 1000),
      }
      showReceiveConfirm.value = true
    }
  }

  // ── Xác nhận nhận hàng + tích điểm ─────────────────────
  const showReceiveConfirm = ref(false)
  const receiveTarget      = ref(null)
  const showPointsToast    = ref(false)
  const earnedPoints       = ref(0)

  // Kích hoạt popup xác nhận từ bên ngoài (nút trong modal)
  function triggerReceiveConfirm(order) {
    receiveTarget.value = {
      ...order,
      earnPoints: Math.round(order.finalPriceNum / 1000),
    }
    showReceiveConfirm.value = true
  }

  // Kiểm tra đơn đã tích điểm chưa (dùng trong template)
  function isPointed(orderId) {
    return pointedOrderIds.value.has(orderId)
  }

  function dismissReceive() {
    if (!receiveTarget.value) return
    dismissedReceiveIds.value.add(receiveTarget.value.id)
    localStorage.setItem(
      'dismissedReceive',
      JSON.stringify([...dismissedReceiveIds.value])
    )
    showReceiveConfirm.value = false
    receiveTarget.value      = null
  }

  async function doConfirmReceive() {
    if (!receiveTarget.value) return
    try {
      // Gọi API cộng điểm
      await api.post(`/customers/${userId}/points`, {
        orderId: receiveTarget.value.id,
        points:  receiveTarget.value.earnPoints,
      })
    } catch (err) {
      console.warn('points API chưa có, cộng local:', err)
    }

    // Đánh dấu đã tích điểm
    pointedOrderIds.value.add(receiveTarget.value.id)
    localStorage.setItem(
      'pointedOrders',
      JSON.stringify([...pointedOrderIds.value])
    )

    earnedPoints.value       = receiveTarget.value.earnPoints
    showReceiveConfirm.value = false
    receiveTarget.value      = null

    // Hiện toast
    showPointsToast.value = true
    setTimeout(() => { showPointsToast.value = false }, 4000)
  }

  // ── Filter ───────────────────────────────────────────────
  const searchId       = ref('')
  const filterStatus   = ref('')
  const filterFromDate = ref('')
  const filterToDate   = ref('')

  const hasActiveFilter = computed(() =>
    !!searchId.value || !!filterFromDate.value || !!filterToDate.value
  )

  function setStatusTab(val) {
    filterStatus.value = val
    visibleCount.value = 10
  }

  function countByStatus(status) {
    return allOrders.value.filter(o => o.status === status).length
  }

  function parseDate(str) {
    if (!str) return null
    const [d, m, y] = str.split('/')
    return new Date(`${y}-${m}-${d}`)
  }

  const filteredOrders = computed(() => {
    const k = searchId.value.trim().toLowerCase()
    return allOrders.value.filter(o => {
      const okStatus = !filterStatus.value || o.status === filterStatus.value
      const okId     = !k || o.name.toLowerCase().includes(k)
      const oDate    = parseDate(o.date)
      const from     = filterFromDate.value ? new Date(filterFromDate.value) : null
      const to       = filterToDate.value   ? new Date(filterToDate.value)   : null
      return okStatus && okId
        && (!from || oDate >= from)
        && (!to   || oDate <= to)
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
    visibleCount.value = Math.min(visibleCount.value + 10, filteredOrders.value.length)
  }

  function resetFilter() {
    searchId.value       = ''
    filterFromDate.value = ''
    filterToDate.value   = ''
    visibleCount.value   = 10
  }

  // ── Modal chi tiết ───────────────────────────────────────
  const showModal     = ref(false)
  const selectedOrder = ref(null)

  function openModal(order) {
    selectedOrder.value = order
    showModal.value     = true
  }
  function closeModal() { showModal.value = false }

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
      await api.put(`/orders/${cancelTarget.value.id}/status`, { status: 'Đã huỷ' })
      const t = allOrders.value.find(o => o.id === cancelTarget.value.id)
      if (t) t.status = 'cancelled'
    } catch (err) {
      console.error('Cancel error:', err)
      alert('Huỷ đơn thất bại, vui lòng thử lại!')
    } finally {
      showCancelConfirm.value = false
      cancelTarget.value      = null
    }
  }

  // ── Nav ──────────────────────────────────────────────────
  function goTo(route)  { router.push(route) }
  function logout()     { router.push('/login') }

  // ── Polling ──────────────────────────────────────────────
  let timer = null
  onMounted(() => {
    fetchAllOrders()
    timer = setInterval(fetchAllOrders, 15_000)
  })
  onUnmounted(() => { if (timer) clearInterval(timer) })

  return {
    user, navItems, currentRoute,
    allOrders, filteredOrders, pagedOrders,
    hasMore, loadMore,
    searchId, filterStatus, filterFromDate, filterToDate,
    hasActiveFilter, resetFilter, setStatusTab, countByStatus,
    showModal, selectedOrder, openModal, closeModal,
    showCancelConfirm, cancelTarget, confirmCancel, doCancel,
    showReceiveConfirm, receiveTarget, dismissReceive, doConfirmReceive,
    triggerReceiveConfirm, isPointed,
    showPointsToast, earnedPoints,
    goTo, logout,
  }
}