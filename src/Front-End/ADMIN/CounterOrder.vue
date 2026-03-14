<script setup>
import { useCounterOrder } from "../JS/CounterOrder.JS";

const {
  searchText,
  products,
  orderedItems,
  totalPrice,
  finalPrice,
  searchProducts,
  removeItem,
  checkout,
  // mã khuyến mãi
  discountInput,
  discountCodeList,
  appliedCode,
  discountPercent,
  discountMessage,
  applyDiscount,
  // khách hàng
  customerList,
  selectedCustomer,
  // màn hình chọn đơn
  showOrderScreen,
  orderList,
  createNewOrder,
  selectOrder,
  // popup
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

const emit = defineEmits(["openCustom"]);
function handleProductClick(product) {
  if (product.id === 0) {
    emit("openCustom");
  } else {
    openPopup(product);
  }
}
</script>

<style scoped src="../CSS/CounterOrder.CSS"></style>

<template>
  <div class="counter-order">
    <!-- ===== CỘT TRÁI ===== -->
    <div class="product-section">
      <h1 class="title">ĐƠN TẠI QUẦY</h1>

      <!-- Chưa tạo đơn: chỉ hiện nút tạo đơn ở giữa -->
      <div v-if="showOrderScreen" class="empty-order-area">
        <button class="create-order-btn-center" @click="createNewOrder">
          + Thêm hóa đơn
        </button>
      </div>

      <!-- Đã tạo đơn: hiện thanh tìm kiếm + lưới sản phẩm -->
      <template v-else>
        <!-- Thanh tìm kiếm -->
        <div class="search-bar">
          <input v-model="searchText" type="text" placeholder="Tìm sản phẩm..." class="search-input" />
          <button class="search-btn" @click="searchProducts">Tìm kiếm</button>
        </div>

        <!-- Lưới sản phẩm -->
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

    <!-- ===== CỘT PHẢI ===== -->
    <div class="order-section">

      <!-- Chưa tạo đơn: hiện tiêu đề + danh sách đơn -->
      <div v-if="showOrderScreen" class="order-screen">
        <h2 class="order-title">Sản phẩm đã gọi</h2>
        <div class="order-screen-list">
          <div v-for="(order, index) in orderList" :key="index" class="order-screen-item" @click="selectOrder(order)">
            HD {{ index + 1 }}
          </div>
        </div>
      </div>

      <!-- Đã tạo đơn: hiện giỏ hàng đầy đủ -->
      <template v-else>
        <h2 class="order-title">Sản phẩm đã gọi</h2>

        <!-- Danh sách món -->
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

        <!-- Combobox khách hàng (trên khuyến mãi) -->
        <div class="customer-section">
          <select v-model="selectedCustomer" class="customer-select">
            <option value="" disabled></option>
            <option v-for="customer in customerList" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </option>
          </select>
        </div>

        <!-- Mã khuyến mãi -->
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

        <!-- Footer: tổng tiền + thanh toán -->
        <div class="order-footer">
          <p v-if="discountPercent > 0" class="original-price">
            Giá gốc: {{ totalPrice.toLocaleString() }} VND
          </p>
          <p class="total">
            Thành tiền: {{ finalPrice.toLocaleString() }} VND
            <span v-if="discountPercent > 0" class="discount-badge">-{{ discountPercent }}%</span>
          </p>
          <button class="checkout-btn" @click="checkout">Thanh toán</button>
        </div>
      </template>
    </div>

    <!-- ===== POPUP ===== -->
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