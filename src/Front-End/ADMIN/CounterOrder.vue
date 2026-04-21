<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCounterOrder } from '../JS/CounterOrder.JS'
import MomoPopup from '../QRMoMo/Momo.Vue'

const router = useRouter()
const logoMomo = new URL('../IMG/logoMOMO.png', import.meta.url).href
const logoDrip = new URL('../IMG/DripLab_Logo.png', import.meta.url).href

const {
  appStep, orderMode,
  goToChoice, chooseTakeaway, chooseDine,

  customerName, customerPhone,
  customerNameInput, customerPhoneInput,
  nameError, phoneError,
  customerSaved, isEditingInfo,
  onNameInput, onPhoneInput, saveCustomerInfo, editCustomerInfo,

  TOTAL_TABLES, selectedTable, occupiedTables,
  availableTables, tablesFull, selectTable,

  showConfirmInfo, confirmWarning, confirmWarningTable,
  goToConfirm, backToInfo, proceedToOrder, backFromConfirmToInfo,

  searchText, products, searchProducts,

  orderList, currentOrder, createNewOrder, selectOrder, MAX_ORDERS,

  orderedItems, totalPrice, removeItem,

  discountInput, discountCodeList, appliedCode, discountPercent, discountMessage, applyDiscount, finalPrice,

  checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount,
  cashMaxWarning, onCashInput,
  goToReview, backFromReview,
  showReviewPopup,
  confirmPayment, closePaymentPopup,
  showSuccessPopup, closeSuccessPopup, txId, txTime, receiptData,

  showPopup, selectedProduct, toppingList, selectedToppings, selectedSize, selectedQty,
  selectedIce, selectedSugar, iceOptions, sugarOptions, SIZE_PRICES,
  openPopup, closePopup, toggleTopping, isToppingSelected, incQty, decQty, confirmOrder,

  displayCustomerName, displayCustomerPhone, displayTableNum,

  MAX_CASH,
} = useCounterOrder()

// ── Trạng thái popup MoMo QR ──────────────────────────────────────
const showMomoQR = ref(false)

/** Gọi khi user chọn phương thức MoMo rồi bấm "Kiểm tra" */
function openMomoPayment() {
  // Đóng popup thanh toán thường, mở QR MoMo
  showPaymentPopup.value = false
  showMomoQR.value = true
}

function closeMomoQR() {
  showMomoQR.value = false
  showPaymentPopup.value = true
}

// Khach quet QR MoMo xong, nhan vien bam "Da thanh toan"
// -> Tao receiptData roi confirmPayment luon (khong hien review popup)
function onMomoPaid() {
  showMomoQR.value = false
  paymentMethod.value = 'momo'
  // Build receipt data
  const order = currentOrder.value
  receiptData.value = {
    finalPrice: finalPrice.value,
    change: 0,
    items: JSON.parse(JSON.stringify(orderedItems.value)),
    customerName:  order?.customerName  || customerName.value  || '',
    customerPhone: order?.customerPhone || customerPhone.value || '',
    tableNum:      order?.tableNum      || selectedTable.value || null,
    anonCode:      order?.anonCode      || '',
    discountPercent: discountPercent.value,
    originalPrice:   totalPrice.value,
  }
  // Hien popup thanh cong luon
  confirmPayment()
}

function goAdmin() {
  router.push('/AdminPOS')
}

function getTableLabel(num) {
  return occupiedTables.value.includes(num) ? 'Hết bàn' : `Bàn ${String(num).padStart(2, '0')}`
}

function availableTableCount() {
  return TOTAL_TABLES - occupiedTables.value.length
}
</script>

<style src="../CSS/CounterOrder.CSS"></style>

