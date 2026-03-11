<style scoped src="../CSS/AdminPOS.CSS"></style>

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

    <main class="main-content">
      <!-- Products -->
      <section class="products">
        <div class="search-bar">
          <input v-model="search" type="text" placeholder="Tìm sản phẩm..." />
          <button @click="searchProduct">Tìm kiếm</button>
        </div>

        <div class="product-grid">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
            @click="addToCart(product)"
          >
            <img :src="product.img" class="product-img" />
            <p class="product-name">{{ product.name }}</p>
          </div>
        </div>
      </section>

      <!-- Cart -->
      <aside class="cart">
        <div class="cart-items">
          <h3>Sản phẩm đã gọi:</h3>

          <div v-for="item in cart" :key="item.id" class="cart-item">
            <span>{{ item.name }}</span>
            <span>x{{ item.qty }}</span>
          </div>
        </div>

        <div class="cart-footer">
          Mã giảm giá:
          <textarea placeholder="..."></textarea>

          <div class="total">Thành tiền: {{ total }} VND</div>

          <button class="pay-btn">Thanh toán</button>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { useAdminMenu } from "../JS/AdminPOS.JS";
const { menuItems, setActive, isActive, logout } = useAdminMenu();
import { usePOS } from "../JS/AdminPOS.JS";
const { search, cart, filteredProducts, searchProduct, addToCart, total, } = usePOS();
</script>
