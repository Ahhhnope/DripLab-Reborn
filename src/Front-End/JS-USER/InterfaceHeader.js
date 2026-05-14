import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../stores/cart.js'
import api from '../../api/axios'

function getImageUrl(url) {
    if (!url) return ''
    return url.startsWith('http') ? url : `http://localhost:8080${url}`
}


export function useHeader() {
  const router = useRouter()
  const cartStore = useCartStore()

  // ── MENU DROPDOWN ──────────────────────────────────────────────
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

  // ── USER DROPDOWN ──────────────────────────────────────────────
  const showUserDropdown = ref(false)
  const activeUserAction = ref(null)

  function toggleUserDropdown() {
    showUserDropdown.value = !showUserDropdown.value
  }

  function closeUserDropdown() {
    showUserDropdown.value = false
  }

  // ── CART DROPDOWN ──────────────────────────────────────────────
  const showCartDropdown = ref(false)
  let cartEnterTimer = null
  let cartLeaveTimer = null

  function onCartEnter() {
    clearTimeout(cartLeaveTimer)
    cartEnterTimer = setTimeout(() => {
      showCartDropdown.value = true
    }, 100)
  }

  function onCartLeave() {
    clearTimeout(cartEnterTimer)
    cartLeaveTimer = setTimeout(() => {
      showCartDropdown.value = false
    }, 220)
  }

  function onCartDropdownEnter() {
    clearTimeout(cartLeaveTimer)
  }

  function onCartDropdownLeave() {
    cartLeaveTimer = setTimeout(() => {
      showCartDropdown.value = false
    }, 180)
  }

  async function removeCartItem(itemId) {
    try {
      await api.delete(`/carts/remove/${itemId}`)
      cartStore.items = cartStore.items.filter(i => i.id !== itemId)
    } catch (e) {
      console.error('Remove cart item error:', e)
    }
  }

  // ── FORMAT ─────────────────────────────────────────────────────
  function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // ── NAVIGATION ─────────────────────────────────────────────────
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
    showCartDropdown.value = false
    router.push('/cart')
  }

  function goToAccount() {
    activeUserAction.value = 'account'
    closeUserDropdown()
    router.push('/account')
  }

  router.afterEach(() => {
    activeMenuOption.value = null
    activeUserAction.value = null
    showMenuDropdown.value = false
    showUserDropdown.value = false
    showCartDropdown.value = false
  })

  return {
    showMenuDropdown,
    showUserDropdown,
    showCartDropdown,
    activeMenuOption,
    activeUserAction,
    onMenuEnter,
    onMenuLeave,
    onDropdownEnter,
    onDropdownLeave,
    setActiveOption,
    toggleUserDropdown,
    closeUserDropdown,
    onCartEnter,
    onCartLeave,
    onCartDropdownEnter,
    onCartDropdownLeave,
    removeCartItem,
    formatVND,
    goToLogin,
    goToRegister,
    goToCart,
    goToAccount,
  }
}