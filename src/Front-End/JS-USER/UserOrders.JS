import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'
import { useAuthStore } from '../Authorization/Auth'
import { sharedUser } from './Useruser.JS'

function getImageUrl(url) {
    if (!url) return ''
    return url.startsWith('http') ? url : `http://localhost:8080${url}`
}

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
    'Chờ xác nhận':                'pending',
    'Đang xử lý':                  'processing',
    'Đang vận chuyển':             'shipping',
    'Đã giao':                     'delivered',
    'Giao hàng không thành công':  'failed',
    'Đã huỷ':                      'cancelled',
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
      shippingFee:     order.shippingFee ?? 0,
      date:            order.orderDate
                         ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                         : '-',
      shippingAddress: order.shippingAddress ?? '',
      // ✅ Lấy lý do giao thất bại từ note (admin lưu vào note)
      failReason: order.failReason ?? null,
      receiptData: {
        id:    `#DL-${order.orderNumber ?? order.id}`,
        date:  order.orderDate
                 ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                 : '-',
        total: `${(order.finalPrice ?? 0).toLocaleString('vi-VN')} VNĐ`,
        items: (order.items ?? []).map(item => {
          const sizeName  = item.size?.name  ?? null
          const sizePrice = item.size?.price ?? 0

          const toppingList = (item.orderItemToppings ?? []).map(t => ({
          name:  t.topping?.name ?? '',
          price: t.basePriceAtPurchase ?? t.topping?.price ?? 0,
          }))

          const toppingTotal = toppingList.reduce((s, t) => s + t.price, 0)
          const itemUnitPrice = item.basePriceAtPurchase ?? 0


          const basePrice = itemUnitPrice - sizePrice - toppingTotal

          return {
          name:        item.drink?.name ?? 'Sản phẩm',
          qty:         item.quantity ?? 1,
          basePrice:   basePrice,
          total:       itemUnitPrice * (item.quantity ?? 1),  
          sizeName,
          sizeExtra:   sizePrice,                              
          toppings:    toppingList,                            
          img:         getImageUrl(item.drink?.imageUrl ?? null),
          sugar:       item.sugarLevel ?? 100,
          ice:         item.iceLevel   ?? 100,
          }
        }),
      },
    }
  }

  // ── Fetch ────────────────────────────────────────────────
  const allOrders = ref([])

  const dismissedReceiveIds = ref(
    new Set(JSON.parse(localStorage.getItem('dismissedReceive') ?? '[]'))
  )
  const pointedOrderIds = ref(
    new Set(JSON.parse(localStorage.getItem('pointedOrders') ?? '[]'))
  )

  
  // ✅ IDs đơn failed đã đọc thông báo (không nhắc lại)
  const seenFailedIds = ref(
    new Set(JSON.parse(localStorage.getItem('seenFailedOrders') ?? '[]'))
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

      // Kiểm tra đơn delivered → nhắc xác nhận
      checkDeliveredOrders()
      // ✅ Kiểm tra đơn failed → hiện popup thông báo
      checkFailedOrders()

    } catch (err) {
      console.error('fetchAllOrders:', err)
    }
  }

  // ── Popup GIAO HÀNG KHÔNG THÀNH CÔNG ────────────────────
  const showFailedPopup  = ref(false)
  const failedTarget     = ref(null)

  function checkFailedOrders() {
    if (showFailedPopup.value) return

    const failedOrder = allOrders.value.find(
      o => o.status === 'failed' && !seenFailedIds.value.has(o.id)
    )

    if (failedOrder) {
      failedTarget.value   = failedOrder
      showFailedPopup.value = true
    }
  }

  function dismissFailedPopup() {
    if (!failedTarget.value) return
    seenFailedIds.value.add(failedTarget.value.id)
    localStorage.setItem(
      'seenFailedOrders',
      JSON.stringify([...seenFailedIds.value])
    )
    showFailedPopup.value = false
    failedTarget.value    = null
  }

  // ── Kiểm tra đơn delivered cần xác nhận ─────────────────
  function checkDeliveredOrders() {
    if (showReceiveConfirm.value) return

    const pending = allOrders.value.find(
      o => o.status === 'delivered'
        && !dismissedReceiveIds.value.has(o.id)
        && !pointedOrderIds.value.has(o.id)
    )

    if (pending) {
      receiveTarget.value = {
        ...pending,
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

  function triggerReceiveConfirm(order) {
    receiveTarget.value = {
      ...order,
      earnPoints: Math.round(order.finalPriceNum / 1000),
    }
    showReceiveConfirm.value = true
  }

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
    checkDeliveredOrders()
  }

  // ✅ "Không nhận được đơn hàng" → đổi trạng thái về "Đang xử lý"
  async function reportNotReceived() {
    if (!receiveTarget.value) return
    try {
      await api.patch(`/orders/update/${receiveTarget.value.id}`, {
        status: 'Đang xử lý',
        note:   'Khách hàng báo chưa nhận được hàng',
      })
      // Cập nhật local
      const order = allOrders.value.find(o => o.id === receiveTarget.value.id)
      if (order) order.status = 'processing'
      // Cập nhật selectedOrder nếu đang mở modal
      if (selectedOrder.value?.id === receiveTarget.value.id) {
        selectedOrder.value = { ...selectedOrder.value, status: 'processing' }
      }
    } catch (err) {
      console.warn('reportNotReceived API lỗi:', err)
      // Vẫn cập nhật local để UX không bị kẹt
      const order = allOrders.value.find(o => o.id === receiveTarget.value.id)
      if (order) order.status = 'processing'
    } finally {
      showReceiveConfirm.value = false
      receiveTarget.value      = null
    }
  }

  async function doConfirmReceive() {
    if (!receiveTarget.value) return

    pointedOrderIds.value.add(receiveTarget.value.id)
    localStorage.setItem(
      'pointedOrders',
      JSON.stringify([...pointedOrderIds.value])
    )

    earnedPoints.value       = receiveTarget.value.earnPoints
    showReceiveConfirm.value = false
    receiveTarget.value      = null

    showPointsToast.value = true
    setTimeout(() => { showPointsToast.value = false }, 4000)

    checkDeliveredOrders()
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
      await api.put(`/orders/user/cancel/${cancelTarget.value.id}`, {
        status: 'Đã huỷ',
        note:   cancelTarget.value.note || ''
      })
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
    timer = setInterval(fetchAllOrders, 5000)
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
    // ✅ Popup giao hàng không thành công
    showFailedPopup, failedTarget, dismissFailedPopup,
    // ✅ Không nhận được đơn
    reportNotReceived,
    goTo, logout, getImageUrl,
  }
}