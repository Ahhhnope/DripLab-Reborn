<script setup>
import { useHeader } from '../JS-USER/InterfaceHeader.js'

const {
  goToLogin,
  goToRegister,
  goToCart,
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
} = useHeader()
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
        <div
          class="menu-wrapper"
          @mouseenter="onMenuEnter"
          @mouseleave="onMenuLeave"
        >
          <span class="nav-link menu-trigger" :class="{ 'nav-active': showMenuDropdown }">Thực đơn</span>

          <Transition name="menu-drop">
            <div
              v-if="showMenuDropdown"
              class="menu-dropdown"
              @mouseenter="onDropdownEnter"
              @mouseleave="onDropdownLeave"
            >
              <RouterLink
                to="/menu"
                class="menu-option"
                :class="{ 'option-active': activeMenuOption === 'buy' }"
                @click="setActiveOption('buy')"
              >
                <i class='bx bxs-cart'></i>
                <span>Mua Ngay</span>
              </RouterLink>

              <RouterLink
                to="/brewing"
                class="menu-option"
                :class="{ 'option-active': activeMenuOption === 'custom' }"
                @click="setActiveOption('custom')"
              >
                <i class='bx bxs-coffee-togo'></i>
                <span>Tự Pha Chế</span>
              </RouterLink>
            </div>
          </Transition>
        </div>

        <RouterLink to="/AboutUS"  class="nav-link">Về Chúng Tôi</RouterLink>
        <RouterLink to="/voucher"   class="nav-link">Khuyến Mãi</RouterLink>
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
                <span>Thông Tin Tài Khoản</span>
              </div>

              <div class="ud-profile">
                <div class="ud-avatar">
                  <img src="../IMG/DELLBIETNOIGI.jpg" alt="Avatar" />
                </div>
                <p class="ud-name">Nguyễn Văn A</p>
                <p class="ud-email">abc@gmail.com</p>
              </div>

              <div class="ud-divider"></div>

              <div class="ud-actions">
                <button
                  class="ud-btn ud-login"
                  :class="{ 'option-active': activeUserAction === 'login' }"
                  @click="goToLogin"
                >
                  <span class="material-symbols-outlined">login</span>
                  <span>Đăng nhập</span>
                </button>
                <button
                  class="ud-btn ud-register"
                  :class="{ 'option-active': activeUserAction === 'register' }"
                  @click="goToRegister"
                >
                  <span class="material-symbols-outlined">person_add</span>
                  <span>Đăng ký</span>
                </button>
              </div>

            </div>
          </Transition>
        </div>

        <!-- Cart -->
        <button class="action-btn" @click="goToCart" aria-label="Cart">
          <i class='bx bxs-shopping-bag'></i>
        </button>

      </div>
    </div>
  </header>
</template>

<style src="../CSS-USER/InterfaceHeader.CSS"></style>