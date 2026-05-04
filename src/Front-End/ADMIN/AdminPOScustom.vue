<style scoped src="../CSS/AdminPOS.CSS"></style>

<template>
  <div class="pos-wrapper">

    <!-- ========== CỘT TRÁI ========== -->
    <section class="products">
      <div class="pos-header">
        <h1 class="pos-title">☕ TỰ PHA CHẾ</h1>
        <p class="pos-subtitle">Tạo ly cà phê theo phong cách của bạn</p>
      </div>

      <div class="search-bar">
        <input v-model="search" type="text" placeholder="🔍 Tìm sản phẩm..." />
        <button @click="searchProduct">Tìm</button>
      </div>

      <!-- Steps progress -->
      <div class="steps-progress">
        <div v-for="(s, i) in stepLabels" :key="i"
          :class="['step-dot', { done: step > i+1, active: step === i+1, locked: step < i+1 }]">
          <div class="step-dot-circle">{{ step > i+1 ? '✓' : i+1 }}</div>
          <span class="step-dot-label">{{ s }}</span>
        </div>
        <div class="step-line"></div>
      </div>

      <div class="custom-grid">
        <!-- BEAN -->
        <div :class="['custom-card', { 'card-done': selected.bean }]" @click="openBean">
          <div class="card-icon">🫘</div>
          <div class="card-content">
            <h3>Hạt cà phê</h3>
            <p v-if="selected.bean" class="card-selected">{{ selected.bean.name }} · {{ selected.bean.price.toLocaleString() }}đ</p>
            <p v-else class="card-hint">Chọn loại hạt</p>
          </div>
          <div class="card-arrow">{{ selected.bean ? '✓' : '›' }}</div>
        </div>

        <!-- BASE -->
        <div :class="['custom-card', { 'card-done': selected.base, 'card-locked': step < 2 }]" @click="openBase">
          <div class="card-icon">☕</div>
          <div class="card-content">
            <h3>Phương pháp pha</h3>
            <p v-if="selected.base" class="card-selected">{{ selected.base.name }} · {{ selected.base.price.toLocaleString() }}đ</p>
            <p v-else class="card-hint">{{ step < 2 ? '🔒 Chọn hạt trước' : 'Chọn phương pháp' }}</p>
          </div>
          <div class="card-arrow">{{ selected.base ? '✓' : step < 2 ? '🔒' : '›' }}</div>
        </div>

        <!-- MILK -->
        <div :class="['custom-card', { 'card-done': selected.milk, 'card-locked': step < 3 }]" @click="openMilk">
          <div class="card-icon">🥛</div>
          <div class="card-content">
            <h3>Sữa</h3>
            <p v-if="selected.milk" class="card-selected">{{ selected.milk.name }} · {{ selected.milk.price.toLocaleString() }}đ</p>
            <p v-else class="card-hint">{{ step < 3 ? '🔒 Chọn base trước' : 'Chọn loại sữa' }}</p>
          </div>
          <div class="card-arrow">{{ selected.milk ? '✓' : step < 3 ? '🔒' : '›' }}</div>
        </div>

        <!-- TOPPING -->
        <div :class="['custom-card', 'card-topping', { 'card-done': selected.toppings.length > 0, 'card-locked': step < 4 }]"
          @click="openTopping">
          <div class="card-icon">🧋</div>
          <div class="card-content">
            <h3>Topping <span class="topping-count-badge">{{ selected.toppings.length }}/3</span></h3>
            <div v-if="selected.toppings.length > 0" class="topping-chips">
              <span v-for="(t, i) in selected.toppings" :key="i" class="topping-chip">{{ t.name }}</span>
            </div>
            <p v-else class="card-hint">{{ step < 4 ? '🔒 Chọn sữa trước' : 'Chọn topping' }}</p>
          </div>
          <div class="card-arrow">{{ selected.toppings.length > 0 ? '✓' : step < 4 ? '🔒' : '›' }}</div>
        </div>
      </div>
    </section>

    <!-- ========== CỘT PHẢI: y hệt CounterOrder ========== -->
    <div class="order-section">
      <div class="order-section-title">CHI TIẾT KHÁCH HÀNG</div>

      <div class="right-customer-block">
        <p class="right-sub-title">Khách Hàng</p>
        <div class="right-info-row">
          <span class="right-info-lbl">Họ và tên:</span>
          <span class="right-info-val">{{ customerName || 'Khách lẻ' }}</span>
        </div>
        <div class="right-info-row">
          <span class="right-info-lbl">Số điện thoại:</span>
          <span class="right-info-val">{{ customerPhone || 'Không có' }}</span>
        </div>
      </div>

      <div class="right-products-block">
        <p class="right-products-title">Sản Phẩm Mua</p>
        <p v-if="!orderedItems.length" style="font-size:12px;color:#aaa;text-align:center;padding:20px 0">
          Chưa có sản phẩm
        </p>
        <div v-for="(item, index) in orderedItems" :key="index" class="right-product-card">
          <button class="right-pc-remove" @click="removeItem(index)">✕</button>
          <div class="right-pc-header">
            <span class="right-pc-name">{{ item.name }} x{{ item.qty }}</span>
            <span class="right-pc-price">{{ (item.price * item.qty).toLocaleString() }}đ</span>
          </div>
        </div>
      </div>

      <!-- Footer y hệt CounterOrder -->
      <div class="order-footer-block">
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
            :class="{ success: discountPercent > 0, error: discountPercent === 0 && discountMessage }">
            {{ discountMessage }}
          </p>
        </div>
        <p v-if="discountPercent > 0" class="original-price-row">Giá gốc: {{ totalPrice.toLocaleString() }}đ</p>
        <div class="total-row">
          <span class="total-label">Thành tiền:</span>
          <span class="total-amount">
            {{ finalPrice.toLocaleString() }}đ
            <span v-if="discountPercent > 0" class="discount-badge">-{{ discountPercent }}%</span>
          </span>
        </div>
        <!-- ✅ 2 nút giống CounterOrder -->
        <div class="right-action-btns right-action-btns--footer">
          <button class="right-mode-btn right-mode-btn--disabled" disabled>Hình thức</button>
          <button v-if="orderedItems.length > 0" class="right-pay-btn" @click="checkout">Thanh toán</button>
          <button v-else class="right-pay-btn right-pay-btn--disabled" disabled>Thanh toán</button>
        </div>
      </div>
    </div>

    <!-- ========== POPUP: Bean ========== -->
    <Teleport to="body">
      <div v-if="showBeanPopup" class="popup-overlay" @click.self="showBeanPopup = false">
        <div class="popup-box">
          <div class="popup-header-bar">
            <span class="popup-icon">🫘</span>
            <h3>Chọn hạt cà phê</h3>
            <button class="popup-close-x" @click="showBeanPopup = false">✕</button>
          </div>
          <img src="../IMG/Bean.jpg" class="popup-img" />
          <div class="popup-options">
            <button v-for="b in beans" :key="b.name" class="popup-option-btn" @click="selectBean(b)">
              <span class="option-name">{{ b.name }}</span>
              <span class="option-price">{{ b.price.toLocaleString() }}đ</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="showBasePopup" class="popup-overlay" @click.self="showBasePopup = false">
        <div class="popup-box">
          <div class="popup-header-bar">
            <span class="popup-icon">☕</span>
            <h3>Chọn phương pháp pha</h3>
            <button class="popup-close-x" @click="showBasePopup = false">✕</button>
          </div>
          <img src="../IMG/base.png" class="popup-img" />
          <div class="popup-options">
            <button v-for="b in bases" :key="b.name" class="popup-option-btn" @click="selectBase(b)">
              <span class="option-name">{{ b.name }}</span>
              <span class="option-price">{{ b.price.toLocaleString() }}đ</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="showMilkPopup" class="popup-overlay" @click.self="showMilkPopup = false">
        <div class="popup-box">
          <div class="popup-header-bar">
            <span class="popup-icon">🥛</span>
            <h3>Chọn sữa</h3>
            <button class="popup-close-x" @click="showMilkPopup = false">✕</button>
          </div>
          <img src="../IMG/milk.jpg" class="popup-img" />
          <div class="popup-options">
            <button v-for="m in milks" :key="m.name" class="popup-option-btn" @click="selectMilk(m)">
              <span class="option-name">{{ m.name }}</span>
              <span class="option-price">{{ m.price.toLocaleString() }}đ</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="showToppingPopup" class="popup-overlay" @click.self="showToppingPopup = false">
        <div class="popup-box">
          <div class="popup-header-bar">
            <span class="popup-icon">🧋</span>
            <h3>Chọn topping <span class="topping-count-badge">{{ selected.toppings.length }}/3</span></h3>
            <button class="popup-close-x" @click="showToppingPopup = false">✕</button>
          </div>
          <img src="../IMG/topping.jpg" class="popup-img" />
          <div v-if="selected.toppings.length" class="selected-toppings">
            <div v-for="(t, i) in selected.toppings" :key="i" class="selected-topping-tag">
              {{ t.name }} <span @click="removeTopping(i)">✕</span>
            </div>
          </div>
          <div class="popup-options">
            <button v-for="t in toppings" :key="t.name"
              :class="['popup-option-btn', { 'option-selected': selected.toppings.some(s => s.name === t.name) }]"
              :disabled="selected.toppings.length >= 3 && !selected.toppings.some(s => s.name === t.name)"
              @click="selectTopping(t)">
              <span class="option-name">{{ t.name }}</span>
              <span class="option-price">+{{ t.price.toLocaleString() }}đ</span>
            </button>
          </div>
          <button class="confirm-topping-btn" @click="confirmTopping">
            ✓ Xác nhận {{ selected.toppings.length }} topping
          </button>
        </div>
      </div>

      <!-- ========== POPUP THANH TOÁN (y hệt CounterOrder) ========== -->
      <div v-if="showPaymentPopup" class="popup-overlay">
        <div class="payment-popup">
          <div class="payment-title-row">
            <h2 class="payment-title">Thanh toán</h2>
          </div>

          <div class="pay-customer-section">
            <p class="pay-customer-title">Thông tin khách hàng <span class="pay-optional">(tuỳ chọn)</span></p>
            <div class="pay-customer-row">
              <div class="pay-field">
                <label>Họ và tên</label>
                <input :value="payNameInput" @input="onPayNameInput" type="text"
                  placeholder="Nhập tên khách..." class="pay-input" />
              </div>
              <div class="pay-field">
                <label>Số điện thoại</label>
                <input :value="payPhoneInput" @input="onPayPhoneInput" type="text"
                  inputmode="numeric" placeholder="Nhập số điện thoại..." maxlength="10"
                  class="pay-input" :class="{ error: payPhoneError }" />
                <span v-if="payPhoneError" class="pay-field-err">{{ payPhoneError }}</span>
              </div>
            </div>
            <p class="pay-hint">Nếu bỏ trống tên, đơn sẽ hiển thị mã khách ẩn danh</p>
          </div>

          <!-- Ghi chú -->
          <div class="note-section">
            <p class="note-label">Ghi chú</p>
            <textarea class="note-textarea" :value="posOrderNote" @input="e => posOrderNote = e.target.value"
              placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)..."></textarea>
          </div>

          <div class="payment-methods">
            <div class="payment-method-item" :class="{ active: paymentMethod === 'cash' }"
              @click="paymentMethod = 'cash'">💵 Tiền mặt</div>
            <div class="payment-method-item momo-tab" :class="{ active: paymentMethod === 'momo' }"
              @click="paymentMethod = 'momo'">
              <img :src="logoMomo" class="momo-tab-logo" alt="MoMo" /> MoMo
            </div>
          </div>

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
                    @keypress="(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault() }" />
                  <span class="inline-input-suffix">VND</span>
                </div>
              </div>
              <div class="summary-row highlight">
                <span>Tiền thừa</span>
                <strong>{{ changeAmount.toLocaleString() }} VND</strong>
              </div>
            </div>
            <p v-if="customerMoney && (parseInt(customerMoney)||0) < finalPrice" class="cash-insufficient">
              ⚠ Còn thiếu {{ (finalPrice - (parseInt(customerMoney)||0)).toLocaleString() }} VND
            </p>
            <div class="payment-footer">
              <button class="btn-cancel" @click="closePaymentPopup">Hủy</button>
              <button class="btn-confirm"
                :class="{ disabled: !customerMoney || (parseInt(customerMoney)||0) < finalPrice }"
                :disabled="!customerMoney || (parseInt(customerMoney)||0) < finalPrice"
                @click="goToReview">Kiểm tra</button>
            </div>
          </template>

          <template v-else>
            <div class="momo-header">
              <img :src="logoMomo" class="momo-logo" alt="MoMo" />
              <div>
                <p class="momo-brand">Ví MoMo</p>
                <p class="momo-amount">{{ finalPrice.toLocaleString() }} VND</p>
              </div>
            </div>
            <p style="font-size:13px;color:#666;text-align:center;margin-bottom:12px">
              Nhấn bên dưới để mở cổng thanh toán QR MoMo
            </p>
            <div class="payment-footer">
              <button class="btn-cancel" @click="closePaymentPopup">Hủy</button>
              <button class="btn-confirm momo-btn" @click="openMomoPayment">💳 Thanh toán thẻ ATM</button>
            </div>
          </template>
        </div>
      </div>

      <!-- ========== POPUP REVIEW (y hệt CounterOrder) ========== -->
      <div v-if="showReviewPopup" class="popup-overlay">
        <div class="review-popup">
          <p class="review-title">Kiểm Tra Đơn Hàng</p>

          <p class="review-section-title">Thông Tin Khách Hàng</p>
          <div class="review-row">
            <span class="review-lbl">Họ và tên</span>
            <span class="review-val">{{ receiptData.customerName || receiptData.anonCode || 'Chưa Điền Thông Tin' }}</span>
          </div>
          <div class="review-row">
            <span class="review-lbl">Số điện thoại</span>
            <span class="review-val">{{ receiptData.customerPhone || 'Không Có Thông Tin' }}</span>
          </div>
          <div class="review-row">
            <span class="review-lbl">Thanh toán</span>
            <span class="review-val">{{ paymentMethod === 'cash' ? '💵 Tiền mặt' : '🟣 Ví MoMo' }}</span>
          </div>
          <div class="review-row">
            <span class="review-lbl">Ghi chú</span>
            <span class="review-val review-note-val">{{ posOrderNote || 'Không có ghi chú' }}</span>
          </div>

          <div class="review-divider"></div>

          <p class="review-section-title">Sản Phẩm Đặt</p>
          <div v-for="(item, i) in orderedItems" :key="i" class="review-item">
            <div class="review-item-name">{{ item.name }} × {{ item.qty }}</div>
            <div class="review-item-price">{{ (item.price * item.qty).toLocaleString() }}đ</div>
          </div>

          <div class="review-divider"></div>

          <div v-if="discountPercent > 0" class="review-row">
            <span class="review-lbl">Giá gốc</span>
            <span class="review-val">{{ totalPrice.toLocaleString() }}đ</span>
          </div>
          <div v-if="discountPercent > 0" class="review-row">
            <span class="review-lbl">Giảm giá</span>
            <span class="review-val" style="color:#c0392b">-{{ discountPercent }}%</span>
          </div>
          <div v-if="paymentMethod === 'cash'" class="review-row">
            <span class="review-lbl">Khách đưa</span>
            <span class="review-val">{{ (parseInt(customerMoney)||0).toLocaleString() }} VND</span>
          </div>
          <div v-if="paymentMethod === 'cash'" class="review-row">
            <span class="review-lbl">Tiền thừa</span>
            <span class="review-val" style="color:#4a7c59;font-weight:900">{{ changeAmount.toLocaleString() }} VND</span>
          </div>

          <div class="review-total-row">
            <span class="review-total-lbl">Tổng thanh toán</span>
            <span class="review-total-val">{{ finalPrice.toLocaleString() }}đ</span>
          </div>

          <div class="payment-footer">
            <button class="btn-cancel" @click="backFromReview">Quay lại</button>
            <button class="btn-confirm" :class="{ 'momo-btn': paymentMethod === 'momo' }" @click="confirmPayment">
              ✓ Xác nhận thanh toán
            </button>
          </div>
        </div>
      </div>

      <!-- ========== POPUP THÀNH CÔNG (y hệt CounterOrder) ========== -->
      <div v-if="showSuccessPopup" class="popup-overlay">
        <div class="success-popup">
          <div class="success-header" :class="{ 'success-header--cash': paymentMethod === 'cash' }">
            <img :src="logoDrip" alt="DripLab" class="success-header-logo" />
            <p class="success-header-title">Kết Quả Giao Dịch</p>
          </div>

          <div class="success-fixed-top">
            <h2 class="success-title">Giao dịch thành công</h2>
            <p class="success-amount">{{ finalPrice.toLocaleString() }}đ</p>
          </div>

          <div class="success-scroll-body">
            <div class="success-receipt">
              <div class="success-receipt-header" :class="{ 'success-receipt-header--cash': paymentMethod === 'cash' }">
                <img v-if="paymentMethod === 'momo'" :src="logoMomo" class="receipt-logo" alt="MoMo" />
                <span class="receipt-label">Biên lai {{ paymentMethod === 'cash' ? 'thanh toán' : 'chuyển tiền' }}</span>
              </div>
              <div class="success-row b"><span>Họ và tên</span><span>{{ receiptData.customerName || receiptData.anonCode || 'Không Có Thông Tin' }}</span></div>
              <div class="success-row b"><span>Số điện thoại</span><span>{{ receiptData.customerPhone || 'Không Có Thông Tin' }}</span></div>
              <div class="success-row b"><span>Ghi chú</span><span class="receipt-note-val">{{ posOrderNote || 'Không có' }}</span></div>
              <div class="receipt-divider"></div>
              <div class="success-row b"><span>Thanh toán</span><span>{{ paymentMethod === 'cash' ? 'Tiền mặt' : 'Ví MoMo' }}</span></div>
              <div class="success-row b"><span>Mã giao dịch</span><span class="tx-id" :class="{ pink: paymentMethod === 'momo' }">{{ txId }}</span></div>
              <div class="success-row b"><span>Thời gian</span><span>{{ txTime }}</span></div>
              <div class="receipt-divider"></div>
              <div class="receipt-items-section">
                <p class="receipt-items-title">Sản phẩm đã mua</p>
                <div v-for="(item, i) in orderedItems" :key="i" class="receipt-item">
                  <div class="receipt-item-name">{{ item.name }} × {{ item.qty }}</div>
                  <div class="receipt-item-price">{{ (item.price * item.qty).toLocaleString() }}đ</div>
                </div>
              </div>
              <div class="receipt-divider"></div>
              <div v-if="discountPercent > 0" class="success-row b"><span>Giá gốc</span><span>{{ totalPrice.toLocaleString() }} VNĐ</span></div>
              <div v-if="discountPercent > 0" class="success-row b"><span>Giảm giá</span><span>-{{ discountPercent }}%</span></div>
              <div class="success-row b"><span>Số tiền thanh toán</span><span class="cash-need">{{ finalPrice.toLocaleString() }} VNĐ</span></div>
              <template v-if="paymentMethod === 'cash'">
                <div class="success-row b"><span>Khách đưa</span><span>{{ (parseInt(customerMoney)||0).toLocaleString() }} VNĐ</span></div>
                <div class="success-row b"><span>Tiền thừa trả khách</span><span class="cash-change">{{ changeAmount.toLocaleString() }} VNĐ</span></div>
              </template>
            </div>
          </div>

          <div class="success-fixed-bottom">
            <button class="success-close-btn" :class="{ 'success-close-btn--cash': paymentMethod === 'cash' }"
              @click="closeSuccessPopup">Hoàn thành</button>
          </div>
        </div>
      </div>

    </Teleport>

    <!-- MoMo QR -->
    <MomoPopup
      :visible="showMomoQR"
      :amount="finalPrice"
      :orderInfo="`Thanh toan DripLab Custom - ${payNameInput || 'Khach le'}`"
      @close="closeMomoQR"
      @paid="onMomoPaid"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePOS } from '../JS/AdminPOS.JS'
