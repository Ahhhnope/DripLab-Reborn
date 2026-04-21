<style scoped src="../CSS/AdminPOS.CSS"></style>

<template>
  <div class="pos-wrapper">
    <!-- ========== CỘT TRÁI: Custom Builder ========== -->
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
        <div class="custom-card" :class="{ disabled: step < 2 }" @click="openBase">
          <h3>Chọn base</h3>
          <p v-if="selected.base">{{ selected.base.name }}</p>
        </div>
        <div class="custom-card" :class="{ disabled: step < 3 }" @click="openMilk">
          <h3>Chọn sữa</h3>
          <p v-if="selected.milk">{{ selected.milk.name }}</p>
        </div>
        <div class="custom-card" :class="{ disabled: step < 4 }" @click="openTopping">
          <h3>Chọn topping <span class="topping-count">({{ selected.toppings.length }}/3)</span></h3>
          <div v-if="selected.toppings.length > 0">
            <p v-for="(t, i) in selected.toppings" :key="i">• {{ t.name }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== CỘT PHẢI: Giỏ hàng & Thanh toán ========== -->
    <div class="order-section">
      <h2 class="order-title">Sản phẩm đã gọi</h2>

      <!-- Danh sách món -->
      <div class="order-list">
        <div v-for="(item, index) in orderedItems" :key="index" class="order-item">
          <div class="item-info">
            <span class="item-name">{{ item.name }} x{{ item.qty }}</span>
          </div>
          <span class="item-price">{{ item.price.toLocaleString() }}đ</span>
          <button class="remove-btn" @click="removeItem(index)">✕</button>
        </div>
      </div>

      <!-- Mã giảm giá -->
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
        <p v-if="discountMessage" class="discount-message"
          :class="{ success: discountPercent > 0, error: discountPercent === 0 }">
          {{ discountMessage }}
        </p>
      </div>

      <!-- Tổng tiền & Thanh toán -->
      <div class="order-footer">
        <p v-if="discountPercent > 0" class="original-price">
          Giá gốc: {{ totalPrice.toLocaleString() }}đ
        </p>
        <p class="total">
          Thành tiền: {{ finalPrice.toLocaleString() }}đ
          <span v-if="discountPercent > 0" class="discount-badge">-{{ discountPercent }}%</span>
        </p>
        <button class="checkout-btn" @click="checkout">Thanh toán</button>
      </div>
    </div>

    <!-- ========== POPUP: Chọn Bean ========== -->
    <Teleport to="body">
      <div v-if="showBeanPopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/Bean.jpg" class="card-img" />
          <h3>Chọn hạt cà phê</h3>
          <button v-for="b in beans" :key="b.name" @click="selectBean(b)">
            {{ b.name }} - {{ b.price.toLocaleString() }}đ
          </button>
        </div>
      </div>

      <!-- ========== POPUP: Chọn Base ========== -->
      <div v-if="showBasePopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/base.png" class="card-img" />
          <h3>Chọn base</h3>
          <button v-for="b in bases" :key="b.name" @click="selectBase(b)">
            {{ b.name }} - {{ b.price.toLocaleString() }}đ
          </button>
        </div>
      </div>

      <!-- ========== POPUP: Chọn Sữa ========== -->
      <div v-if="showMilkPopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/milk.jpg" class="card-img" />
          <h3>Chọn sữa</h3>
          <button v-for="m in milks" :key="m.name" @click="selectMilk(m)">
            {{ m.name }} - {{ m.price.toLocaleString() }}đ
          </button>
        </div>
      </div>

      <!-- ========== POPUP: Chọn Topping ========== -->
      <div v-if="showToppingPopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/topping.jpg" class="card-img" />
          <h3>Chọn topping <span class="topping-count">({{ selected.toppings.length }}/3)</span></h3>
          <div v-if="selected.toppings.length > 0" class="selected-toppings">
            <div v-for="(t, i) in selected.toppings" :key="i" class="selected-topping-tag">
              {{ t.name }}
              <span @click="removeTopping(i)">✕</span>
            </div>
          </div>
          <button v-for="t in toppings" :key="t.name"
            @click="selectTopping(t)"
            :disabled="selected.toppings.length >= 3"
            :class="{ 'topping-selected': selected.toppings.some(s => s.name === t.name) }">
            {{ t.name }} - {{ t.price.toLocaleString() }}đ
          </button>
          <button class="confirm-topping-btn" @click="confirmTopping">
            ✓ Xác nhận ({{ selected.toppings.length }} topping)
          </button>
        </div>
      </div>
    </Teleport>
    <!-- ========== POPUP: Thanh toán ========== -->
    <div v-if="showPaymentPopup" class="popup">
      <div class="payment-popup">
        <h2 class="payment-title">Thanh toán</h2>

        <!-- Tab phương thức -->
        <div class="payment-methods">
          <div class="payment-method-item"
            :class="{ active: paymentMethod === 'cash' }"
            @click="paymentMethod = 'cash'">
            💵 Tiền mặt
          </div>
          <div class="payment-method-item momo-tab"
            :class="{ active: paymentMethod === 'momo' }"
            @click="paymentMethod = 'momo'">
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
                  placeholder="Nhập số tiền..." class="inline-input"
                  @keypress="(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault() }"
                  @paste="(e) => { e.preventDefault(); const txt = e.clipboardData.getData('text').replace(/\D/g,''); customerMoney = txt }" />
                <span class="inline-input-suffix">VND</span>
              </div>
            </div>
            <div class="summary-row highlight">
              <span>Tiền thừa</span>
              <strong>{{ changeAmount.toLocaleString() }} VND</strong>
            </div>
          </div>
          <p v-if="customerMoney && (parseInt(customerMoney) || 0) < finalPrice" class="cash-insufficient">
            ⚠ Số tiền chưa đủ, còn thiếu {{ (finalPrice - (parseInt(customerMoney) || 0)).toLocaleString() }} VND
          </p>
          <div class="payment-footer">
            <button class="btn-cancel" @click="closePaymentPopup">Hủy</button>
            <button class="btn-confirm"
              :class="{ disabled: !customerMoney || (parseInt(customerMoney) || 0) < finalPrice }"
              :disabled="!customerMoney || (parseInt(customerMoney) || 0) < finalPrice"
              @click="confirmPayment">
              Hoàn thành
            </button>
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
            <div class="momo-input-wrap"
              :class="{ loading: momoLoading, found: momoName, error: momoError }">
              <span class="momo-input-prefix">🇻🇳 +84</span>
              <input :value="momoPhone" @input="onMomoPhoneInput"
                type="tel" inputmode="numeric"
                placeholder="Nhập số điện thoại..."
                class="momo-input" maxlength="10" />
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
                :disabled="!momoName" :class="{ disabled: !momoName }"
                @click="confirmMomoReceiver">Tiếp tục</button>
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

    <!-- ========== POPUP: Thành công ========== -->
    <div v-if="showSuccessPopup" class="popup">
      <div class="success-popup">
        <div class="success-header" :class="{ 'success-header--cash': paymentMethod === 'cash' }">
          <p class="success-header-title">Kết Quả Giao Dịch</p>
        </div>
        <div class="success-body">
          <div class="success-icon-wrap">
            <div class="success-icon">✓</div>
          </div>
          <h2 class="success-title">Giao dịch thành công</h2>
          <p class="success-amount">{{ finalPrice.toLocaleString() }}đ</p>

          <template v-if="paymentMethod === 'cash'">
            <div class="success-receipt">
              <div class="success-receipt-header success-receipt-header--cash">
                <span class="receipt-label">Biên lai thanh toán</span>
              </div>
              <div class="success-row b"><span>Phương thức</span><span>Tiền mặt</span></div>
              <div class="success-row b"><span>Thời gian</span><span>{{ txTime }}</span></div>
              <div class="success-row b"><span>Mã giao dịch</span><span class="tx-id">{{ txId }}</span></div>
              <div class="receipt-divider"></div>
              <div class="success-row b"><span>Số tiền</span><span class="cash-need">{{ finalPrice.toLocaleString() }} VNĐ</span></div>
              <div class="success-row b"><span>Khách đưa</span><span>{{ (parseInt(customerMoney) || 0).toLocaleString() }} VNĐ</span></div>
              <div class="success-row b"><span>Tiền thừa</span><span class="cash-change">{{ changeAmount.toLocaleString() }} VNĐ</span></div>
            </div>
          </template>

          <template v-else>
            <div class="success-info">
              <div class="success-row"><span>Thời gian</span><span>{{ txTime }}</span></div>
              <div class="success-row"><span>Mã giao dịch</span><span class="tx-id pink">{{ txId }} ›</span></div>
            </div>
            <div class="success-receipt">
              <div class="success-receipt-header">
                <img :src="logoMomo" class="receipt-logo" alt="MoMo" />
                <span class="receipt-label">Biên lai chuyển tiền</span>
              </div>
              <div class="success-row b"><span>Người nhận</span><span>{{ momoName }}</span></div>
              <div class="success-row b"><span>Số TK</span><span>{{ momoPhone }}</span></div>
              <div class="success-row b"><span>Nguồn tiền</span><span>Ví MoMo</span></div>
              <div class="success-row b"><span>Tin nhắn</span><span>DripLab - Thanh toán đơn hàng</span></div>
            </div>
          </template>

          <button class="success-close-btn"
            :class="{ 'success-close-btn--cash': paymentMethod === 'cash' }"
            @click="closeSuccessPopup">
            Hoàn thành
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePOS } from '../JS/AdminPOS.JS'

const logoMomo = new URL('../IMG/logoMOMO.png', import.meta.url).href

const {
  search, step, selected,
  beans, bases, milks, toppings,
  loadProducts,
  orderedItems,
  showBeanPopup, showBasePopup, showMilkPopup, showToppingPopup,
  openBean, openBase, openMilk, openTopping,
  selectBean, selectBase, selectMilk, selectTopping,
  removeTopping, confirmTopping,
  removeItem,
  discountInput, discountCodeList, discountPercent, discountMessage,
  totalPrice, finalPrice, applyDiscount,
  checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount,
  confirmPayment, closePaymentPopup,
  showSuccessPopup, closeSuccessPopup, txId, txTime,
  momoPhone, momoName, momoStep, momoError, momoLoading,
  onMomoPhoneInput, confirmMomoReceiver, backMomo,
  searchProduct,
} = usePOS()

onMounted(() => loadProducts())
</script>