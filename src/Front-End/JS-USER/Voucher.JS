import { ref, computed } from 'vue'
import api from '../../api/axios.js'

const KEY = 'driplab_daily_login'

function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} }
  catch { return {} }
}

export function useVoucher() {

  const state = ref(loadState())
  const claimedDays = computed(() => state.value.days || [])

  function todayStr() {
    return new Date().toISOString().slice(0, 10)
  }

  function isDayUnlocked(day) {
    if (state.value.date === todayStr()) return false
    const next = (state.value.streak || 0) + 1
    return day === (next > 7 ? 1 : next)
  }

  async function claimDay(day, user) {
    if (!isDayUnlocked(day)) return
    const newStreak = ((state.value.streak || 0) + 1) > 7 ? 1 : (state.value.streak || 0) + 1
    const newDays = newStreak === 1 ? [1] : [...claimedDays.value, day]
    state.value = { date: todayStr(), streak: newStreak, days: newDays }
    localStorage.setItem(KEY, JSON.stringify(state.value))
    await api.put('/users/update/' + user.id, {
      loyaltyPoint: user.loyaltyPoint + (day === 7 ? 500 : 100)
    })
    showToast(day === 7 ? 'Nhận thành công 500 xu! 🎉' : 'Nhận thành công 100 xu! 🎉')
  }

  function resetLogin() {
    localStorage.removeItem(KEY)
    state.value = {}
  }

  const authModal = ref({ show: false, action: '' })
  const toast = ref({ show: false, message: '' })
  let timer = null

  function showToast(message) {
    toast.value = { show: true, message }
    clearTimeout(timer)
    timer = setTimeout(() => { toast.value.show = false }, 3000)
  }

  // Gọi để reset khi test — comment lại khi deploy thật
  // resetLogin()

  return {
    claimedDays,
    isDayUnlocked,
    claimDay,
    resetLogin,
    authModal,
    toast,
  }
}