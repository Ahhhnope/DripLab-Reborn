<script setup>
import { useRouter } from 'vue-router'
import { useCounterOrder } from "../JS/CounterOrder.JS";

const router = useRouter()

const logoMomo = new URL('../IMG/logoMOMO.png', import.meta.url).href

const {
  searchText, products, searchProducts,
  showOrderScreen, orderList, currentOrder, createNewOrder, selectOrder,
  orderedItems, totalPrice, removeItem,
  discountInput, discountCodeList, appliedCode, discountPercent, discountMessage, applyDiscount, finalPrice,
  checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount, confirmPayment, closePaymentPopup,
  showSuccessPopup, closeSuccessPopup, txId, txTime,
  momoPhone, momoName, momoStep, momoError, momoLoading,
  onMomoPhoneInput, confirmMomoReceiver, backMomo,
  showPopup, selectedProduct, toppingList, selectedToppings, selectedSize, selectedQty,
  openPopup, closePopup, toggleTopping, isToppingSelected, incQty, decQty, confirmOrder,
} = useCounterOrder()

function handleProductClick(product) {
  if (product.id === 0) router.push('/AdminPOS')
  else openPopup(product)
}
</script>

<style scoped src="../CSS/CounterOrder.CSS"></style>

<template>
  <div class="counter-order">

    <!-- CỘT TRÁI -->
    <div class="product-section">
      <h1 class="title">ĐƠN TẠI QUẦY</h1>

      <div v-if="showOrderScreen" class="top-left-area">
        <button class="create-order-btn-center" @click="createNewOrder">+ Thêm hóa đơn</button>
      </div>

      <template v-else>
        <div class="search-bar">
          <input v-model="searchText" type="text" placeholder="Tìm sản phẩm..." class="search-input" />
          <button class="search-btn" @click="searchProducts">Tìm kiếm</button>
        </div>
        <div class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-card" @click="handleProductClick(product)">
            <img :src="product.image" :alt="product.name" class="product-img" />
            <p class="product-name" :class="{ bold: product.id === 0 }">{{ product.name }}</p>
          </div>
        </div>
      </template>
    </div>

    <!-- CỘT PHẢI -->
    <div class="order-section">
      <div v-if="showOrderScreen" class="order-screen">
        <h2 class="order-title">Danh sách hóa đơn</h2>
        <div class="order-screen-list">
          <div v-for="(order, index) in orderList" :key="order.id" class="order-screen-item" @click="selectOrder(order)">
            HD {{ index + 1 }}
          </div>
        </div>
      </div>

      <template v-else>
        <h2 class="order-title">Sản phẩm đã gọi</h2>
        <div class="order-list">
          <div v-for="(item, index) in orderedItems" :key="index" class="order-item">
            <div class="item-info">
              <span class="item-name">{{ item.name }} ({{ item.size }}) x{{ item.qty }}</span>
              <span class="item-topping">{{ item.toppings }}</span>
            </div>
            <span class="item-price">{{ (item.price * item.qty).toLocaleString() }}đ</span>
            <button class="remove-btn" @click="removeItem(index)">✕</button>
          </div>
        </div>

        <div class="discount-section">
          <p class="discount-label">Mã khuyến mãi</p>
          <div class="discount-bar">
            <select v-model="discountInput" class="discount-select">
              <option value="">-- Chọn mã --</option>
              <option v-for="item in discountCodeList" :key="item.code" :value="item.code">{{ item.label }}</option>
            </select>
            <button class="discount-btn" @click="applyDiscount">Áp dụng</button>
          </div>
          <p v-if="discountMessage" class="discount-message"
             :class="{ success: discountPercent > 0, error: discountPercent === 0 }">
            {{ discountMessage }}
          </p>
        </div>

        <div class="order-footer">
          <p v-if="discountPercent > 0" class="original-price">Giá gốc: {{ totalPrice.toLocaleString() }}đ</p>
          <p class="total">
            Thành tiền: {{ finalPrice.toLocaleString() }}đ
            <span v-if="discountPercent > 0" class="discount-badge">-{{ discountPercent }}%</span>
          </p>
          <button class="checkout-btn" @click="checkout">Thanh toán</button>
        </div>
      </template>
    </div>

    <!-- POPUP: Chọn Topping, Size & Số lượng -->
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

        <!-- Size + Số lượng cùng hàng -->
        <div class="size-qty-row">
          <div class="size-col">
            <p class="popup-label">Size</p>
            <div class="size-group">
              <button class="size-btn" :class="{ selected: selectedSize === 'M' }" @click="selectedSize = 'M'">M</button>
              <button class="size-btn" :class="{ selected: selectedSize === 'L' }" @click="selectedSize = 'L'">L</button>
            </div>
          </div>
          <div class="qty-col">
            <p class="popup-label">Số lượng</p>
            <div class="qty-group">
              <button class="qty-btn" @click="decQty">−</button>
              <span class="qty-value">{{ selectedQty }}</span>
              <button class="qty-btn" @click="incQty">+</button>
            </div>
          </div>
        </div>

        <div class="popup-actions">
          <button class="cancel-btn" @click="closePopup">Hủy</button>
          <button class="confirm-btn" @click="confirmOrder">Xác nhận</button>
        </div>
      </div>
    </div>

    <!-- POPUP: Thanh toán -->
    <div v-if="showPaymentPopup" class="popup-overlay">
      <div class="payment-popup">
        <h2 class="payment-title">Thanh toán</h2>

        <div class="payment-methods">
          <div class="payment-method-item" :class="{ active: paymentMethod === 'cash' }" @click="paymentMethod = 'cash'">
            💵 Tiền mặt
          </div>
          <div class="payment-method-item momo-tab" :class="{ active: paymentMethod === 'momo' }" @click="paymentMethod = 'momo'">
            <img :src="logoMomo" class="momo-tab-logo" alt="MoMo" />
            MoMo
          </div>
        </div>

        <!-- TIỀN MẶT -->
        <template v-if="paymentMethod === 'cash'">
          <div class="payment-summary">
            <div class="summary-row">
              <span>Tổng tiền</span>
              <strong>{{ finalPrice.toLocaleString() }} VND</strong>
            </div>
            <div class="summary-row">
              <span>Khách đưa</span>
              <div class="inline-input-wrap">
                <input v-model="customerMoney" type="text" inputmode="numeric"
                  placeholder="Nhập số tiền..." class="inline-input" />
                <span class="inline-input-suffix">VND</span>
              </div>
            </div>
            <div class="summary-row highlight">
              <span>Tiền thừa</span>
              <strong>{{ changeAmount.toLocaleString() }} VND</strong>
            </div>
          </div>
          <div class="payment-footer">
            <button class="btn-cancel" @click="closePaymentPopup">Hủy</button>
            <button class="btn-confirm" @click="confirmPayment">Hoàn thành</button>
          </div>
        </template>

        <!-- MOMO -->
        <template v-else>
          <div class="momo-header">
            <img :src="logoMomo" class="momo-logo" alt="MoMo" />
            <div>
              <p class="momo-brand">Ví MoMo</p>
              <p class="momo-amount">{{ finalPrice.toLocaleString() }} VND</p>
            </div>
          </div>

          <!-- Bước 1: Nhập SĐT -->
          <div v-if="momoStep === 1" class="momo-body">
            <p class="momo-label">Số điện thoại người nhận</p>

            <div class="momo-input-wrap" :class="{ loading: momoLoading, found: momoName, error: momoError }">
              <span class="momo-input-prefix">🇻🇳 +84</span>
              <input
                :value="momoPhone"
                @input="onMomoPhoneInput"
                type="tel"
                inputmode="numeric"
                placeholder="Nhập số điện thoại..."
                class="momo-input"
                maxlength="10"
              />
              <span v-if="momoLoading" class="momo-status-icon spin">⟳</span>
              <span v-else-if="momoName" class="momo-status-icon green">✓</span>
              <span v-else-if="momoError" class="momo-status-icon red">✕</span>
            </div>

            <transition name="slide-down">
              <div v-if="momoName" class="momo-found-card">
                <div class="momo-avatar">{{ momoName.charAt(0) }}</div>
                <div class="momo-found-info">
                  <p class="momo-found-name">{{ momoName }}</p>
                  <p class="momo-found-phone">{{ momoPhone }}</p>
                </div>
                <span class="momo-verified">✓ Đã xác thực</span>
              </div>
            </transition>

            <p v-if="momoError" class="momo-error-msg">{{ momoError }}</p>

            <div class="payment-footer">
              <button class="btn-cancel" @click="closePaymentPopup">Hủy</button>
              <button class="btn-confirm momo-btn"
                :disabled="!momoName"
                :class="{ disabled: !momoName }"
                @click="confirmMomoReceiver">
                Tiếp tục
              </button>
            </div>
          </div>

          <!-- Bước 2: Xác nhận -->
          <div v-else class="momo-body">
            <div class="momo-processing-label">
              <span class="momo-processing-dot"></span>
              Giao dịch đang được xử lý
            </div>
            <div class="momo-confirm-card">
              <div class="momo-confirm-row">
                <span class="momo-confirm-label">Người nhận</span>
                <span class="momo-confirm-val">{{ momoName }}</span>
              </div>
              <div class="momo-confirm-row">
                <span class="momo-confirm-label">Số điện thoại</span>
                <span class="momo-confirm-val">{{ momoPhone }}</span>
              </div>
              <div class="momo-confirm-row">
                <span class="momo-confirm-label">Số tiền</span>
                <span class="momo-confirm-val bold pink">{{ finalPrice.toLocaleString() }} VND</span>
              </div>
              <div class="momo-confirm-row">
                <span class="momo-confirm-label">Lời nhắn</span>
                <span class="momo-confirm-val">DripLab - Thanh toán đơn hàng</span>
              </div>
            </div>
            <div class="payment-footer">
              <button class="btn-cancel" @click="backMomo">Quay lại</button>
              <button class="btn-confirm momo-btn" @click="confirmPayment">Xác nhận</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- POPUP: Thành công -->
    <div v-if="showSuccessPopup" class="popup-overlay">
      <div class="success-popup">

        <!-- Header gradient -->
        <div class="success-header">
          <p class="success-header-title">Kết Quả Giao Dịch</p>
        </div>

        <!-- Body -->
        <div class="success-body">
          <!-- Icon + tiêu đề -->
          <div class="success-icon-wrap">
            <div class="success-icon">✓</div>
          </div>
          <h2 class="success-title">Giao dịch thành công</h2>
          <p class="success-amount">{{ finalPrice.toLocaleString() }}đ</p>

          <!-- Bảng thông tin -->
          <div class="success-info">
            <div class="success-row">
              <span>Thời gian thanh toán</span>
              <span>{{ txTime }}</span>
            </div>
            <div class="success-row">
              <span>Chi tiết giao dịch</span>
              <span class="tx-id pink">{{ txId }} ›</span>
            </div>
          </div>

          <!-- Card biên lai -->
          <div class="success-receipt">
            <div class="success-receipt-header">
              <img :src="logoMomo" class="receipt-logo" alt="MoMo" />
              <span class="receipt-label">Biên lai chuyển tiền</span>
            </div>
            <div class="success-row b">
              <span>Người nhận</span>
              <span>{{ paymentMethod === "momo" ? momoName : "Tiền mặt" }}</span>
            </div>
            <div class="success-row b" v-if="paymentMethod === 'momo'">
              <span>Số thẻ/TK</span>
              <span>{{ momoPhone }}</span>
            </div>
            <div class="success-row b">
              <span>Nguồn tiền</span>
              <span>{{ paymentMethod === "momo" ? "Ví MoMo" : "Tiền mặt" }}</span>
            </div>
            <div class="success-row b">
              <span>Tin nhắn</span>
              <span>DripLab - Thanh toán đơn hàng</span>
            </div>
          </div>

          <button class="success-close-btn" @click="closeSuccessPopup">Hoàn thành</button>
        </div>

      </div>
    </div>

  </div>
</template>