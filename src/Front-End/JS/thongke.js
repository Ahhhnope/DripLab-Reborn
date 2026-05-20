// // thongke.js — Dữ liệu mẫu dashboard cà phê & đồ uống

// export const filterTabs = [
//   { key: 'today', label: 'Hôm nay' },
//   { key: 'week',  label: 'Tuần này' },
//   { key: 'month', label: 'Tháng này' },
//   { key: 'year',  label: 'Năm nay' }
// ]

// export const summaryCards = [
//   {
//     period: 'Hôm nay', type: 'today',
//     value: '760.000 đ', trend: '100%', trendUp: true,
//     products: 6, orders: 3, done: 3, cancel: 0, process: 0
//   },
//   {
//     period: 'Tuần này', type: 'week',
//     value: '5.320.000 đ', trend: '91.3%', trendUp: false,
//     products: 42, orders: 18, done: 15, cancel: 1, process: 2
//   },
//   {
//     period: 'Tháng này', type: 'month',
//     value: '19.237.606 đ', trend: '64.1%', trendUp: false,
//     products: 113, orders: 139, done: 64, cancel: 20, process: 31
//   },
//   {
//     period: 'Năm nay', type: 'year',
//     value: '77.950.092 đ', trend: '100%', trendUp: true,
//     products: 557, orders: 302, done: 145, cancel: 45, process: 78
//   }
// ]

// export const statsRow = [
//   { label: 'Số đơn hàng',     value: '139',          color: '' },
//   { label: 'Hoàn thành',      value: '64',           color: 'color-green' },
//   { label: 'Đang xử lý',      value: '31',           color: 'color-orange' },
//   { label: 'Đã huỷ',          value: '20',           color: 'color-red' },
//   { label: 'Khách hàng',      value: '88',           color: '' },
//   { label: 'DT Thực tế',      value: '19.237.606 đ', color: 'color-blue' },
//   { label: 'Lợi nhuận (Ước)', value: '6.733.000 đ',  color: 'color-primary' }
// ]

// export const revenueData = {
//   labels: ['7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29'],
//   values: [
//     380000, 2600000, 2050000, 1800000, 1200000, 800000, 80000,
//     1780000, 800000, 2150000, 1500000, 1200000, 1800000, 2200000,
//     1550000, 2100000, 4250000, 4200000, 2900000, 2400000, 2100000, 1800000, 700000
//   ]
// }

// export const orderStatusSegments = [
//   { label: 'Đã giao', value: 64,  pct: 55.7, color: '#27ae60' },
//   { label: 'Đang xử lý', value: 31,  pct: 27.0, color: '#f39c12' },
//   { label: 'Chờ xác nhận',     value: 2,  pct: 17.4, color: '#6C4675' },
//   { label: 'Đang vận chuyển',     value: 11,  pct: 17.4, color: '#6C7156' },
//   { label: 'Đã hủy',     value: 20,  pct: 17.4, color: '#e74c3c' },
//   { label: 'Giao hàng không thành công',     value: 10,  pct: 17.4, color: '#75151E' },
// ]

// export const lowStockItems = [
//   { id: 1, name: 'Espresso Blend Đặc Biệt', size: 'S', stock: 0 },
//   { id: 2, name: 'Cold Brew 18 Giờ',        size: 'S', stock: 0 },
//   { id: 3, name: 'Bạc Xỉu Truyền Thống',   size: 'S', stock: 0 },
//   { id: 4, name: 'Trà Đào Cam Sả',          size: 'S', stock: 2 },
//   { id: 5, name: 'Caramel Macchiato',        size: 'S', stock: 3 },
//   { id: 6, name: 'Matcha Latte',             size: 'M', stock: 0 },
//   { id: 7, name: 'Cà Phê Muối',             size: 'M', stock: 5 },
//   { id: 8, name: 'Trà Sữa Taro',            size: 'M', stock: 7 }
// ]

// export const sizeSegments = [
//   { label: 'Size S (Nhỏ)',    value: 120, pct: 15.9, color: '#3b82f6' },
//   { label: 'Size M (Vừa)',    value: 310, pct: 41.1, color: '#27ae60' },
//   { label: 'Size L (Lớn)',    value: 240, pct: 31.8, color: '#f39c12' },
//   { label: 'Size XL (Extra)', value:  85, pct: 11.3, color: '#8b5cf6' }
// ]

