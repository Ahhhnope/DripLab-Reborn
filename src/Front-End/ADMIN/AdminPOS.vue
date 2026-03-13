<style scoped src="../CSS/AdminPOS.CSS"></style>

<template>
  <div class="admin-layout">
    <main class="main-content">
      <!-- Products -->
      <section class="products">
        <div class="search-bar">
          <input v-model="search" type="text" placeholder="Tìm sản phẩm..." />
          <button @click="searchProduct">Tìm kiếm</button>
        </div>

        <div class="custom-grid">
          <div class="custom-card" @click="openBean">
            <h3>Chọn hạt cà phê</h3>
            <p v-if="selected.bean">{{ selected.bean.name }}</p>
          </div>

          <div
            class="custom-card"
            :class="{ disabled: step < 2 }"
            @click="openBase"
          >
            <h3>Chọn base</h3>
            <p v-if="selected.base">{{ selected.base.name }}</p>
          </div>

          <div
            class="custom-card"
            :class="{ disabled: step < 3 }"
            @click="openMilk"
          >
            <h3>Chọn sữa</h3>
            <p v-if="selected.milk">{{ selected.milk.name }}</p>
          </div>

          <div
            class="custom-card"
            :class="{ disabled: step < 4 }"
            @click="openTopping"
          >
            <h3>Chọn topping</h3>
            <p v-if="selected.topping">{{ selected.topping.name }}</p>
          </div>
        </div>
      </section>

      <div class="order-section">
      <h2 class="order-title">Sản phẩm đã gọi</h2>

      <!-- Danh sách món -->
      <div class="order-list">
        <div
          v-for="(item, index) in orderedItems"
          :key="index"
          class="order-item"
        >
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
          </div>
          <span class="item-price">{{ item.price.toLocaleString() }} VND</span>
          <button class="remove-btn" @click="removeItem(index)">✕</button>
        </div>
      </div>

      <!-- Mã khuyến mãi -->
      <div class="discount-section">
        <p class="discount-label">Mã khuyến mãi</p>
        <div class="discount-bar">
          <input
            v-model="discountInput"
            type="text"
            placeholder="Nhập mã..."
            class="discount-input"
          />
          <button class="discount-btn" @click="applyDiscount">Áp dụng</button>
        </div>
        <!-- Thông báo kết quả -->
        <p
          v-if="discountMessage"
          class="discount-message"
          :class="{
            success: discountPercent > 0,
            error: discountPercent === 0,
          }"
        >
          {{ discountMessage }}
        </p>
      </div>

      <!-- Footer: tổng tiền + thanh toán -->
      <div class="order-footer">
        <!-- Hiện giá gốc nếu có giảm giá -->
        <p v-if="discountPercent > 0" class="original-price">
          Giá gốc: {{ totalPrice.toLocaleString() }} VND
        </p>

        <p class="total">
          Thành tiền: {{ finalPrice.toLocaleString() }} VND
          <span v-if="discountPercent > 0" class="discount-badge"
            >-{{ discountPercent }}%</span
          >
        </p>
        <button class="checkout-btn" @click="checkout">Thanh toán</button>
      </div>
    </div>
      
      <div v-if="showBeanPopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/Bean.jpg" class="card-img" />
          <h3>Chọn hạt cà phê</h3>

          <button v-for="b in beans" :key="b.name" @click="selectBean(b)">
            {{ b.name }} - {{ b.price }} VND
          </button>
        </div>
      </div>

      <div v-if="showBasePopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/base.png" class="card-img" />
          <h3>Chọn base</h3>

          <button v-for="b in bases" :key="b.name" @click="selectBase(b)">
            {{ b.name }} - {{ b.price }} VND
          </button>
        </div>
      </div>

      <div v-if="showMilkPopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/milk.jpg" class="card-img" />
          <h3>Chọn sữa</h3>

          <button v-for="m in milks" :key="m.name" @click="selectMilk(m)">
            {{ m.name }} - {{ m.price }} VND
          </button>
        </div>
      </div>

      <div v-if="showToppingPopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/topping.jpg" class="card-img" />
          <h3>Chọn topping</h3>

          <button v-for="t in toppings" :key="t.name" @click="selectTopping(t)">
            {{ t.name }} - {{ t.price }} VND
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { usePOS } from "../JS/AdminPOS.js";

const {
  search,
  step,
  selected,

  beans,
  bases,
  milks,
  toppings,

  orderedItems,

  showBeanPopup,
  showBasePopup,
  showMilkPopup,
  showToppingPopup,

  openBean,
  openBase,
  openMilk,
  openTopping,

  selectBean,
  selectBase,
  selectMilk,
  selectTopping,

  removeItem,

  discountInput,
  discountPercent,
  discountMessage,
  totalPrice,
  finalPrice,
  applyDiscount,
  checkout,

  searchProduct,
} = usePOS();
</script>
