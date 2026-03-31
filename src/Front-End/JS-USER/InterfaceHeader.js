import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useHeader() {
  const router = useRouter()

  // ==============================
  // MENU DROPDOWN — hover với delay mượt
  // ==============================
  const showMenuDropdown = ref(false)
  const activeMenuOption = ref(null) 
  let menuEnterTimer = null
  let menuLeaveTimer = null

  // Hover vào nav "MENU" → chờ 120ms rồi mở
  function onMenuEnter() {
    clearTimeout(menuLeaveTimer)
    menuEnterTimer = setTimeout(() => {
      showMenuDropdown.value = true
    }, 120)
  }

  function onMenuLeave() {
    clearTimeout(menuEnterTimer)
    menuLeaveTimer = setTimeout(() => {
      showMenuDropdown.value = false
    }, 200)
  }

  function onDropdownEnter() {
    clearTimeout(menuLeaveTimer)
  }

  // Chuột rời dropdown → đóng sau 150ms
  function onDropdownLeave() {
    menuLeaveTimer = setTimeout(() => {
      showMenuDropdown.value = false
    }, 150)
  }

  // Click option → highlight xanh
  function setActiveOption(name) {
    activeMenuOption.value = name
  }

  // ==============================
  // USER DROPDOWN — click toggle
  // ==============================
  const showUserDropdown = ref(false)

  function toggleUserDropdown() {
    showUserDropdown.value = !showUserDropdown.value
  }

  function closeUserDropdown() {
    showUserDropdown.value = false
  }

  // ==============================
  // NAVIGATION
  // ==============================
  function goToLogin() {
    closeUserDropdown()
    router.push('/login')
  }

  function goToRegister() {
    closeUserDropdown()
    router.push('/register')
  }

  function goToCart() {
    router.push('/cart')
  }

  return {
    showMenuDropdown,
    showUserDropdown,
    activeMenuOption,
    onMenuEnter,
    onMenuLeave,
    onDropdownEnter,
    onDropdownLeave,
    setActiveOption,
    toggleUserDropdown,
    closeUserDropdown,
    goToLogin,
    goToRegister,
    goToCart,
  }
}