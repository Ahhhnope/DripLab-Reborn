<script setup>
import { useHeader } from '../JS-USER/InterfaceHeader.js'
import { useAuthStore } from '../Authorization/Auth.js'
import { useCartStore } from '../../stores/cart.js'
import { computed } from 'vue'

const auth = useAuthStore()
const cartStore = useCartStore()

function getImageUrl(url) {
  if (!url) return ''
  return url.startsWith('http') ? url : `http://localhost:8080${url}`
}

const {
  goToLogin,
  goToRegister,
  goToCart,
  goToAccount,
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
} = useHeader()

const cartItemCount = computed(() =>
  cartStore.items.reduce((sum, i) => sum + (i.quantity || 1), 0)
)

const cartPreviewItems = computed(() =>
  cartStore.items.slice(0, 4).map(item => ({
    id: item.id,
    name: item.drink?.name || 'Sản phẩm',
    image: getImageUrl(item.drink?.imageUrl) || '/placeholder.png',
    price:
      (item.drink?.basePrice || 0) +
      (item.size?.price || 0) +
      (item.toppings?.reduce((s, t) => s + (t.topping?.price || 0), 0) || 0),
    quantity: item.quantity || 1,
    sizeName: item.size?.name || '',
  }))
)

const cartSubtotal = computed(() =>
  cartStore.items.reduce(
    (sum, item) =>
      sum +
      ((item.drink?.basePrice || 0) +
        (item.size?.price || 0) +
        (item.toppings?.reduce((s, t) => s + (t.topping?.price || 0), 0) || 0)) *
        (item.quantity || 1),
    0
  )
)
</script>

