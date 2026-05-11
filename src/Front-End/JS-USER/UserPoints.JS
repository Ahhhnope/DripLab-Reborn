import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sharedUser } from './Useruser.JS'
import api from '../../api/axios'
import { useAuthStore } from '../Authorization/Auth'

export function useUserPoints() {
  const router       = useRouter()
  const auth         = useAuthStore()
  const currentRoute = '/account/points'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',         icon: 'person',      route: '/account'          },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',            icon: 'location_on', route: '/account/address'  },
    { id: 'orders',   label: 'Đơn hàng của tôi',   icon: 'package',     route: '/account/orders'   },
    { id: 'points',   label: 'Điểm của tôi',       icon: 'loyalty',     route: '/account/points'   },
  ]

  const user = sharedUser

  // ── userId từ auth store ────────────────────────────────────
  const userId = computed(() => auth.user?.id ?? null)

  // ══════════════════════════════════════════════════════════
  //  ĐIỂM TÍCH LŨY
  // ══════════════════════════════════════════════════════════
  const myPoints   = ref(0)
  const usedPoints = ref(0)

  const nextTier = computed(() => currentTierObj.value.next || 'MAX');
  const nextTierPoints = computed(() => currentTierObj.value.nextMin || currentTierObj.value.minPoint);

  async function loadPoints() {
    if (!userId.value) return
    try {
      // GET /customers/me → trả về { loyaltyPoint, usedPoint, ... }
      const res = await api.get('/users/me')
      myPoints.value   = res.data.loyaltyPoint ?? 0
      usedPoints.value = res.data.usedPoint    ?? 0
    } catch (e) {
      console.error('Không thể tải điểm:', e)
    }
  }

  // ── Hạng thành viên ────────────────────────────────────────
  const TIERS = ref([
    { name: 'Bạc',       minPoint: 0,      next: 'Vàng',      nextMin: 50000  },
    { name: 'Vàng',      minPoint: 50000,  next: 'Kim cương', nextMin: 150000 },
    { name: 'Kim cương', minPoint: 150000, next: null,        nextMin: null   },
  ]) //backup data :))))

  async function loadTiers() {
    if (!userId.value) return
    try {
      const res = await api.get('/tiers')

      const sorted = res.data.sort((a, b) => a.minPoint - b.minPoint)

      TIERS.value = sorted.map((t, index) => ({
        id: t.id,
        name: t.name,
        minPoint: t.minPoint,
        next: sorted[index + 1] ? sorted[index + 1].name : 'GOD ALMIGHTY',
        nextMin: sorted[index + 1] ? sorted[index + 1].minPoint : null
      }))
    } catch (e) {
      console.error('Lỗi tải tier thành viên: ', e)
    }
  }

  const currentTierObj = computed(() => {
    if (TIERS.value.length === 0) return { name: '...', minPoint: 0 }
    return [...TIERS.value].reverse().find(t => myPoints.value >= t.minPoint) || TIERS.value[0]
  })

  const currentTier    = computed(() => currentTierObj.value.name)

  const progress = computed(() => {
    const currentMin = currentTierObj.value.min || 0
    const nextTarget = currentTierObj.value.nextMin

    if (!currentTierObj.value.next) return 100 // 100% reached
    const totalNeededForNext = nextTarget - currentMin
    const pointsGainedInCurrentTier = myPoints.value - currentMin
      
    return Math.max(0, Math.min(Math.round((pointsGainedInCurrentTier / totalNeededForNext) * 100), 100))
  })

  // ══════════════════════════════════════════════════════════
  //  VOUCHERS — Đổi thưởng
  //  Gọi GET /promo-codes/rewards (display_location = 'đổi thưởng')
  // ══════════════════════════════════════════════════════════
  const vouchers      = ref([])
  const savedPromoIds = ref([])   // id các mã user đã đổi

  async function loadVouchers() {
    try {
      const res = await api.get('/promo-codes/rewards')
      vouchers.value = res.data
    } catch (e) {
      console.error('Không thể tải voucher đổi thưởng:', e)
    }
  }

  async function loadSavedPromos() {
    if (!userId.value) return
    try {
      const res = await api.get('/promo-codes/my-promos', {
        params: { userId: userId.value }
      })
      savedPromoIds.value = res.data.map(v => v.id)
    } catch (e) {
      console.error('Không thể tải kho mã:', e)
    }
  }

  /** Kiểm tra user có thể đổi voucher này không */
  function canRedeem(voucher) {
    if (!userId.value) return false
    if (savedPromoIds.value.includes(voucher.id)) return false
    if (voucher.quantity <= 0) return false
    // Nếu muốn trừ điểm: thêm field pointCost vào DB và so sánh ở đây
    // return myPoints.value >= voucher.pointCost
    return true
  }

  function isAlreadySaved(voucherId) {
    return savedPromoIds.value.includes(voucherId)
  }

  /** Bấm "Đổi ngay" */
  async function redeem(voucher) {
    if (!canRedeem(voucher)) return
    if (!userId.value) { showToast('Vui lòng đăng nhập!', 'error'); return }

    try {
      // Lưu mã vào kho của user + trừ quantity
      await api.post(`/promo-codes/${voucher.id}/save`, null, {
        params: { userId: userId.value }
      })

      // Cập nhật local ngay, không cần reload toàn bộ
      savedPromoIds.value.push(voucher.id)

      // Trừ quantity hiển thị local
      const v = vouchers.value.find(v => v.id === voucher.id)
      if (v) v.quantity = Math.max(0, (v.quantity ?? 1) - 1)

      // Refresh điểm từ server (nếu backend trừ điểm)
      await loadPoints()

      // Ghi vào lịch sử
      pointHistory.value.unshift({
        type: 'use',
        desc: `Đổi voucher: ${voucher.name}`,
        date: new Date().toLocaleDateString('vi-VN'),
        pts:  0,  // thay bằng voucher.pointCost khi có field đó
      })

      showToast(`Đổi thành công: ${voucher.name}!`, 'success')
    } catch (e) {
      showToast(e.response?.data?.message || 'Lỗi khi đổi voucher', 'error')
    }
  }

  /** Format giá trị hiển thị trên card */
  function fmtValue(v) {
    return v.category === 'PHẦN TRĂM'
      ? v.value + '%'
      : (+v.value).toLocaleString('vi-VN') + 'đ'
  }

  /** Màu tag theo loại voucher */
  function tagColor(v) {
    return v.category === 'PHẦN TRĂM' ? 'tag-orange' : 'tag-green'
  }

  // ══════════════════════════════════════════════════════════
  //  LỊCH SỬ ĐIỂM
  // ══════════════════════════════════════════════════════════
  const pointHistory = ref([])

  async function loadHistory() {
    if (!userId.value) return
    try {
      // Khi có API: const res = await api.get('/customers/me/point-history')
      // pointHistory.value = res.data
      // Tạm dùng data mẫu
      pointHistory.value = [
        { type: 'earn', desc: 'Đặt hàng #DL-8080-41',  date: '30/03/2026', pts: 193   },
        { type: 'use',  desc: 'Đổi voucher: Giảm 10%', date: '25/03/2026', pts: 20000 },
        { type: 'earn', desc: 'Đặt hàng #DL-6401-08',  date: '15/08/2023', pts: 130   },
        { type: 'earn', desc: 'Đặt hàng #DL-7501-19',  date: '01/09/2023', pts: 58    },
        { type: 'earn', desc: 'Đặt hàng #DL-8122-42',  date: '28/09/2023', pts: 160   },
        { type: 'earn', desc: 'Đặt hàng #DL-9283-01',  date: '12/10/2023', pts: 98    },
      ]
    } catch (e) {
      console.error('Không thể tải lịch sử điểm:', e)
    }
  }

  // ══════════════════════════════════════════════════════════
  //  TOAST
  // ══════════════════════════════════════════════════════════
  const toastVisible = ref(false)
  const toastMessage = ref('')
  const toastType    = ref('success')

  function showToast(msg, type = 'success') {
    toastMessage.value = msg
    toastType.value    = type
    toastVisible.value = true
    setTimeout(() => { toastVisible.value = false }, 3000)
  }

  // ══════════════════════════════════════════════════════════
  //  NAVIGATION
  // ══════════════════════════════════════════════════════════
  function goTo(route) { router.push(route) }
  function logout()    { router.push('/login') }

  // ══════════════════════════════════════════════════════════
  //  INIT — gọi khi component mount
  // ══════════════════════════════════════════════════════════
  async function initPage() {
    await Promise.all([
      loadPoints(),
      loadVouchers(),
      loadSavedPromos(),
      loadHistory(),
    ])
  }

  const timer = null
  onMounted(() => {
    initPage()
    loadTiers()
    console.log(TIERS)
  })

  return {
    user, navItems, currentRoute,
    myPoints, usedPoints, nextTierPoints,
    currentTier, progress,
    vouchers, canRedeem, isAlreadySaved, redeem, fmtValue, tagColor,
    pointHistory,
    toastVisible, toastMessage, toastType,
    goTo, logout,
    initPage,
  }
}