import { ref, computed } from 'vue'

export function useVoucher() {

  const activeTab = ref('available')
  const vouchers = ref([])
  const copiedCode = ref(null)
  const showToast = ref(false)
  const toastMessage = ref('')

  // Gọi API lấy danh sách voucher
  async function loadVouchers() {
    const now = new Date()
    const data = await fetch('/api/promo-codes').then(r => r.json())

    vouchers.value = data.map(v => ({
      id: v.id,
      rawCode: v.code,
      code: v.code,
      discount: v.category === 'PHẦN TRĂM'
        ? `Giảm ${v.value}%`
        : `Giảm ${(+v.value).toLocaleString('vi-VN')}đ`,
      expiry: new Date(v.endDate).toLocaleDateString('vi-VN'),
      minOrder: '—',
      // active = còn dùng được, expired = hết hạn hoặc hết lượt
      status: (!v.status || v.quantity <= 0 || new Date(v.endDate) < now)
        ? 'expired'
        : 'active'
    }))
  }

  // Tab "Đang khả dụng" hoặc "Đã dùng và hết hạn"
  const displayedVouchers = computed(() =>
    vouchers.value.filter(v =>
      activeTab.value === 'available'
        ? v.status === 'active'
        : v.status !== 'active'
    )
  )

  const activeCount = computed(() => vouchers.value.filter(v => v.status === 'active').length)
  const totalCount = computed(() => vouchers.value.length)
  const usedCount = computed(() => totalCount.value - activeCount.value)

  function setTab(t) { activeTab.value = t }

  // User bấm "Sao chép mã" → gọi API giảm quantity trên DB
  async function copyCode(v) {
    await navigator.clipboard.writeText(v.rawCode).catch(() => { })

    copiedCode.value = v.id
    toastMessage.value = `Đã sao chép: ${v.rawCode}`
    showToast.value = true

    // Báo backend giảm quantity
    await fetch(`/api/promo-codes/use/${v.id}`, { method: 'PUT' })

    setTimeout(async () => {
      copiedCode.value = null
      showToast.value = false
      await loadVouchers() // Refresh lại để đồng bộ DB
    }, 2000)
  }

  // Chạy ngay khi component mount
  loadVouchers()

  return {
    activeTab, displayedVouchers,
    activeCount, totalCount, usedCount,
    copiedCode, showToast, toastMessage,
    setTab, copyCode
  }
}