<template>
  <header class="header-wrapper">
    <div class="header-inner">

      <!-- Logo -->
      <RouterLink to="/homepage" class="header-logo">
        <img src="../IMG/DripLab_Logo.png" alt="Drip Lab" />
      </RouterLink>

      <!-- Nav -->
      <nav class="header-nav">

        <!-- MENU with hover dropdown -->
        <div class="menu-wrapper" @mouseenter="onMenuEnter" @mouseleave="onMenuLeave">
          <span class="nav-link menu-trigger" :class="{ 'nav-active': showMenuDropdown }">Thực đơn</span>

          <Transition name="menu-drop">
            <div v-if="showMenuDropdown" class="menu-dropdown" @mouseenter="onDropdownEnter"
              @mouseleave="onDropdownLeave">
              <RouterLink to="/menu" class="menu-option" :class="{ 'option-active': activeMenuOption === 'buy' }"
                @click="setActiveOption('buy')">
                <i class='bx bxs-cart'></i>
                <span>Mua Ngay</span>
              </RouterLink>

              <RouterLink to="/brewing" class="menu-option" :class="{ 'option-active': activeMenuOption === 'custom' }"
                @click="setActiveOption('custom')">
                <i class='bx bxs-coffee-togo'></i>
                <span>Tự Pha Chế</span>
              </RouterLink>
            </div>
          </Transition>
        </div>

        <RouterLink to="/AboutUS" class="nav-link">Về Chúng Tôi</RouterLink>
        <RouterLink to="/voucher" class="nav-link">Khuyến Mãi</RouterLink>
        <RouterLink to="/stores" class="nav-link">Cửa hàng</RouterLink>
      </nav>

      <!-- Actions -->
      <div class="header-actions">

        <!-- User icon + dropdown -->
        <div class="user-wrapper" v-click-outside="closeUserDropdown">
          <button class="action-btn" @click="toggleUserDropdown" aria-label="Account">
            <i class='bx bxs-user'></i>
          </button>

          <Transition name="user-drop">
            <div v-if="showUserDropdown" class="user-dropdown">

              <div class="ud-header">
                <span class="mx-auto">Thông Tin Tài Khoản</span>
              </div>

              <div class="ud-profile">
                <div class="ud-avatar" v-if="auth.user != null">
                  <img :src="auth.user?.avatar" alt="Avatar" style="background-color: white;" />
                </div>
                <p class="ud-name">{{ auth.user ? auth.user.fullName : 'Chưa đăng nhập' }}</p>
                <p class="ud-email">{{ auth.user ? auth.user.email : 'Chưa đăng nhập' }}</p>
              </div>

              <div class="ud-divider"></div>

              <div class="ud-actions">
                <button class="ud-btn ud-login" :class="{ 'option-active': activeUserAction === 'login' }"
                  @click="goToLogin" v-if="!auth.user">
                  <span class="material-symbols-outlined">login</span>
                  <span>Đăng nhập</span>
                </button>

                <button class="ud-btn ud-register" :class="{ 'option-active': activeUserAction === 'register' }"
                  @click="goToRegister" v-if="!auth.user">
                  <span class="material-symbols-outlined">person_add</span>
                  <span>Đăng ký</span>
                </button>

                <!-- after login -->
                <button class="ud-btn ud-register" :class="{ 'option-active': activeUserAction === 'account' }"
                  @click="goToAccount" aria-label="Cài đặt tài khoản" v-if="auth.user">
                  <span class="material-symbols-outlined">settings</span>
                  <span>Thông tin tài khoản</span>
                </button>
              </div>

            </div>
          </Transition>
        </div>

        <!-- Cart icon + badge + mini dropdown -->
        <div class="cart-wrapper" @mouseenter="onCartEnter" @mouseleave="onCartLeave">
          <button class="action-btn cart-btn" @click="goToCart" aria-label="Cart">
            <i class='bx bxs-shopping-bag'></i>
            <Transition name="badge-pop">
              <span v-if="cartItemCount > 0" class="cart-badge">
                {{ cartItemCount > 99 ? '99+' : cartItemCount }}
              </span>
            </Transition>
          </button>

          <!-- Mini Cart Dropdown -->
          <Transition name="cart-drop">
            <div v-if="showCartDropdown" class="cart-dropdown"
              @mouseenter="onCartDropdownEnter"
              @mouseleave="onCartDropdownLeave">

              <div class="cd-header">
                <span class="cd-title">Giỏ Hàng</span>
                <span class="cd-count">{{ cartItemCount }} sản phẩm</span>
              </div>

              <!-- Empty state -->
              <div v-if="cartPreviewItems.length === 0" class="cd-empty">
                <i class='bx bxs-coffee-togo cd-empty-icon'></i>
                <p>Giỏ hàng trống</p>
              </div>

              <!-- Item list -->
              <div v-else class="cd-list">
                <div v-for="item in cartPreviewItems" :key="item.id" class="cd-item">
                  <div class="cd-item-img">
                    <img :src="item.image" :alt="item.name" />
                  </div>
                  <div class="cd-item-info">
                    <p class="cd-item-name">{{ item.name }}</p>
                    <p class="cd-item-meta" v-if="item.sizeName">Size: {{ item.sizeName }}</p>
                    <p class="cd-item-price">
                      {{ formatVND(item.price) }}
                      <span class="cd-item-qty">x{{ item.quantity }}</span>
                    </p>
                  </div>
                  <button class="cd-item-remove" @click.stop="removeCartItem(item.id)" aria-label="Xóa">
                    ×
                  </button>
                </div>

                <p v-if="cartStore.items.length > 4" class="cd-more">
                  +{{ cartStore.items.length - 4 }} sản phẩm khác...
                </p>
              </div>

              <!-- Footer -->
              <div class="cd-footer" v-if="cartPreviewItems.length > 0">
                <div class="cd-subtotal">
                  <span>Tổng tiền tạm tính:</span>
                  <span class="cd-subtotal-amount">{{ formatVND(cartSubtotal) }}</span>
                </div>
                <button class="cd-checkout-btn" @click="goToCart">
                  Tiến hành thanh toán
                </button>
              </div>

            </div>
          </Transition>
        </div>

      </div>
    </div>
  </header>
</template>

<style src="../CSS-USER/InterfaceHeader.CSS"></style>