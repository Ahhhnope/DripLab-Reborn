// thongke.js — Dữ liệu mẫu dashboard cà phê & đồ uống

export const filterTabs = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'week',  label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
  { key: 'year',  label: 'Năm nay' }
]

export const summaryCards = [
  {
    period: 'Hôm nay', type: 'today',
    value: '760.000 đ', trend: '100%', trendUp: true,
    products: 6, orders: 3, done: 3, cancel: 0, process: 0
  },
  {
    period: 'Tuần này', type: 'week',
    value: '5.320.000 đ', trend: '91.3%', trendUp: false,
    products: 42, orders: 18, done: 15, cancel: 1, process: 2
  },
  {
    period: 'Tháng này', type: 'month',
    value: '19.237.606 đ', trend: '64.1%', trendUp: false,
    products: 113, orders: 139, done: 64, cancel: 20, process: 31
  },
  {
    period: 'Năm nay', type: 'year',
    value: '77.950.092 đ', trend: '100%', trendUp: true,
    products: 557, orders: 302, done: 145, cancel: 45, process: 78
  }
]

export const statsRow = [
  { label: 'Số đơn hàng',     value: '139',          color: '' },
  { label: 'Hoàn thành',      value: '64',           color: 'color-green' },
  { label: 'Đang xử lý',      value: '31',           color: 'color-orange' },
  { label: 'Đã huỷ',          value: '20',           color: 'color-red' },
  { label: 'Khách hàng',      value: '88',           color: '' },
  { label: 'DT Thực tế',      value: '19.237.606 đ', color: 'color-blue' },
  { label: 'Lợi nhuận (Ước)', value: '6.733.000 đ',  color: 'color-primary' }
]

export const revenueData = {
  labels: ['7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29'],
  values: [
    380000, 2600000, 2050000, 1800000, 1200000, 800000, 80000,
    1780000, 800000, 2150000, 1500000, 1200000, 1800000, 2200000,
    1550000, 2100000, 4250000, 4200000, 2900000, 2400000, 2100000, 1800000, 700000
  ]
}

export const orderStatusSegments = [
  { label: 'Đã giao', value: 64,  pct: 55.7, color: '#27ae60' },
  { label: 'Đang xử lý', value: 31,  pct: 27.0, color: '#f39c12' },
  { label: 'Chờ xác nhận',     value: 2,  pct: 17.4, color: '#6C4675' },
  { label: 'Đang vận chuyển',     value: 11,  pct: 17.4, color: '#6C7156' },
  { label: 'Đã hủy',     value: 20,  pct: 17.4, color: '#e74c3c' },
  { label: 'Giao hàng không thành công',     value: 10,  pct: 17.4, color: '#75151E' },
]

export const lowStockItems = [
  { id: 1, name: 'Espresso Blend Đặc Biệt', size: 'S', stock: 0 },
  { id: 2, name: 'Cold Brew 18 Giờ',        size: 'S', stock: 0 },
  { id: 3, name: 'Bạc Xỉu Truyền Thống',   size: 'S', stock: 0 },
  { id: 4, name: 'Trà Đào Cam Sả',          size: 'S', stock: 2 },
  { id: 5, name: 'Caramel Macchiato',        size: 'S', stock: 3 },
  { id: 6, name: 'Matcha Latte',             size: 'M', stock: 0 },
  { id: 7, name: 'Cà Phê Muối',             size: 'M', stock: 5 },
  { id: 8, name: 'Trà Sữa Taro',            size: 'M', stock: 7 }
]

export const sizeSegments = [
  { label: 'Size S (Nhỏ)',    value: 120, pct: 15.9, color: '#3b82f6' },
  { label: 'Size M (Vừa)',    value: 310, pct: 41.1, color: '#27ae60' },
  { label: 'Size L (Lớn)',    value: 240, pct: 31.8, color: '#f39c12' },
  { label: 'Size XL (Extra)', value:  85, pct: 11.3, color: '#8b5cf6' }
]

export const topProducts = [
  { rank: 1, name: 'Cà Phê Sữa Đá Truyền Thống', size: 'M', price: '45.000 đ', sold: 15, badge: 'gold' },
  { rank: 2, name: 'Bạc Xỉu Đặc Biệt',           size: 'S', price: '35.000 đ', sold: 14, badge: 'silver' },
  { rank: 3, name: 'Cold Brew 18 Giờ',            size: 'M', price: '65.000 đ', sold: 10, badge: 'bronze' },
  { rank: 4, name: 'Trà Đào Cam Sả',              size: 'S', price: '40.000 đ', sold: 10, badge: '' },
  { rank: 5, name: 'Matcha Latte',                size: 'M', price: '55.000 đ', sold:  8, badge: '' },
  { rank: 6, name: 'Caramel Macchiato',           size: 'M', price: '60.000 đ', sold:  8, badge: '' }
]

export const growthData = {
  labels: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],
  series: [
    { label: 'Doanh thu', color: '#6f4e37', values: [100,85,90,70,78,82,95,88,92,60,75,100] },
    { label: 'Đơn hàng',  color: '#27ae60', values: [100,80,86,65,72,76,88,82,89,58,70,98]  },
    { label: 'Khách mới', color: '#3b82f6', values: [100,72,80,60,65,70,80,75,83,55,65,95]  }
  ]
}