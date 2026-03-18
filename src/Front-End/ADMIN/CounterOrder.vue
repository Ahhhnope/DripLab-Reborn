<script setup>
import { useRouter } from 'vue-router'
import { useCounterOrder } from "../JS/CounterOrder.JS";

const router = useRouter()

const {
  searchText,
  products,
  searchProducts,

  showOrderScreen,
  orderList,
  currentOrder,
  createNewOrder,
  selectOrder,

  orderedItems,
  totalPrice,
  removeItem,

  discountInput,
  discountCodeList,
  appliedCode,
  discountPercent,
  discountMessage,
  applyDiscount,
  finalPrice,

  checkout,

  showPopup,
  selectedProduct,
  toppingList,
  selectedToppings,
  selectedSize,
  openPopup,
  closePopup,
  toggleTopping,
  isToppingSelected,
  confirmOrder,
} = useCounterOrder();

function handleProductClick(product) {
  if (product.id === 0) {
    router.push('/AdminPOS')
  } else {
    openPopup(product);
  }
}
</script>

<style scoped src="../CSS/CounterOrder.CSS"></style>

<template>
  <div class="counter-order">

    <!-- CỘT TRÁI -->
    <div class="product-section">
      <h1 class="title">ĐƠN TẠI QUẦY</h1>

      <div v-if="showOrderScreen" class="top-left-area">
        <button class="create-order-btn-center" @click="createNewOrder">
          + Thêm hóa đơn
        </button>
      </div>

      <template v-else>
        <div class="search-bar">
          <input v-model="searchText" type="text" placeholder="Tìm sản phẩm..." class="search-input" />
          <button class="search-btn" @click="searchProducts">Tìm kiếm</button>
        </div>

        <div class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-card" @click="handleProductClick(product)">
            <img :src="product.image" :alt="product.name" class="product-img" />
            <p class="product-name" :class="{ bold: product.id === 0 }">
              {{ product.name }}
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- CỘT PHẢI -->
    <div class="order-section">

      <div v-if="showOrderScreen" class="order-screen">
        <h2 class="order-title">Sản phẩm đã gọi</h2>
        <div class="order-screen-list">
          <div v-for="(order, index) in orderList" :key="order.id" class="order-screen-item"
            @click="selectOrder(order)">
            HD {{ index + 1 }}
          </div>
        </div>
      </div>

      <template v-else>
        <h2 class="order-title">Sản phẩm đã gọi</h2>

        <div class="order-list">
          <div v-for="(item, index) in orderedItems" :key="index" class="order-item">
            <div class="item-info">
              <span class="item-name">{{ item.name }} ({{ item.size }})</span>
              <span class="item-topping">Topping: {{ item.toppings }}</span>
            </div>
            <span class="item-price">{{ item.price.toLocaleString() }} VND</span>
            <button class="remove-btn" @click="removeItem(index)">✕</button>
          </div>
        </div>

        <div class="discount-section">
          <p class="discount-label">Mã khuyến mãi</p>
          <div class="discount-bar">
            <select v-model="discountInput" class="discount-select">
              <option value="">-- Chọn mã --</option>
              <option v-for="item in discountCodeList" :key="item.code" :value="item.code">
                {{ item.label }}
              </option>
            </select>
            <button class="discount-btn" @click="applyDiscount">Áp dụng</button>
          </div>
          <p v-if="discountMessage" class="discount-message" :class="{
            success: discountPercent > 0,
            error: discountPercent === 0,
          }">
            {{ discountMessage }}
          </p>
        </div>

        <div class="order-footer">
          <p v-if="discountPercent > 0" class="original-price">
            Giá gốc: {{ totalPrice.toLocaleString() }} VND
          </p>
          <p class="total">
            Thành tiền: {{ finalPrice.toLocaleString() }} VND
            <span v-if="discountPercent > 0" class="discount-badge">
              -{{ discountPercent }}%
            </span>
          </p>
          <button class="checkout-btn" @click="checkout">Thanh toán</button>
        </div>
      </template>
    </div>

    <!-- POPUP: Chọn Topping và Size -->
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup">
        <h2 class="popup-product-name">{{ selectedProduct.name }}</h2>

        <p class="popup-label">Topping</p>
        <div class="topping-grid">
          <div v-for="topping in toppingList" :key="topping.id" class="topping-card"
            :class="{ selected: isToppingSelected(topping) }" @click="toggleTopping(topping)">
            <span class="topping-name">{{ topping.name }}</span>
            <span class="topping-price">+{{ topping.price.toLocaleString() }}đ</span>
          </div>
        </div>

        <p class="popup-label">Size</p>
        <div class="size-group">
          <button class="size-btn" :class="{ selected: selectedSize === 'M' }" @click="selectedSize = 'M'">M</button>
          <button class="size-btn" :class="{ selected: selectedSize === 'L' }" @click="selectedSize = 'L'">L</button>
        </div>

        <div class="popup-actions">
          <button class="cancel-btn" @click="closePopup">Hủy</button>
          <button class="confirm-btn" @click="confirmOrder">Xác nhận</button>
        </div>
      </div>
    </div>

  </div>
</template>