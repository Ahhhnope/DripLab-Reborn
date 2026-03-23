<style scoped src="../CSS/AdminPOS.CSS"></style>

<template>
  <div class="pos-wrapper">
    <!-- Products -->
    <section class="products">
      <h1 class="pos-title">ĐƠN TẠI QUẦY</h1>
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

        <!-- Card topping: hiện danh sách đã chọn -->
        <div
          class="custom-card"
          :class="{ disabled: step < 4 }"
          @click="openTopping"
        >
          <h3>
            Chọn topping
            <span class="topping-count"
              >({{ selected.toppings.length }}/3)</span
            >
          </h3>
          <div v-if="selected.toppings.length > 0">
            <p v-for="(t, i) in selected.toppings" :key="i">• {{ t.name }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="order-section">
      <h2 class="order-title">Sản phẩm đã gọi</h2>

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

      <div class="order-footer">
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

    <!-- Popup topping: cho chọn nhiều + nút xác nhận -->
    <div v-if="showToppingPopup" class="popup">
      <div class="popup-box">
        <img src="../IMG/topping.jpg" class="card-img" />
        <h3>
          Chọn topping
          <span class="topping-count">({{ selected.toppings.length }}/3)</span>
        </h3>

        <!-- Topping đã chọn -->
        <div v-if="selected.toppings.length > 0" class="selected-toppings">
          <div
            v-for="(t, i) in selected.toppings"
            :key="i"
            class="selected-topping-tag"
          >
            {{ t.name }}
            <span @click="removeTopping(i)">✕</span>
          </div>
        </div>

        <!-- Danh sách topping -->
        <button
          v-for="t in toppings"
          :key="t.name"
          @click="selectTopping(t)"
          :disabled="selected.toppings.length >= 3"
          :class="{
            'topping-selected': selected.toppings.some(
              (s) => s.name === t.name,
            ),
          }"
        >
          {{ t.name }} - {{ t.price }} VND
        </button>

        <!-- Nút xác nhận -->
        <button class="confirm-topping-btn" @click="confirmTopping">
          ✓ Xác nhận ({{ selected.toppings.length }} topping)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { usePOS } from "../JS/AdminPOS.js";

const {
  search,
  step,
  selected,
  beans,
  bases,
  milks,
  toppings,
  loadProducts,
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
  removeTopping,
  confirmTopping,
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

onMounted(() => loadProducts());
</script>
