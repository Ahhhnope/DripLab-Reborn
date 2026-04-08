import { ref, computed } from 'vue'
import api from '../../api/axios.js'

export function useVoucher() {

  const activeTab = ref('available')
  const vouchers = ref([])
  const copiedCode = ref(null)
  const showToast = ref(false)
  const toastMessage = ref('')

  async function loadVouchers() {
    try {
      const res = await api.get('/promo-codes')
      const now = new Date()

      vouchers.value = res.data.map(v => ({
        id: v.id,
        rawCode: v.code,
        code: v.code,
        discount: v.category === 'PHẦN TRĂM'
          ? 'Giảm ' + v.value + '%'
          : 'Giảm ' + (+v.value).toLocaleString('vi-VN') + 'đ',
        expiry: v.endDate
          ? new Date(v.endDate).toLocaleDateString('vi-VN')
          : 'Không giới hạn',
        minOrder: '—',
        status: v.status && new Date(v.endDate) >= now
          ? 'active'
          : 'expired'
      }))
    } catch (err) {
      console.error('[Voucher] loadVouchers lỗi:', err.response?.status, err.message)
      vouchers.value = []
    }
  }

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

  async function copyCode(v) {
    try {
      await navigator.clipboard.writeText(v.rawCode)
    } catch {
      const el = document.createElement('textarea')
      el.value = v.rawCode
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }

    copiedCode.value = v.id
    toastMessage.value = 'Đã sao chép: ' + v.rawCode
    showToast.value = true

    setTimeout(async () => {
      copiedCode.value = null
      showToast.value = false
      await loadVouchers()
    }, 2000)
  }

  loadVouchers()

  return {
    activeTab, displayedVouchers,
    activeCount, totalCount, usedCount,
    copiedCode, showToast, toastMessage,
    setTab, copyCode
  }
}