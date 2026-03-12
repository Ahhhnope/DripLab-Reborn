<script setup>
import { useCounterOrder } from "../JS/CounterOrder.JS";

const {
  searchText, // Tìm kiếm tên sản phầm
  products, // Danh sách sản phẩm hiển thị
  orderedItems, // Danh sách món đã gọi
  totalPrice, // Tổng tiền gốc
  finalPrice, // Tổng tiền sau khi giảm
  searchProducts, // Hàm tìm kiếm sản phẩm
  removeItem, // Hàm xóa món khỏi đơn
  checkout, // Thanh toán
  // mã khuyến mãi
  discountInput, // Mã khuyến mãi đang nhập
  appliedCode, // Mã đã được áp dụng thành công
  discountPercent, // % giảm giá hiện tại
  discountMessage, // Thông báo mã đúng/sai
  applyDiscount, // Hàm áp dụng mã khuyến mãi
  // popup - Cửa sổ mở ra
  showPopup, // Cửa sổ đang hiện hoặc ẩn
  selectedProduct, // Sản phẩm đang được chọn trong cửa sổ
  toppingList, // Danh sách topping
  selectedToppings, // Danh sách topping đã chọn
  selectedSize, // Size (M hoặc L)
  openPopup, // Mở cửa sổ
  closePopup, //đóng cửa sổ
  toggleTopping, // Hàm bật/tắt chọn topping
  isToppingSelected, // Kiểm tra topping có đang được chọn không
  confirmOrder, //Hàm xác nhận thêm món vào đơn
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
    <!-- ===== danh sách sản phẩm ===== -->
    <div class="product-section">
      <h1 class="title">ĐƠN TẠI QUẦY</h1>

      <!-- Thanh tìm kiếm -->
      <div class="search-bar">
        <input
          v-model="searchText"
          type="text"
          placeholder="Tìm sản phẩm..."
          class="search-input"
        />
        <button class="search-btn" @click="searchProducts">Tìm kiếm</button>
      </div>

      <!-- Lưới sản phẩm -->
      <div class="product-grid">
        <div
          v-for="product in products"
          :key="product.id"
          class="product-card"
          @click="handleProductClick(product)"
        >
          <img :src="product.image" :alt="product.name" class="product-img" />
          <p class="product-name" :class="{ bold: product.id === 0 }">
            {{ product.name }}
          </p>
        </div>
      </div>
    </div>

    <!-- ===== CỘT PHẢI: giỏ hàng ===== -->
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
            <span class="item-name">{{ item.name }} ({{ item.size }})</span>
            <span class="item-topping">Topping: {{ item.toppings }}</span>
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

    <!-- ===== Cửa sổ chọn topping & size (POPUP) ===== -->
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup">
        <h2 class="popup-product-name">{{ selectedProduct.name }}</h2>

        <!-- Topping -->
        <p class="popup-label">Topping</p>
        <div class="topping-grid">
          <div
            v-for="topping in toppingList"
            :key="topping.id"
            class="topping-card"
            :class="{ selected: isToppingSelected(topping) }"
            @click="toggleTopping(topping)"
          >
            <span class="topping-name">{{ topping.name }}</span>
            <span class="topping-price"
              >+{{ topping.price.toLocaleString() }}đ</span
            >
          </div>
        </div>

        <!-- Size -->
        <p class="popup-label">Size</p>
        <div class="size-group">
          <button
            class="size-btn"
            :class="{ selected: selectedSize === 'M' }"
            @click="selectedSize = 'M'"
          >
            M
          </button>
          <button
            class="size-btn"
            :class="{ selected: selectedSize === 'L' }"
            @click="selectedSize = 'L'"
          >
            L
          </button>
        </div>

        <!-- Hủy / Xác nhận -->
        <div class="popup-actions">
          <button class="cancel-btn" @click="closePopup">Hủy</button>
          <button class="confirm-btn" @click="confirmOrder">Xác nhận</button>
        </div>
      </div>
    </div>
  </div>
</template>