<template>
  <div class="counter-root">

    <!-- ==================== MÀN HÌNH CHÀO ==================== -->
    <div v-if="appStep === 'welcome'" class="welcome-screen">
      <div class="welcome-card">
        <img :src="logoDrip" alt="DripLab" class="welcome-logo" />
        <p class="welcome-tagline">"Khám phá menu và tạo hóa đơn ngay thôi nào!"</p>
        <button class="welcome-btn" @click="goToChoice">Tạo hóa đơn</button>
      </div>
    </div>

    <!-- ==================== CHỌN HÌNH THỨC ==================== -->
    <div v-else-if="appStep === 'choice'" class="welcome-screen">
      <div class="welcome-card">
        <img :src="logoDrip" alt="DripLab" class="welcome-logo" />
        <p class="welcome-tagline">"Bạn muốn chill tại quán hay mang hương vị đi cùng?"</p>
        <div class="choice-btns">
          <button class="welcome-btn" @click="chooseTakeaway">Mang đi tiện lợi</button>
          <button class="welcome-btn" @click="chooseDine">Thưởng thức tại quán</button>
        </div>
      </div>
    </div>

    <!-- ==================== THÔNG TIN + ĐẶT BÀN ==================== -->
    <div v-else-if="appStep === 'info'" class="info-page">
      <!-- Cột trái -->
      <div class="info-left">
        <div class="info-header">ĐƠN TẠI QUẦY</div>

        <div class="order-tabs-bar">
          <button class="add-order-tab" @click="createNewOrder" :disabled="orderList.length >= MAX_ORDERS">+ Thêm hóa đơn</button>
          <button v-for="(order, idx) in orderList" :key="order.id" class="order-tab"
            :class="{ active: currentOrder && currentOrder.id === order.id }" @click="selectOrder(order)">
            Hóa đơn {{ idx + 1 }}
          </button>
        </div>

        <div class="info-body">
          <!-- Thông tin khách -->
          <div class="customer-section">
            <p class="section-title">Thông Tin Khách Hàng</p>
            <div class="info-row">
              <span class="info-label">Họ và tên:</span>
              <div class="info-input-wrap" v-if="isEditingInfo">
                <input class="info-input" :class="{ error: nameError }" :value="customerNameInput" @input="onNameInput"
                  placeholder="Nhập họ và tên..." type="text" />
                <p v-if="nameError" class="input-error-msg">{{ nameError }}</p>
              </div>
              <span v-else class="info-value-display">{{ customerName || 'Chưa có' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Số điện thoại:</span>
              <div class="info-input-wrap" v-if="isEditingInfo">
                <input class="info-input" :class="{ error: phoneError }" :value="customerPhoneInput"
                  @input="onPhoneInput" placeholder="Nhập số điện thoại..." type="tel" inputmode="numeric" maxlength="10" />
                <p v-if="phoneError" class="input-error-msg">{{ phoneError }}</p>
              </div>
              <span v-else class="info-value-display">{{ customerPhone || 'Chưa có' }}</span>
            </div>
            <div class="info-actions">
              <button v-if="isEditingInfo" class="btn-save" @click="saveCustomerInfo">Lưu</button>
              <button v-else class="btn-edit" @click="editCustomerInfo">Sửa</button>
            </div>
          </div>

          <!-- Đặt bàn -->
          <div class="table-section">
            <p class="section-title">Đặt bàn tại quầy</p>
            <div class="table-count-row">
              <template v-if="tablesFull">
                <span class="table-count-full">⚠ FULL BÀN — Không còn bàn trống!</span>
              </template>
              <template v-else>
                Số lượng bàn còn trống: <strong>{{ String(availableTableCount()).padStart(2, '0') }}</strong>
              </template>
            </div>
            <div class="table-grid">
              <button v-for="num in availableTables" :key="num" class="table-btn" :class="{
                selected: selectedTable === num,
                occupied: occupiedTables.includes(num)
              }" @click="selectTable(num)" :disabled="occupiedTables.includes(num)">
                {{ getTableLabel(num) }}
              </button>
            </div>
          </div>
        </div>

        <div class="info-footer-btns">
          <button class="btn-back" @click="appStep = 'choice'">Quay lại</button>
          <button class="btn-next" @click="goToConfirm">Tiếp tục</button>
        </div>
      </div>

      <!-- Cột phải -->
      <div class="order-section">
        <div class="order-section-title">CHI TIẾT KHÁCH HÀNG</div>
        <div class="right-customer-block">
          <p class="right-sub-title">Khách Hàng</p>
          <div class="right-info-row">
            <span class="right-info-lbl">Họ và tên:</span>
            <span class="right-info-val">{{ customerName || 'Chưa có' }}</span>
          </div>
          <div class="right-info-row">
            <span class="right-info-lbl">Số điện thoại:</span>
            <span class="right-info-val">{{ customerPhone || 'Chưa có' }}</span>
          </div>
          <div class="right-table-row" style="margin-top:8px">
            <span class="right-info-lbl">Đặt bàn:</span>
            <span class="right-table-val">{{ selectedTable ? String(selectedTable).padStart(2, '0') : 'Chưa chọn' }}</span>
          </div>
        </div>
        <div class="right-products-block">
          <p class="right-products-title">Sản Phẩm Mua</p>
          <p style="font-size:12px;color:#aaa;text-align:center;padding:20px 0">Chưa có sản phẩm</p>
        </div>
        <div class="order-footer-block">
          <div class="discount-section">
            <p class="discount-label">Mã khuyến mãi</p>
            <div class="discount-bar">
              <select class="discount-select" disabled><option value="">-- Chọn mã --</option></select>
              <button class="discount-btn" disabled>Áp dụng</button>
            </div>
          </div>
          <div class="total-row">
            <span class="total-label">Thành tiền:</span>
            <span class="total-amount">0đ</span>
          </div>
          <button class="checkout-btn" disabled>Thanh toán</button>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP XÁC NHẬN THÔNG TIN ==================== -->
    <div v-if="showConfirmInfo" class="confirm-overlay">
      <div class="confirm-popup">
        <div class="confirm-logo">
          <img :src="logoDrip" alt="DripLab" style="height:60px;object-fit:contain" />
        </div>
        <p class="confirm-title">Thông Tin Quý Khách!</p>
        <div class="confirm-divider"></div>
        <div class="confirm-row">
          <span class="confirm-lbl">Họ và tên:</span>
          <span class="confirm-val">{{ customerName || 'Chưa có' }}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-lbl">Số điện thoại:</span>
          <span class="confirm-val">{{ customerPhone || 'Chưa có' }}</span>
        </div>
        <div v-if="confirmWarning" class="confirm-warning">{{ confirmWarning }}</div>
        <div class="confirm-divider"></div>
        <p class="confirm-table">Đặt bàn: {{ selectedTable ? String(selectedTable).padStart(2, '0') : 'Chưa có' }}</p>
        <div v-if="confirmWarningTable" class="confirm-warning-table">{{ confirmWarningTable }}</div>
        <div class="confirm-btns">
          <button class="btn-back" @click="backFromConfirmToInfo">Quay Lại</button>
          <button class="btn-next" @click="proceedToOrder">Tiếp tục</button>
        </div>
      </div>
    </div>

    <!-- ==================== MÀN HÌNH ĐẶT MÓN ==================== -->
    <div v-if="appStep === 'order'" class="counter-order">

      <!-- Cột trái -->
      <div class="product-section">
        <div class="top-bar">ĐƠN TẠI QUẦY</div>
        <div class="tabs-bar">
          <button class="add-order-tab" @click="createNewOrder" :disabled="orderList.length >= MAX_ORDERS">+ Thêm hóa đơn</button>
          <button v-for="(order, idx) in orderList" :key="order.id" class="order-tab"
            :class="{ active: currentOrder && currentOrder.id === order.id }" @click="selectOrder(order)">
            Hóa đơn {{ idx + 1 }}
          </button>
        </div>
        <div class="product-main">
          <div class="search-bar">
            <input v-model="searchText" type="text" placeholder="Tìm Sản Phẩm...." class="search-input" />
            <button class="search-btn" @click="searchProducts">Tìm kiếm</button>
          </div>
          <div class="product-grid">
            <div class="product-card logo-card" @click="goAdmin">
              <div class="logo-card-img-wrap">
                <img :src="logoDrip" alt="DripLab" class="logo-card-img" />
              </div>
              <p class="logo-card-label">COFFEE</p>
              <button class="detail-btn" style="width:80%;margin:0 auto 10px" @click.stop="goAdmin">Chi tiết</button>
            </div>
            <div v-for="product in products" :key="product.id" class="product-card" @click="openPopup(product)">
              <div class="product-img-wrap">
                <img :src="product.image" :alt="product.name" class="product-img" />
              </div>
              <div class="product-info-row">
                <p class="brand-label">DRIP LAB</p>
                <p class="product-name">{{ product.name }}</p>
              </div>
              <div class="product-buy-row">
                <span class="product-price">{{ product.price.toLocaleString() }}đ</span>
                <button class="buy-btn" @click.stop="openPopup(product)">Mua</button>
              </div>
            </div>
          </div>
        </div>
        <div class="order-footer-btns">
          <button class="btn-back" @click="appStep = orderMode === 'dine' ? 'info' : 'choice'">Quay lại</button>
        </div>
      </div>

      <!-- Cột phải -->
      <div class="order-section">
        <div class="order-section-title">CHI TIẾT KHÁCH HÀNG</div>
        <div class="right-customer-block">
          <p class="right-sub-title">Khách Hàng</p>
          <div class="right-info-row">
            <span class="right-info-lbl">Họ và tên:</span>
            <span class="right-info-val" :class="{ anon: currentOrder && currentOrder.anonCode && !currentOrder.customerName }">
              {{ displayCustomerName || 'Chưa có' }}
            </span>
          </div>
          <div class="right-info-row">
            <span class="right-info-lbl">Số điện thoại:</span>
            <span class="right-info-val">{{ displayCustomerPhone }}</span>
          </div>
          <div class="right-table-row" style="margin-top:6px">
            <span class="right-info-lbl">Đặt bàn:</span>
            <span class="right-table-val">{{ displayTableNum ? String(displayTableNum).padStart(2, '0') : 'Chưa có' }}</span>
          </div>
        </div>
        <div class="right-products-block">
          <p class="right-products-title">Sản Phẩm Mua</p>
          <p v-if="!orderedItems.length" style="font-size:12px;color:#aaa;text-align:center;padding:20px 0">Chưa có sản phẩm</p>
          <div v-for="(item, index) in orderedItems" :key="index" class="right-product-card">
            <button class="right-pc-remove" @click="removeItem(index)">✕</button>
            <div class="right-pc-header">
              <span class="right-pc-name">{{ item.name }} x{{ item.qty }}</span>
              <span class="right-pc-price">{{ (item.unitPrice * item.qty).toLocaleString() }}đ</span>
            </div>
            <div class="right-pc-tags">
              <span class="right-pc-tag size">Size: {{ item.size }}</span>
              <span class="right-pc-tag">Đá: {{ item.ice }}</span>
              <span class="right-pc-tag">Đường: {{ item.sugar }}</span>
            </div>
            <div v-if="item.toppingDetails && item.toppingDetails.length" class="right-pc-tags">
              <span v-for="t in item.toppingDetails" :key="t.name" class="right-pc-tag topping">{{ t.name }}</span>
            </div>
          </div>
        </div>
        <div class="order-footer-block">
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
          <button class="checkout-btn" @click="checkout">Thanh toán</button>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP TOPPING ==================== -->
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup">
        <div class="popup-header">
          <h2 class="popup-product-name">{{ selectedProduct.name }}</h2>
          <span class="popup-price-badge">Giá: {{ selectedProduct.price.toLocaleString() }}đ</span>
        </div>
        <p class="popup-label">Mức đá <span class="popup-limit">Tối đa 01</span></p>
        <div class="option-group">
          <button v-for="opt in iceOptions" :key="opt" class="option-btn" :class="{ selected: selectedIce === opt }"
            @click="selectedIce = opt">{{ opt }}</button>
        </div>
        <p class="popup-label">Mức đường <span class="popup-limit">Tối đa 01</span></p>
        <div class="option-group">
          <button v-for="opt in sugarOptions" :key="opt" class="option-btn" :class="{ selected: selectedSugar === opt }"
            @click="selectedSugar = opt">{{ opt }}</button>
        </div>
        <p class="popup-label">Topping <span class="popup-limit">Tối đa 03 loại</span></p>
        <div class="topping-grid">
          <div v-for="topping in toppingList" :key="topping.id" class="topping-card" :class="{
            selected: isToppingSelected(topping),
            disabled: selectedToppings.length >= 3 && !isToppingSelected(topping)
          }" @click="toggleTopping(topping)">
            <span class="topping-name">{{ topping.name }}</span>
            <span class="topping-price">+{{ topping.price.toLocaleString() }}đ</span>
          </div>
        </div>
        <div class="size-qty-row">
          <div class="size-col">
            <p class="popup-label">Size</p>
            <div class="size-group">
              <button v-for="s in ['S', 'M', 'L']" :key="s" class="size-btn" :class="{ selected: selectedSize === s }"
                @click="selectedSize = s">
                {{ s }}
                <span class="size-price-hint">{{ SIZE_PRICES[s] ? '+' + SIZE_PRICES[s].toLocaleString() + 'đ' : 'Gốc' }}</span>
              </button>
            </div>
          </div>
          <div class="qty-col">
            <p class="popup-label">Số lượng</p>
            <div class="qty-group">
              <button class="qty-btn qty-dec" @click="decQty">−</button>
              <span class="qty-value">{{ selectedQty }}</span>
              <button class="qty-btn qty-inc" @click="incQty">+</button>
            </div>
          </div>
        </div>
        <div class="popup-actions">
          <button class="cancel-btn" @click="closePopup">Quay Lại</button>
          <button class="confirm-btn" @click="confirmOrder">Xác Nhận</button>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP THANH TOÁN ==================== -->
    <div v-if="showPaymentPopup" class="popup-overlay">
      <div class="payment-popup">
        <h2 class="payment-title">Thanh toán</h2>
        <div class="payment-methods">
          <!-- Tiền mặt -->
          <div class="payment-method-item" :class="{ active: paymentMethod === 'cash' }"
            @click="paymentMethod = 'cash'">
            💵 Tiền mặt
          </div>
          <!-- MoMo — chỉ giữ icon, không có logic cũ -->
          <div class="payment-method-item momo-tab" :class="{ active: paymentMethod === 'momo' }"
            @click="paymentMethod = 'momo'">
            <img :src="logoMomo" class="momo-tab-logo" alt="MoMo" /> MoMo
          </div>
        </div>

        <!-- Tiền mặt -->
        <template v-if="paymentMethod === 'cash'">
          <div class="payment-summary">
            <div class="summary-row">
              <span>Tổng tiền</span>
              <strong>{{ finalPrice.toLocaleString() }} VND</strong>
            </div>
            <div class="summary-row">
              <span>Khách đưa</span>
              <div class="inline-input-wrap">
                <input :value="customerMoney" @input="onCashInput" type="text" inputmode="numeric"
                  placeholder="Nhập số tiền..." class="inline-input" />
                <span class="inline-input-suffix">VND</span>
              </div>
            </div>
            <div class="summary-row highlight">
              <span>Tiền thừa</span>
              <strong>{{ changeAmount.toLocaleString() }} VND</strong>
            </div>
          </div>
          <p v-if="cashMaxWarning" class="cash-maxed">{{ cashMaxWarning }}</p>
          <p v-if="customerMoney && (parseInt(customerMoney.replace(/\./g, '')) || 0) < finalPrice" class="cash-insufficient">
            ⚠ Số tiền khách đưa chưa đủ, còn thiếu
            {{ (finalPrice - (parseInt(customerMoney.replace(/\./g, '')) || 0)).toLocaleString() }} VND
          </p>
          <div class="payment-footer">
            <button class="btn-cancel" @click="closePaymentPopup">Hủy</button>
            <button class="btn-confirm"
              :class="{ disabled: !customerMoney || (parseInt(customerMoney.replace(/\./g, '')) || 0) < finalPrice }"
              :disabled="!customerMoney || (parseInt(customerMoney.replace(/\./g, '')) || 0) < finalPrice"
              @click="goToReview">Kiểm tra</button>
          </div>
        </template>

        <!-- MoMo — chỉ nút mở QR, KHÔNG có form nhập SĐT nữa -->
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
            <button class="btn-confirm momo-btn" @click="openMomoPayment">
              📱 Mở QR MoMo
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- ==================== POPUP KIỂM TRA THÔNG TIN ==================== -->
    <div v-if="showReviewPopup" class="popup-overlay">
      <div class="review-popup">
        <p class="review-title">Kiểm Tra Đơn Hàng</p>
        <p class="review-section-title">Thông Tin Khách Hàng</p>
        <div class="review-row">
          <span class="review-lbl">Họ và tên</span>
          <span class="review-val">{{ receiptData.customerName || receiptData.anonCode || 'Chưa có' }}</span>
        </div>
        <div class="review-row">
          <span class="review-lbl">Số điện thoại</span>
          <span class="review-val">{{ receiptData.customerPhone || 'Chưa có' }}</span>
        </div>
        <div class="review-row">
          <span class="review-lbl">Đặt bàn</span>
          <span class="review-val">{{ receiptData.tableNum ? String(receiptData.tableNum).padStart(2, '0') : 'Chưa có' }}</span>
        </div>
        <div class="review-row">
          <span class="review-lbl">Hình thức</span>
          <span class="review-val">{{ paymentMethod === 'cash' ? '💵 Tiền mặt' : '🟣 Ví MoMo' }}</span>
        </div>
        <div class="review-divider"></div>
        <p class="review-section-title">Sản Phẩm Đặt</p>
        <div v-for="(item, i) in receiptData.items" :key="i" class="review-item">
          <div class="review-item-name">{{ item.name }} ({{ item.size }}) × {{ item.qty }}</div>
          <div class="review-item-meta">
            Đá: {{ item.ice }} | Đường: {{ item.sugar }}
            <span v-if="item.toppingDetails && item.toppingDetails.length">
              | Topping: {{ item.toppingDetails.map(t => t.name).join(', ') }}
            </span>
          </div>
          <div class="review-item-price">{{ (item.unitPrice * item.qty).toLocaleString() }}đ</div>
        </div>
        <div class="review-divider"></div>
        <div v-if="receiptData.discountPercent > 0" class="review-row">
          <span class="review-lbl">Giá gốc</span>
          <span class="review-val">{{ receiptData.originalPrice.toLocaleString() }}đ</span>
        </div>
        <div v-if="receiptData.discountPercent > 0" class="review-row">
          <span class="review-lbl">Giảm giá</span>
          <span class="review-val" style="color:#c0392b">-{{ receiptData.discountPercent }}%</span>
        </div>
        <div v-if="paymentMethod === 'cash'" class="review-row">
          <span class="review-lbl">Khách đưa</span>
          <span class="review-val">{{ (parseInt((customerMoney || '').replace(/\./g, '')) || 0).toLocaleString() }} VND</span>
        </div>
        <div v-if="paymentMethod === 'cash'" class="review-row">
          <span class="review-lbl">Tiền thừa</span>
          <span class="review-val" style="color:#4a7c59;font-weight:900">{{ receiptData.change.toLocaleString() }} VND</span>
        </div>
        <div class="review-total-row">
          <span class="review-total-lbl">Tổng thanh toán</span>
          <span class="review-total-val">{{ receiptData.finalPrice.toLocaleString() }}đ</span>
        </div>
        <div class="payment-footer">
          <button class="btn-cancel" @click="backFromReview">Quay lại</button>
          <button class="btn-confirm" :class="{ 'momo-btn': paymentMethod === 'momo' }" @click="confirmPayment">
            ✓ Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP THÀNH CÔNG ==================== -->
    <div v-if="showSuccessPopup" class="popup-overlay">
      <div class="success-popup">
        <div class="success-header" :class="{ 'success-header--cash': paymentMethod === 'cash' }">
          <img :src="logoDrip" alt="DripLab" class="success-header-logo" />
          <p class="success-header-title">Kết Quả Giao Dịch</p>
        </div>
        <div class="success-body">
          <h2 class="success-title">Giao dịch thành công</h2>
          <p class="success-amount">{{ receiptData.finalPrice.toLocaleString() }}đ</p>
          <div class="success-receipt">
            <div class="success-receipt-header" :class="{ 'success-receipt-header--cash': paymentMethod === 'cash' }">
              <img v-if="paymentMethod === 'momo'" :src="logoMomo" class="receipt-logo" alt="MoMo" />
              <span class="receipt-label">Biên lai {{ paymentMethod === 'cash' ? 'thanh toán' : 'chuyển tiền' }}</span>
            </div>
            <div class="success-row b"><span>Họ và tên</span><span>{{ receiptData.customerName || receiptData.anonCode || 'Chưa có' }}</span></div>
            <div class="success-row b"><span>Số điện thoại</span><span>{{ receiptData.customerPhone || 'Chưa có' }}</span></div>
            <div class="success-row b"><span>Đặt bàn</span><span>{{ receiptData.tableNum ? String(receiptData.tableNum).padStart(2, '0') : 'Chưa có' }}</span></div>
            <div class="receipt-divider"></div>
            <div class="success-row b"><span>Hình thức</span><span>{{ paymentMethod === 'cash' ? 'Tiền mặt' : 'Ví MoMo' }}</span></div>
            <div class="success-row b"><span>Mã giao dịch</span><span class="tx-id" :class="{ pink: paymentMethod === 'momo' }">{{ txId }}</span></div>
            <div class="success-row b"><span>Thời gian thanh toán</span><span>{{ txTime }}</span></div>
            <div class="receipt-divider"></div>
            <div class="receipt-items-section">
              <p class="receipt-items-title">Sản phẩm đã mua</p>
              <div v-for="(item, i) in receiptData.items" :key="i" class="receipt-item">
                <div class="receipt-item-name">{{ item.name }} ({{ item.size }}) x{{ item.qty }}</div>
                <div class="receipt-item-meta">
                  Đá: {{ item.ice }} | Đường: {{ item.sugar }}
                  <span v-if="item.toppingDetails && item.toppingDetails.length">
                    | Topping: {{ item.toppingDetails.map(t => t.name).join(', ') }}
                  </span>
                </div>
                <div class="receipt-item-price">{{ (item.unitPrice * item.qty).toLocaleString() }}đ</div>
              </div>
            </div>
            <div class="receipt-divider"></div>
            <div v-if="receiptData.discountPercent > 0" class="success-row b"><span>Giá gốc</span><span>{{ receiptData.originalPrice.toLocaleString() }} VNĐ</span></div>
            <div v-if="receiptData.discountPercent > 0" class="success-row b"><span>Giảm giá</span><span>-{{ receiptData.discountPercent }}%</span></div>
            <div class="success-row b"><span>Số tiền thanh toán</span><span class="cash-need">{{ receiptData.finalPrice.toLocaleString() }} VNĐ</span></div>
            <template v-if="paymentMethod === 'cash'">
              <div class="success-row b"><span>Khách đưa</span><span>{{ (parseInt((customerMoney || '').replace(/\./g, '')) || 0).toLocaleString() }} VNĐ</span></div>
              <div class="success-row b"><span>Tiền thừa trả khách</span><span class="cash-change">{{ receiptData.change.toLocaleString() }} VNĐ</span></div>
            </template>
          </div>
          <button class="success-close-btn" :class="{ 'success-close-btn--cash': paymentMethod === 'cash' }" @click="closeSuccessPopup">
            Hoàn thành
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP QR MOMO ==================== -->
    <!--
      Momo.Vue được dùng như một component độc lập.
      - :visible   → bật/tắt popup
      - :amount    → số tiền cần thanh toán
      - :orderInfo → mô tả đơn
      - @close     → đóng popup, quay lại chọn phương thức
    -->
    <MomoPopup
      :visible="showMomoQR"
      :amount="finalPrice"
      :orderInfo="`Thanh toan DripLab - ${displayCustomerName || 'Khach le'}`"
      @close="closeMomoQR"
      @paid="onMomoPaid"
    />

  </div><!-- end .counter-root -->
</template>