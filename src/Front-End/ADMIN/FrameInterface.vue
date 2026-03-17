<script setup>
import { useAdminMenu } from "../JS/FrameInterface.JS";
import CounterOrder from "./CounterOrder.vue";
import AdminPOS from './AdminPOS.vue'
import AdminInvoice from './AdminInvoice.vue'
import Products from "./Products.vue";
import KhuyenMai from "./KhuyenMai.vue";

const { menuItems, activeIndex, openMenu, openSub, logout } = useAdminMenu();

function clickMenu(item) {
  activeIndex.value = item.id
  if (item.children) {
    openMenu.value = openMenu.value === item.id ? null : item.id
  } else {
    openMenu.value = null
  }
  openSub.value = null
}

function clickSub(child) {
  activeIndex.value = child.id
  if (child.subChildren) {
    openSub.value = openSub.value === child.id ? null : child.id
  } else {
    openSub.value = null
  }
}
</script>

<style scoped src="../CSS/FrameInterface.CSS"></style>

<template>
  <div class="admin-layout">
    <aside class="sidebar">

      <!-- HEADER: chỉ logo, căn giữa, không có chữ ADMIN -->
      <div class="sidebar-header">
        <img src="../IMG/DripLab_Logo.png" class="sidebar-logo" alt="logo" />
      </div>

      <!-- MENU -->
      <ul class="sidebar-nav">
        <li v-for="item in menuItems" :key="item.id">

          <button class="nav-item" :class="{ active: activeIndex === item.id }" @click="clickMenu(item)">
            {{ item.label }}
            <span v-if="item.children">{{ openMenu === item.id ? '▴' : '▾' }}</span>
          </button>

          <!-- Cấp 1 -->
          <ul v-if="item.children && openMenu === item.id" class="submenu">
            <li v-for="child in item.children" :key="child.id">

              <button class="nav-item sub-item" :class="{ active: activeIndex === child.id }" @click="clickSub(child)">
                {{ child.label }}
                <span v-if="child.subChildren">{{ openSub === child.id ? '▴' : '▾' }}</span>
              </button>

              <!-- Cấp 2 -->
              <ul v-if="child.subChildren && openSub === child.id" class="submenu level2-menu">
                <li v-for="sub in child.subChildren" :key="sub.id">
                  <button class="nav-item sub-item level2" :class="{ active: activeIndex === sub.id }"
                    @click="activeIndex = sub.id">
                    {{ sub.label }}
                  </button>
                </li>
              </ul>

            </li>
          </ul>

        </li>
      </ul>

      <!-- FOOTER-->
      <div class="sidebar-footer">
        <div class="user-avatar">A</div>
        <div class="user-info">
          <div class="user-name">Quản Trị Viên</div>
          <div class="user-role">Nguyễn Huy Bình</div>
        </div>
        <button class="logout-btn" @click="logout" title="Đăng xuất">
          <!-- icon logout -->
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          </svg>
        </button>
      </div>

    </aside>

    <main class="main-content">
      <CounterOrder v-if="activeIndex === 2" @openCustom="activeIndex = 10" />
      <AdminPOS v-if="activeIndex === 10" />
      <Products v-if="activeIndex === 31" />
      <AdminInvoice v-if="activeIndex === 6" />
      <KhuyenMai v-if="activeIndex === 5" />
    </main>
  </div>
</template>