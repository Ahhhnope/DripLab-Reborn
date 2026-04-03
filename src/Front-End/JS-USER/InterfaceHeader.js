import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useHeader() {
  const router = useRouter()

  // ==============================
  // MENU DROPDOWN
  // ==============================
  const showMenuDropdown = ref(false)
  const activeMenuOption = ref(null)
  let menuEnterTimer = null
  let menuLeaveTimer = null

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

  function onDropdownLeave() {
    menuLeaveTimer = setTimeout(() => {
      showMenuDropdown.value = false
    }, 150)
  }

  function setActiveOption(name) {
    activeMenuOption.value = name
  }

  // ==============================
  // USER DROPDOWN
  // ==============================
  const showUserDropdown = ref(false)
  const activeUserAction = ref(null)

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
    activeUserAction.value = 'login'
    closeUserDropdown()
    router.push('/login')
  }

  function goToRegister() {
    activeUserAction.value = 'register'
    closeUserDropdown()
    router.push('/register')
  }

  function goToCart() {
    router.push('/cart')
  }

  function goToAccount() {
    activeUserAction.value = 'account'
    closeUserDropdown()
    router.push('/account')
  }

  // ==============================
  // AUTO RESET SAU MỖI NAVIGATE
  // ==============================
  router.afterEach(() => {
    activeMenuOption.value = null
    activeUserAction.value = null
    showMenuDropdown.value = false
    showUserDropdown.value = false
  })

  return {
    showMenuDropdown,
    showUserDropdown,
    activeMenuOption,
    activeUserAction,
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
    goToAccount,
  }
}