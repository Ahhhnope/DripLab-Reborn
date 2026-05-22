import { ref, onMounted } from 'vue'
import api from '../../api/axios.js'

export function useUserVoucher() {
  const promos = ref([])       // voucher hiển thị trên trang
  const savedIds = ref([])     // id đã "có sẵn" (auto từ online+offline)
  const toast = ref({ show: false, message: '' })
  let toastTimer = null

  function showToast(msg) {
    toast.value = { show: true, message: msg }
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toast.value.show = false }, 2800)
  }

  // Voucher online+offline → tự động vào kho của user
  async function loadPromos() {
    try {
      const { data } = await api.get('/promo-codes')
      const now = new Date()

      promos.value = data.filter(v =>
        v.displayLocation === 'online + offline' &&
        v.status === true &&
        v.quantity > 0 &&
        new Date(v.endDate) >= now
      )

      // Tất cả id này đều coi như "đã lưu" tự động
      savedIds.value = promos.value.map(v => v.id)

    } catch (e) {
      console.error('Lỗi load promo:', e)
    }
  }

  function isSaved(id) {
    return savedIds.value.includes(id)
  }

  // Không cần savePromo nữa vì tự động,
  // nhưng giữ lại để copy mã
  function savePromo(id) {
    const v = promos.value.find(p => p.id === id)
    if (!v) return
    showToast(`Đã sao chép mã: ${v.code}`)
    navigator.clipboard?.writeText(v.code).catch(() => {})
  }

  function fmtValue(v) {
    return v.category === 'PHẦN TRĂM'
      ? `${v.value}%`
      : `${(+v.value).toLocaleString('vi-VN')}đ`
  }

  onMounted(loadPromos)

  return { promos, isSaved, savePromo, fmtValue, toast }
}