import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sharedUser } from './Useruser.JS'

export function useUserPoints() {
  const router = useRouter()
  const currentRoute = '/account/points'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',          icon: 'person',      route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu',  icon: 'lock',        route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',             icon: 'location_on', route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',    icon: 'package',     route: '/account/orders' },
    { id: 'points',   label: 'Điểm của tôi',        icon: 'loyalty',     route: '/account/points' },
  ]

  const user = sharedUser

  // ── Điểm ──────────────────────────────────────────────────
  // TODO: thay bằng API → GET /customers/{id} → loyalty_point
  const myPoints    = ref(31200)
  const usedPoints  = ref(18800)

  const TIERS = [
    { name: 'Bạc',    min: 0,      next: 'Vàng',   nextMin: 50000  },
    { name: 'Vàng',   min: 50000,  next: 'Kim cương', nextMin: 150000 },
    { name: 'Kim cương', min: 150000, next: null, nextMin: null },
  ]

  const currentTierObj = computed(() =>
    [...TIERS].reverse().find(t => myPoints.value >= t.min) ?? TIERS[0]
  )

  const currentTier    = computed(() => currentTierObj.value.name)
  const nextTier       = computed(() => currentTierObj.value.next ?? 'Tối đa')
  const nextTierPoints = computed(() => currentTierObj.value.nextMin ?? myPoints.value)

  const progress = computed(() => {
    const base = currentTierObj.value.min
    const top  = nextTierPoints.value
    if (!currentTierObj.value.next) return 100
    return Math.min(Math.round(((myPoints.value - base) / (top - base)) * 100), 100)
  })

  // ── Vouchers ───────────────────────────────────────────────
  const vouchers = ref([
    {
      id: 1,
      tag: 'Giảm giá',  color: 'orange',
      name: 'Giảm 10% đơn hàng',
      desc: 'Áp dụng cho tất cả sản phẩm, không giới hạn giá trị đơn.',
      cost: 20000,
    },
    {
      id: 2,
      tag: 'Giảm giá',  color: 'orange',
      name: 'Giảm 20% đơn hàng',
      desc: 'Áp dụng cho tất cả sản phẩm, tối đa giảm 50.000 đ.',
      cost: 35000,
    },
    {
      id: 3,
      tag: 'Miễn phí',  color: 'green',
      name: 'Miễn phí 1 ly size M',
      desc: 'Tặng 1 ly bất kỳ size M khi đặt đơn từ 2 ly trở lên.',
      cost: 25000,
    },
    {
      id: 4,
      tag: 'Ship',       color: 'blue',
      name: 'Miễn phí giao hàng',
      desc: 'Áp dụng cho đơn online, giao trong nội thành Hà Nội.',
      cost: 15000,
    },
    {
      id: 5,
      tag: 'Đặc biệt',  color: 'purple',
      name: 'Giảm 50% cho lần đặt tiếp theo',
      desc: 'Áp dụng 1 lần cho đơn hàng bất kỳ, không giới hạn giá trị.',
      cost: 50000,
    },
    {
      id: 6,
      tag: 'Miễn phí',  color: 'green',
      name: 'Miễn phí topping tùy chọn',
      desc: 'Được thêm 1 topping bất kỳ miễn phí cho mỗi ly trong đơn.',
      cost: 10000,
    },
  ])

  function canRedeem(cost) {
    return myPoints.value >= cost
  }

  function redeem(voucher) {
    if (!canRedeem(voucher.cost)) return

    myPoints.value  -= voucher.cost
    usedPoints.value += voucher.cost

    // Thêm vào lịch sử
    pointHistory.value.unshift({
      type: 'use',
      desc: `Đổi voucher: ${voucher.name}`,
      date: new Date().toLocaleDateString('vi-VN'),
      pts:  voucher.cost,
    })

    showToast(`Đổi thành công: ${voucher.name}!`, 'success')

    // TODO: gọi API → POST /vouchers/redeem { customerId, voucherId }
  }

  // ── Lịch sử điểm ──────────────────────────────────────────
  // TODO: thay bằng API → GET /customers/{id}/point-history
  const pointHistory = ref([
    { type: 'earn', desc: 'Đặt hàng #DL-8080-41',       date: '30/03/2026', pts: 193   },
    { type: 'use',  desc: 'Đổi voucher: Giảm 10%',       date: '25/03/2026', pts: 20000 },
    { type: 'earn', desc: 'Đặt hàng #DL-6401-08',        date: '15/08/2023', pts: 130   },
    { type: 'earn', desc: 'Đặt hàng #DL-7501-19',        date: '01/09/2023', pts: 58    },
    { type: 'earn', desc: 'Đặt hàng #DL-8122-42',        date: '28/09/2023', pts: 160   },
    { type: 'earn', desc: 'Đặt hàng #DL-9283-01',        date: '12/10/2023', pts: 98    },
  ])

  // ── Toast ──────────────────────────────────────────────────
  const toastVisible = ref(false)
  const toastMessage = ref('')
  const toastType    = ref('success')

  function showToast(msg, type = 'success') {
    toastMessage.value = msg
    toastType.value    = type
    toastVisible.value = true
    setTimeout(() => { toastVisible.value = false }, 3000)
  }

  // ── Navigation ─────────────────────────────────────────────
  function goTo(route) { router.push(route) }

  function logout() { router.push('/login') }

  return {
    user, navItems, currentRoute,
    myPoints, usedPoints,
    currentTier, nextTier, nextTierPoints, progress,
    vouchers, canRedeem, redeem,
    pointHistory,
    toastVisible, toastMessage, toastType,
    goTo, logout,
  }
}