// export const topProducts = [
//   { rank: 1, name: 'Cà Phê Sữa Đá Truyền Thống', size: 'M', price: '45.000 đ', sold: 15, badge: 'gold' },
//   { rank: 2, name: 'Bạc Xỉu Đặc Biệt',           size: 'S', price: '35.000 đ', sold: 14, badge: 'silver' },
//   { rank: 3, name: 'Cold Brew 18 Giờ',            size: 'M', price: '65.000 đ', sold: 10, badge: 'bronze' },
//   { rank: 4, name: 'Trà Đào Cam Sả',              size: 'S', price: '40.000 đ', sold: 10, badge: '' },
//   { rank: 5, name: 'Matcha Latte',                size: 'M', price: '55.000 đ', sold:  8, badge: '' },
//   { rank: 6, name: 'Caramel Macchiato',           size: 'M', price: '60.000 đ', sold:  8, badge: '' }
// ]

// export const growthData = {
//   labels: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],
//   series: [
//     { label: 'Doanh thu', color: '#6f4e37', values: [100,85,90,70,78,82,95,88,92,60,75,100] },
//     { label: 'Đơn hàng',  color: '#27ae60', values: [100,80,86,65,72,76,88,82,89,58,70,98]  },
//     { label: 'Khách mới', color: '#3b82f6', values: [100,72,80,60,65,70,80,75,83,55,65,95]  }
//   ]
// }

// thongke.js — Live data from API
import { ref, computed, watch, onMounted } from 'vue'
import api from '../../api/axios'

// ── Static (structure only, not data) ─────────────────────
export const filterTabs = [
  { key: 'today', label: 'Hôm nay'   },
  { key: 'week',  label: 'Tuần này'  },
  { key: 'month', label: 'Tháng này' },
  { key: 'year',  label: 'Năm nay'   },
]

// ── Colours for donut / growth charts ─────────────────────
const STATUS_COLORS = {
  'Đã giao':                        '#27ae60',
  'Đang xử lý':                     '#f39c12',
  'Chờ xác nhận':                   '#6C4675',
  'Đang vận chuyển':                '#6C7156',
  'Đã huỷ':                         '#e74c3c',
  'Giao hàng không thành công':     '#75151E',
}

