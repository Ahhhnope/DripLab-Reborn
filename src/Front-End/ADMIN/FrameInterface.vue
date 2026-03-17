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
      <div class="sidebar-header">
        <img src="../IMG/DripLab_Logo.png" class="sidebar-logo" alt="logo" />
        <span class="sidebar-title">ADMIN</span>
      </div>

      <ul class="sidebar-nav">
        <li v-for="item in menuItems" :key="item.id">

          <button
            class="nav-item"
            :class="{ active: activeIndex === item.id }"
            @click="clickMenu(item)"
          >
            {{ item.label }}
            <span v-if="item.children">{{ openMenu === item.id ? '▴' : '▾' }}</span>
          </button>

          <!-- Level 1 -->
          <ul v-if="item.children && openMenu === item.id" class="submenu">
            <li v-for="child in item.children" :key="child.id">

              <button
                class="nav-item sub-item"
                :class="{ active: activeIndex === child.id }"
                @click="clickSub(child)"
              >
                {{ child.label }}
                <span v-if="child.subChildren">{{ openSub === child.id ? '▴' : '▾' }}</span>
              </button>

              <!-- Level 2 -->
              <ul v-if="child.subChildren && openSub === child.id" class="submenu level2-menu">
                <li v-for="sub in child.subChildren" :key="sub.id">
                  <button
                    class="nav-item sub-item level2"
                    :class="{ active: activeIndex === sub.id }"
                    @click="activeIndex = sub.id"
                  >
                    {{ sub.label }}
                  </button>
                </li>
              </ul>

            </li>
          </ul>

        </li>
      </ul>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">← LOGOUT</button>
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