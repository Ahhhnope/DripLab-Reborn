import { ref, computed } from 'vue'
import api from '../../api/axios.js'

const KEY = 'driplab_daily_login'

function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} }
  catch { return {} }
}

export function useVoucher() {

  // ── DAILY LOGIN ──────────────────────────────────────
  const state = ref(loadState())

  const claimedDays = computed(() => state.value.days || [])

  function todayStr() {
    return new Date().toISOString().slice(0, 10)
  }

  // Ngày được mở hôm nay = streak + 1, nhưng chỉ nếu hôm nay chưa nhận
  function isDayUnlocked(day) {
    if (state.value.date === todayStr()) return false   // đã nhận hôm nay rồi
    const next = (state.value.streak || 0) + 1
    return day === (next > 7 ? 1 : next)
  }

  function claimDay(day) {
    if (!isDayUnlocked(day)) return
    const newStreak = ((state.value.streak || 0) + 1) > 7 ? 1 : (state.value.streak || 0) + 1
    const newDays = newStreak === 1 ? [1] : [...claimedDays.value, day]
    state.value = { date: todayStr(), streak: newStreak, days: newDays }
    localStorage.setItem(KEY, JSON.stringify(state.value))
    showToast(day === 7 ? 'Nhận thành công 500 xu! 🎉' : 'Nhận thành công 100 xu! 🎉')
  }

  function resetLogin() {
    localStorage.removeItem(KEY)
    state.value = {}
    showToast('Đã reset — thử lại từ Ngày 1!')
  }

  // ── VOUCHER ──────────────────────────────────────────
  const vouchers = ref([])
  const usedIds = ref([])

  async function loadVouchers() {
    try {
      const { data } = await api.get('/promo-codes')
      const now = new Date()
      vouchers.value = data.map(v => ({
        id: v.id,
        code: v.code,
        discount: v.category === 'PHẦN TRĂM' ? `Giảm ${v.value}%` : `Giảm ${(+v.value).toLocaleString('vi-VN')}đ`,
        maxDiscount: v.maxDiscount ? `${(+v.maxDiscount).toLocaleString('vi-VN')}đ` : '20k',
        minOrder: v.minOrder ? `${(+v.minOrder).toLocaleString('vi-VN')}đ` : '50k',
        expiry: v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn',
        active: v.status && new Date(v.endDate) >= now,
      }))
    } catch (e) { console.error(e) }
  }

  const displayedVouchers = computed(() => vouchers.value.filter(v => v.active))
  const activeCount = computed(() => displayedVouchers.value.length)

  // ── MODAL VOUCHER CODE ───────────────────────────────
  const modal = ref({ show: false, code: '', date: '' })

  function applyVoucher(v) {
    if (usedIds.value.includes(v.id)) return
    usedIds.value.push(v.id)
    modal.value = {
      show: true,
      code: v.code,
      date: `${new Date().toLocaleDateString('vi-VN')} - ${v.expiry}`,
    }
  }

  async function copyCode() {
    try { await navigator.clipboard.writeText(modal.value.code) }
    catch {
      const el = Object.assign(document.createElement('textarea'), { value: modal.value.code })
      document.body.appendChild(el); el.select(); document.execCommand('copy'); el.remove()
    }
    modal.value.show = false
    showToast('Đã sao chép: ' + modal.value.code)
  }

  // ── MODAL XÁC THỰC ĐĂNG NHẬP ────────────────────────
  // action: mô tả hành động người dùng muốn làm (VD: 'nhận xu hàng ngày')
  const authModal = ref({ show: false, action: '' })

  // ── TOAST ────────────────────────────────────────────
  const toast = ref({ show: false, msg: '' })
  let timer = null

  function showToast(msg) {
    toast.value = { show: true, msg }
    clearTimeout(timer)
    timer = setTimeout(() => { toast.value.show = false }, 2800)
  }

  // ── INIT ─────────────────────────────────────────────
  loadVouchers()
  // resetLogin()
  // Giải Thích resetLogin(): khi hoạt động thì sẽ về lại ngày ban đầu

  return {
    claimedDays, isDayUnlocked, claimDay, resetLogin,
    displayedVouchers, activeCount, usedIds, applyVoucher,
    modal, copyCode,
    authModal,
    toast,
  }
}