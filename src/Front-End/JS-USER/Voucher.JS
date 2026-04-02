import { ref, computed } from 'vue'

export function useVoucher() {
  const activeTab = ref('available') // 'available' | 'used'

  const vouchers = ref([
    {
      id: 1,
      code: 'WELCOME10',
      discount: 'Giảm 10%',
      expiry: '12/4/2026',
      minOrder: '1.000.000 đ',
      status: 'active', // active | used | expired
      type: 'percent',
    },
    {
      id: 2,
      code: 'SAVE50K',
      discount: 'Giảm 50.000đ',
      expiry: '12/4/2026',
      minOrder: '500.000 đ',
      status: 'active',
      type: 'fixed',
    },
    {
      id: 3,
      code: 'RUN20',
      discount: 'Giảm 20%',
      expiry: '2/4/2026',
      minOrder: '2.000.000 đ',
      status: 'active',
      type: 'percent',
    },
    {
      id: 4,
      code: 'FREESHIP30',
      discount: 'Giảm 30.000đ',
      expiry: '28/3/2026',
      minOrder: '300.000 đ',
      status: 'active',
      type: 'fixed',
    },
    {
      id: 5,
      code: 'SUMMER15',
      discount: 'Giảm 15%',
      expiry: '1/1/2026',
      minOrder: '800.000 đ',
      status: 'used',
      type: 'percent',
    },
  ])

  const copiedCode = ref(null)
  const toastMessage = ref('')
  const showToast = ref(false)

  const activeVouchers = computed(() =>
    vouchers.value.filter((v) => v.status === 'active')
  )

  const usedExpiredVouchers = computed(() =>
    vouchers.value.filter((v) => v.status === 'used' || v.status === 'expired')
  )

  const totalCount = computed(() => vouchers.value.length)
  const activeCount = computed(() => activeVouchers.value.length)
  const usedCount = computed(() => usedExpiredVouchers.value.length)

  const displayedVouchers = computed(() =>
    activeTab.value === 'available' ? activeVouchers.value : usedExpiredVouchers.value
  )

  function setTab(tab) {
    activeTab.value = tab
  }

  function triggerToast(msg) {
    toastMessage.value = msg
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 2500)
  }

  async function copyCode(voucher) {
    try {
      await navigator.clipboard.writeText(voucher.code)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = voucher.code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }

    copiedCode.value = voucher.id

    // Move to used
    const idx = vouchers.value.findIndex((v) => v.id === voucher.id)
    if (idx !== -1) {
      setTimeout(() => {
        vouchers.value[idx].status = 'used'
        copiedCode.value = null
      }, 800)
    }

    triggerToast(`Đã sao chép mã: ${voucher.code}`)
  }

  return {
    activeTab,
    vouchers,
    activeVouchers,
    usedExpiredVouchers,
    displayedVouchers,
    totalCount,
    activeCount,
    usedCount,
    copiedCode,
    showToast,
    toastMessage,
    setTab,
    copyCode,
  }
}