import MomoPopup from '../QRMoMo/Momo.Vue'

const logoMomo = new URL('../IMG/logoMOMO.png', import.meta.url).href
const logoDrip = new URL('../IMG/DripLab_Logo.png', import.meta.url).href

// Lấy thông tin khách từ CounterOrder
const customerName  = ref(sessionStorage.getItem('co_customerName')  || '')
const customerPhone = ref(sessionStorage.getItem('co_customerPhone') || '')

const posOrderNote = ref('')

const {
  search, step, selected, stepLabels,
  beans, bases, milks, toppings, loadProducts,
  orderedItems,
  showBeanPopup, showBasePopup, showMilkPopup, showToppingPopup,
  openBean, openBase, openMilk, openTopping,
  selectBean, selectBase, selectMilk, selectTopping,
  removeTopping, confirmTopping, removeItem,
  discountInput, discountCodeList, discountPercent, discountMessage,
  totalPrice, finalPrice, applyDiscount,
  payNameInput, payPhoneInput, payPhoneError,
  onPayNameInput, onPayPhoneInput,
  checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount,
  closePaymentPopup,
  showReviewPopup, goToReview, backFromReview,
  receiptData, confirmPayment,
  showSuccessPopup, closeSuccessPopup, txId, txTime,
  showMomoQR, openMomoPayment, closeMomoQR, onMomoPaid,
  searchProduct,
} = usePOS()

onMounted(() => loadProducts())
</script>