// ── Helpers ────────────────────────────────────────────────
function startOf(period) {
  const now = new Date()
  if (period === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
  if (period === 'week') {
    const d = new Date(now)
    d.setDate(d.getDate() - d.getDay() + 1) // Monday
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }
  if (period === 'year') {
    return new Date(now.getFullYear(), 0, 1)
  }
}

function fmt(n) {
  return n.toLocaleString('vi-VN') + ' đ'
}

function pct(part, total) {
  return total === 0 ? 0 : Math.round((part / total) * 1000) / 10
}

// ══════════════════════════════════════════════════════════
export function useThongKe() {
  const activeTab = ref('month')
  const allOrders = ref([])
  const allUsers  = ref([])
  const loading   = ref(true)

  // ── Fetch once, derive everything reactively ───────────
  async function loadAll() {
    loading.value = true
    try {
      const [ordersRes, usersRes] = await Promise.all([
        api.get('/orders'),
        api.get('/users'),
      ])
      allOrders.value = ordersRes.data
      allUsers.value  = usersRes.data
    } catch (e) {
      console.error('Dashboard load error:', e)
    } finally {
      loading.value = false
    }
  }

  // ── Filter orders by period ────────────────────────────
  function ordersForPeriod(period) {
    const from = startOf(period)
    return allOrders.value.filter(o => {
      if (!o.orderDate) return false
      return new Date(o.orderDate) >= from
    })
  }

  // ── summaryCards (all 4 periods always shown) ──────────
  const summaryCards = computed(() => {
    const periods = ['today', 'week', 'month', 'year']
    const labels  = { today: 'Hôm nay', week: 'Tuần này', month: 'Tháng này', year: 'Năm nay' }

    return periods.map(period => {
      const orders  = ordersForPeriod(period)
      const revenue = orders
        .filter(o => o.status === 'Đã giao')
        .reduce((s, o) => s + (o.finalPrice ?? 0), 0)

      const products = orders.reduce(
        (s, o) => s + (o.items ?? []).reduce((a, i) => a + (i.quantity ?? 1), 0), 0
      )
      const done    = orders.filter(o => o.status === 'Đã giao').length
      const cancel  = orders.filter(o => o.status === 'Đã huỷ').length
      const process = orders.filter(o =>
        !['Đã giao', 'Đã huỷ'].includes(o.status)
      ).length

      // trend: compare revenue to previous same-length period
      const periodMs  = Date.now() - startOf(period).getTime()
      const prevFrom  = new Date(startOf(period).getTime() - periodMs)
      const prevEnd   = startOf(period)
      const prevRev   = allOrders.value
        .filter(o => {
          if (!o.orderDate) return false
          const d = new Date(o.orderDate)
          return d >= prevFrom && d < prevEnd && o.status === 'Đã giao'
        })
        .reduce((s, o) => s + (o.finalPrice ?? 0), 0)

      const trendUp  = revenue >= prevRev
      const trendPct = prevRev === 0
        ? 100
        : Math.round(Math.abs(revenue - prevRev) / prevRev * 1000) / 10

      return {
        period:  labels[period],
        type:    period,
        value:   fmt(revenue),
        trend:   trendPct + '%',
        trendUp,
        products,
        orders:  orders.length,
        done,
        cancel,
        process,
      }
    })
  })

  // ── statsRow — reacts to activeTab ────────────────────
  const statsRow = computed(() => {
    const orders   = ordersForPeriod(activeTab.value)
    const revenue  = orders
      .filter(o => o.status === 'Đã giao')
      .reduce((s, o) => s + (o.finalPrice ?? 0), 0)
    const profit   = Math.round(revenue * 0.35) // ~35% margin estimate

    const from     = startOf(activeTab.value)
    const newUsers = allUsers.value.filter(u => {
      // users don't always have createdAt — fall back to counting all if missing
      if (!u.createdAt) return false
      return new Date(u.createdAt) >= from
    })
    const userCount = newUsers.length || allUsers.value.length

    return [
      { label: 'Số đơn hàng',     value: String(orders.length),                   color: ''              },
      { label: 'Hoàn thành',      value: String(orders.filter(o => o.status === 'Đã giao').length),  color: 'color-green'   },
      { label: 'Đang xử lý',      value: String(orders.filter(o => !['Đã giao','Đã huỷ'].includes(o.status)).length), color: 'color-orange' },
      { label: 'Đã huỷ',          value: String(orders.filter(o => o.status === 'Đã huỷ').length),   color: 'color-red'     },
      { label: 'Khách hàng',      value: String(userCount),                        color: ''              },
      { label: 'DT Thực tế',      value: fmt(revenue),                             color: 'color-blue'    },
      { label: 'Lợi nhuận (Ước)', value: fmt(profit),                              color: 'color-primary' },
    ]
  })

  // ── revenueData — daily bars for the active period ────
  const revenueData = computed(() => {
    const orders = ordersForPeriod(activeTab.value)
      .filter(o => o.status === 'Đã giao')

    if (activeTab.value === 'year') {
      // Group by month
      const months = Array.from({ length: 12 }, (_, i) => i)
      const values = months.map(m =>
        orders.filter(o => new Date(o.orderDate).getMonth() === m)
              .reduce((s, o) => s + (o.finalPrice ?? 0), 0)
      )
      return { labels: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'], values }
    }

    if (activeTab.value === 'month') {
      // Group by day-of-month
      const now       = new Date()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const days      = Array.from({ length: daysInMonth }, (_, i) => i + 1)
      const values    = days.map(d =>
        orders.filter(o => new Date(o.orderDate).getDate() === d)
              .reduce((s, o) => s + (o.finalPrice ?? 0), 0)
      )
      return { labels: days.map(String), values }
    }

    if (activeTab.value === 'week') {
      const days   = ['T2','T3','T4','T5','T6','T7','CN']
      const from   = startOf('week')
      const values = days.map((_, i) => {
        const day = new Date(from); day.setDate(day.getDate() + i)
        const next = new Date(day); next.setDate(next.getDate() + 1)
        return orders.filter(o => {
          const d = new Date(o.orderDate)
          return d >= day && d < next
        }).reduce((s, o) => s + (o.finalPrice ?? 0), 0)
      })
      return { labels: days, values }
    }

    // today — group by hour
    const hours  = Array.from({ length: 24 }, (_, i) => i)
    const values = hours.map(h =>
      orders.filter(o => new Date(o.orderDate).getHours() === h)
            .reduce((s, o) => s + (o.finalPrice ?? 0), 0)
    )
    return { labels: hours.map(h => h + 'h'), values }
  })

  // ── orderStatusSegments ────────────────────────────────
  const orderStatusSegments = computed(() => {
    const orders = ordersForPeriod(activeTab.value)
    const total  = orders.length || 1

    const groups = {}
    for (const o of orders) {
      groups[o.status] = (groups[o.status] ?? 0) + 1
    }

    return Object.entries(groups).map(([label, value]) => ({
      label,
      value,
      pct:   pct(value, total),
      color: STATUS_COLORS[label] ?? '#999',
    }))
  })

  const orderStatusTotal = computed(() =>
    ordersForPeriod(activeTab.value).length
  )

  // ── topProducts ────────────────────────────────────────
  const topProducts = computed(() => {
    const orders = ordersForPeriod(activeTab.value)

    const soldMap = {}
    const priceMap = {}
    for (const o of orders) {
      for (const item of (o.items ?? [])) {
        const name = item.drink?.name ?? 'Sản phẩm'
        const size = item.size?.name  ?? 'M'
        const key  = `${name}||${size}`
        soldMap[key]  = (soldMap[key]  ?? 0) + (item.quantity ?? 1)
        priceMap[key] = item.drink?.price ?? item.basePriceAtPurchase ?? 0
      }
    }

    const BADGES = ['gold', 'silver', 'bronze']
    return Object.entries(soldMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([key, sold], i) => {
        const [name, size] = key.split('||')
        return {
          rank:  i + 1,
          name,
          size,
          price: fmt(priceMap[key] ?? 0),
          sold,
          badge: BADGES[i] ?? '',
        }
      })
  })

  // ── growthData — monthly % indexed to Jan = 100 ───────
  const growthData = computed(() => {
    const now    = new Date()
    const year   = now.getFullYear()
    const months = Array.from({ length: 12 }, (_, i) => i)

    function monthlyRevenue(m) {
      return allOrders.value
        .filter(o => {
          if (!o.orderDate || o.status !== 'Đã giao') return false
          const d = new Date(o.orderDate)
          return d.getFullYear() === year && d.getMonth() === m
        })
        .reduce((s, o) => s + (o.finalPrice ?? 0), 0)
    }

    function monthlyOrders(m) {
      return allOrders.value.filter(o => {
        if (!o.orderDate) return false
        const d = new Date(o.orderDate)
        return d.getFullYear() === year && d.getMonth() === m
      }).length
    }

    function monthlyNewUsers(m) {
      return allUsers.value.filter(u => {
        if (!u.createdAt) return false
        const d = new Date(u.createdAt)
        return d.getFullYear() === year && d.getMonth() === m
      }).length
    }

    function toIndex(values) {
      const base = values[0] || 1
      return values.map(v => Math.round((v / base) * 100))
    }

    const revVals   = months.map(monthlyRevenue)
    const ordVals   = months.map(monthlyOrders)
    const usrVals   = months.map(monthlyNewUsers)

    return {
      labels: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],
      series: [
        { label: 'Doanh thu', color: '#6f4e37', values: toIndex(revVals) },
        { label: 'Đơn hàng',  color: '#27ae60', values: toIndex(ordVals) },
        { label: 'Khách mới', color: '#3b82f6', values: toIndex(usrVals) },
      ]
    }
  })

  onMounted(loadAll)

  return {
    activeTab, loading,
    filterTabs,
    summaryCards, statsRow,
    revenueData, orderStatusSegments, orderStatusTotal,
    topProducts, growthData,
  }
}