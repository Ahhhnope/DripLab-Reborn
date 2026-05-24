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
    if (state.value.date === todayStr()) return false
    const next = (state.value.streak || 0) + 1
    return day === (next > 14 ? 1 : next)
  }

  async function claimDay(day, user) {
    if (!isDayUnlocked(day)) return
    const newStreak = ((state.value.streak || 0) + 1) > 14 ? 1 : (state.value.streak || 0) + 1
    const newDays = newStreak === 1 ? [1] : [...claimedDays.value, day]
    state.value = { date: todayStr(), streak: newStreak, days: newDays }
    localStorage.setItem(KEY, JSON.stringify(state.value))
    await api.put('/users/update/' + user.id, {
      loyaltyPoint: user.loyaltyPoint + (day === 14 ? 500 : 100)
    })
    showToast(day === 14 ? 'Nhận thành công 500 xu! 🎉' : 'Nhận thành công 100 xu! 🎉')
  }

  function resetLogin() {
    localStorage.removeItem(KEY)
    state.value = {}
  }

  // ── MODAL XÁC THỰC ĐĂNG NHẬP ────────────────────────
  const authModal = ref({ show: false, action: '' })

  // ── TOAST ────────────────────────────────────────────
  const toast = ref({ show: false, message: '' })
  let timer = null

  function showToast(message) {
    toast.value = { show: true, message }
    clearTimeout(timer)
    timer = setTimeout(() => { toast.value.show = false }, 3000)
  }

  return {
    claimedDays,
    isDayUnlocked,
    claimDay,
    resetLogin,
    authModal,
    toast,
  }
}