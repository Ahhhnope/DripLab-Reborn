<script setup>
import { useAdminMenu } from "../JS/FrameInterface.JS";
import CounterOrder from "./CounterOrder.vue";
import AdminPOS from './AdminPOS.vue'
import Products from "./Products.vue";
const { menuItems, setActive, isActive, logout, activeIndex } = useAdminMenu();
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
            :class="{ active: isActive(item.id) }"
            @click="setActive(item.id)"
          >
            {{ item.label }}
          </button>
        </li>
      </ul>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">← LOGOUT</button>
      </div>
    </aside>

    <!-- Phần Nội dung code Bên phải  -->
    <main class="main-content">
      <!-- Link Đơn hàng tại quầy -->
      <CounterOrder
        v-if="activeIndex === 2"
        @openCustom="activeIndex = 6"
      ></CounterOrder>
      <AdminPOS v-if="activeIndex === 6"></AdminPOS>
      <Products v-if="activeIndex === 3"></Products>
    </main>
  </div>
</template>
