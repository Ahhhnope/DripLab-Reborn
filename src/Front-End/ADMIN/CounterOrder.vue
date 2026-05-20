<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
defineOptions({ name: 'CounterOrder' })
import { useCounterOrder } from '../JS/CounterOrder.JS'
import Momo from '../QRMoMo/Momo.vue'


const router = useRouter()
const logoMomo = new URL('../IMG/logoMOMO.png', import.meta.url).href
const logoDrip = new URL('../IMG/DripLab_Logo.png', import.meta.url).href

const {
  appStep, orderMode,
  goToChoice, chooseTakeaway, chooseDine,

  showCancelOrderPopup, cancelTargetOrder,
  requestCancelOrder, confirmCancelOrder, closeCancelOrderPopup,

  customerName, customerPhone,
  customerNameInput, customerPhoneInput,
  nameError, phoneError,
  customerSaved, isEditingInfo,
  onNameInput, onPhoneInput, saveCustomerInfo, editCustomerInfo,

  TOTAL_TABLES, selectedTable, selectedTables, occupiedTables,
  availableTables, tablesFull, selectTable, MAX_TABLES_PER_ORDER,
  otherOccupiedTables,

  showConfirmInfo, confirmWarning, confirmWarningTable,
  goToConfirm, proceedToOrder, backFromConfirmToInfo,

  searchText, products, searchProducts,

  orderList, currentOrder, createNewOrder, selectOrder, MAX_ORDERS,

  orderedItems, totalPrice, removeItem,

  discountInput, discountCodeList, appliedCode, discountPercent, discountMessage, applyDiscount, finalPrice,

  orderNote, onNoteInput,

  checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount,
  cashMaxWarning, onCashInput,
  payNameInput, payPhoneInput, payPhoneError,
  onPayNameInput, onPayPhoneInput,
  goToReview, backFromReview,
  showReviewPopup,
  confirmPayment, closePaymentPopup,
  showSuccessPopup, closeSuccessPopup, txId, txTime, receiptData,

  showPopup, selectedProduct, toppingList, selectedToppings, selectedSize, selectedQty,
  selectedIce, selectedSugar, iceOptions, sugarOptions, SIZE_PRICES,
  openPopup, closePopup, toggleTopping, isToppingSelected, incQty, decQty, confirmOrder,

  displayCustomerName, displayCustomerPhone, displayTableNum, displayTableNums,
  displayDineMode,

  MAX_CASH,

  showTablePopup, openTablePopup, closeTablePopup,
  dineMode,
} = useCounterOrder()

// ── MoMo QR ──────────────────────────────────────
const showMomoQR = ref(false)

function openMomoPayment() {
  showPaymentPopup.value = false
  showMomoQR.value = true
}

function closeMomoQR() {
  showMomoQR.value = false
  showPaymentPopup.value = true
}

function onMomoPaid() {
  showMomoQR.value = false
  paymentMethod.value = 'momo'
  const order = currentOrder.value
  receiptData.value = {
    finalPrice: finalPrice.value,
    change: 0,
    items: JSON.parse(JSON.stringify(orderedItems.value)),
    customerName: payNameInput.value.trim() || order?.customerName || customerName.value || '',
    customerPhone: payPhoneInput.value.trim() || order?.customerPhone || customerPhone.value || '',
    tableNums: order?.selectedTables || selectedTables.value || [],
    anonCode: order?.anonCode || '',
    discountPercent: discountPercent.value,
    originalPrice: totalPrice.value,
    note: orderNote.value || order?.note || '',
    dineMode: dineMode.value,
  }
  confirmPayment()
}

function goAdmin() {
  router.push('/AdminPOS')
}

function availableTableCount() {
  return TOTAL_TABLES - occupiedTables.value.length
}


function isTableSelected(num) {
  return selectedTables.value.includes(num)
}

function isTableOccupiedByOther(num) {
  return otherOccupiedTables.value.includes(num)
}

function formatTableNums(nums) {
  if (!nums || !nums.length) return 'Chưa có'
  return nums.map(n => String(n).padStart(2, '0')).join(', ')
}

function getTableLabel(num) {
  if (isTableSelected(num)) return `Bàn ${String(num).padStart(2, '0')}`
  if (isTableOccupiedByOther(num)) return 'Hết bàn'
  return `Bàn ${String(num).padStart(2, '0')}`
}

function onOrderTabClick(order) {
  if (currentOrder.value && currentOrder.value.id === order.id) {
    requestCancelOrder(order)
  } else {
    selectOrder(order)
  }
}

function onDineModeChange(val) {
  dineMode.value = val
  if (currentOrder.value) {
    currentOrder.value.dineMode = val
  }
}

function getDineModeLabel(mode) {
  if (mode === null || mode === undefined) return 'Chưa chọn'
  if (mode === true) return 'Tại quán'
  return 'Mang đi'
}

function getDineModeClass(mode) {
  if (mode === null || mode === undefined) return 'mode-none'
  if (mode === true) return 'mode-dine'
  return 'mode-takeaway'
}

function getItemToppingDetails(item) {
  if (item.toppingDetails && item.toppingDetails.length) {
    return item.toppingDetails
  }
  if (item.toppings && item.toppings.length) {
    return item.toppings.map(t => ({
      id: t.topping?.id || t.id,
      name: t.topping?.name || t.name,
      price: t.topping?.price || t.price || 0
    }))
  }
  return []
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

    <!-- ==================== THÔNG TIN KHÁCH HÀNG ==================== -->
    <div v-else-if="appStep === 'info'" class="info-page">
      <!-- Cột trái -->
      <div class="info-left">
        <div class="info-header">ĐƠN TẠI QUẦY</div>

        <div class="order-tabs-bar">
          <button class="add-order-tab" @click="createNewOrder" :disabled="orderList.length >= MAX_ORDERS">+ Thêm hóa
            đơn</button>
          <button v-for="(order, idx) in orderList" :key="order.id" class="order-tab"
            :class="{ active: currentOrder && currentOrder.id === order.id }" @click="onOrderTabClick(order)">
            Hóa đơn {{ order.orderNumber }}
          </button>
        </div>

        <!-- Form thông tin khách giữa trang -->
        <div class="info-center-wrap">
          <div class="info-simple-card">
            <img :src="logoDrip" alt="DripLab" class="info-simple-logo" />
            <p class="info-simple-title">Thông Tin Khách Hàng</p>
            <p class="info-simple-sub">Nhập thông tin hoặc bỏ qua để tiếp tục</p>

            <div class="info-simple-fields">
              <div class="info-simple-field">
                <label>Họ và tên</label>
                <input class="info-simple-input" :class="{ error: nameError }" :value="customerNameInput"
                  @input="onNameInput" placeholder="Nhập họ và tên..." type="text" />
                <p v-if="nameError" class="input-error-msg">{{ nameError }}</p>
              </div>
              <div class="info-simple-field">
                <label>Số điện thoại</label>
                <input class="info-simple-input" :class="{ error: phoneError }" :value="customerPhoneInput"
                  @input="onPhoneInput" placeholder="Nhập số điện thoại..." type="tel" inputmode="numeric"
                  maxlength="10" />
                <p v-if="phoneError" class="input-error-msg">{{ phoneError }}</p>
              </div>
            </div>

            <div class="info-simple-actions">
              <button class="btn-back" @click="appStep = 'welcome'">Quay lại</button>
              <button class="btn-next" @click="goToConfirm">Tiếp tục</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột phải — INFO PAGE -->
      <div class="order-section">
        <div class="order-section-title">CHI TIẾT KHÁCH HÀNG</div>
        <div class="right-customer-block">
          <p class="right-sub-title">Khách Hàng</p>
          <div class="right-info-row">
            <span class="right-info-lbl">Họ và tên:</span>
            <span class="right-info-val">{{ customerNameInput || 'Chưa Có' }}</span>
          </div>
          <div class="right-info-row">
            <span class="right-info-lbl">Số điện thoại:</span>
            <span class="right-info-val">{{ customerPhoneInput || 'Chưa có' }}</span>
          </div>
          <div class="right-table-row" style="margin-top:8px">
            <span class="right-info-lbl">Đặt bàn:</span>
            <span class="right-table-val">Chưa chọn</span>
          </div>
          <div class="right-table-row" style="margin-top:6px">
            <span class="right-info-lbl">Hình thức:</span>
            <span class="right-table-val" :class="getDineModeClass(displayDineMode)">
              {{ getDineModeLabel(displayDineMode) }}
            </span>
          </div>
        </div>
        <div class="right-products-block">
          <p class="right-products-title">Sản Phẩm Mua</p>
          <p style="font-size:12px;color:#aaa;text-align:center;padding:20px 0">Chưa có sản phẩm</p>
        </div>
        <div class="order-footer-block">
          <div class="total-row">
            <span class="total-label">Thành tiền:</span>
            <span class="total-amount">0đ</span>
          </div>
          <div class="right-action-btns right-action-btns--footer">
            <button class="right-mode-btn right-mode-btn--disabled" disabled>Hình thức</button>
            <button class="right-pay-btn right-pay-btn--disabled" disabled>Thanh toán</button>
          </div>
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
          <span class="confirm-val">{{ customerName || 'Chưa Điền Thông Tin' }}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-lbl">Số điện thoại:</span>
          <span class="confirm-val">{{ customerPhone || 'Chưa Điền Thông Tin' }}</span>
        </div>
        <div v-if="confirmWarning" class="confirm-warning">{{ confirmWarning }}</div>
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
          <button class="add-order-tab" @click="createNewOrder" :disabled="orderList.length >= MAX_ORDERS">+ Thêm hóa
            đơn</button>
          <button v-for="(order, idx) in orderList" :key="order.id" class="order-tab"
            :class="{ active: currentOrder && currentOrder.id === order.id }" @click="onOrderTabClick(order)">
            Hóa đơn {{ order.orderNumber }}
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
              <p class="logo-card-label">COFFEE <br> Tự Pha Chế </p>
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
          <button class="btn-back" @click="appStep = 'info'">Quay lại</button>
        </div>
      </div>

      <!-- Cột phải — ORDER PAGE -->
      <div class="order-section">
        <div class="order-section-title">CHI TIẾT KHÁCH HÀNG</div>
        <div class="right-customer-block">
          <p class="right-sub-title">Khách Hàng</p>
          <div class="right-info-row">
            <span class="right-info-lbl">Họ và tên:</span>
            <span class="right-info-val"
              :class="{ anon: currentOrder && currentOrder.anonCode && !currentOrder.customerName }">
              {{ displayCustomerName || (currentOrder && currentOrder.anonCode ? currentOrder.anonCode : 'Chưa Điền Thông Tin') }}
            </span>
          </div>
          <div class="right-info-row">
            <span class="right-info-lbl">Số điện thoại:</span>
            <span class="right-info-val">{{ displayCustomerPhone }}</span>
          </div>
          <div class="right-table-row" style="margin-top:6px">
            <span class="right-info-lbl">Đặt bàn:</span>
            <span class="right-table-val">{{ displayTableNums.length ? formatTableNums(displayTableNums) : 'Chưa có'
            }}</span>
          </div>
          <div class="right-table-row" style="margin-top:6px">
            <span class="right-info-lbl">Hình thức:</span>
            <span class="right-table-val" :class="getDineModeClass(displayDineMode)">
              {{ getDineModeLabel(displayDineMode) }}
            </span>
          </div>
        </div>

        <!-- Danh sách sản phẩm sidebar - REDESIGNED -->
        <div class="right-products-block">
          <p class="right-products-title">Sản Phẩm Mua</p>
          <p v-if="!orderedItems.length" style="font-size:12px;color:#aaa;text-align:center;padding:20px 0">Chưa có sản
            phẩm</p>

          <div v-for="(item, index) in orderedItems" :key="index" class="rpc-card">
            <!-- Header: tên nổi bật + size + số lượng + nút xóa -->
            <div class="rpc-top">
              <span class="rpc-name">{{ item.name }}</span>
              <div class="rpc-meta-row">
                <span class="rpc-size-badge">Size: {{ item.sizeLabel }}</span>
                <span class="rpc-qty-badge">SL: {{ item.qty }}</span>
              </div>
              <button class="rpc-remove" @click="removeItem(index, item.cartItemId)" title="Xóa">✕</button>
            </div>

            <!-- Body: đá + đường + custom + topping -->
            <div class="rpc-body">
              <div class="rpc-specs">
                <span class="rpc-spec">Đá {{ item.ice }}</span>
                <span class="rpc-spec">Đường {{ item.sugar }}</span>
              </div>

              <div v-if="item.isCustom" class="rpc-custom-row">
                <span class="rpc-custom-tag">{{ item.beanName }}</span>
                <span class="rpc-custom-tag">{{ item.base }}</span>
                <span v-if="item.milkName" class="rpc-custom-tag">{{ item.milkName }}</span>
              </div>

              <div v-if="getItemToppingDetails(item).length" class="rpc-toppings">
                <span v-for="t in getItemToppingDetails(item)" :key="t.name || t.id" class="rpc-topping">
                  + {{ t.name }}<em v-if="t.price"> {{ t.price.toLocaleString() }}đ</em>
                </span>
              </div>
            </div>

            <!-- Footer: giá -->
            <div class="rpc-footer">
              <span class="rpc-unit-price">Tổng số tiền</span>
              <span class="rpc-total-price">{{ (item.unitPrice * item.qty).toLocaleString() }}đ</span>
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
          <div class="right-action-btns right-action-btns--footer">
            <button class="right-mode-btn" @click="openTablePopup">Hình thức</button>
            <button v-if="orderedItems.length > 0" class="right-pay-btn" @click="checkout">Thanh toán</button>
            <button v-else class="right-pay-btn right-pay-btn--disabled" disabled>Thanh toán</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCancelOrderPopup" class="confirm-overlay">
      <div class="confirm-popup cancel-order-popup">
        <div class="confirm-logo">
          <img :src="logoDrip" alt="DripLab" style="height:60px;object-fit:contain" />
        </div>
        <p class="confirm-title">Hủy hóa đơn</p>
        <p class="cancel-order-sub">Nếu hủy hóa đơn hãy chọn "Xác nhận"</p>
        <div class="confirm-btns">
          <button class="btn-back" @click="closeCancelOrderPopup">Quay Lại</button>
          <button class="btn-confirm-red" @click="confirmCancelOrder">Xác Nhận</button>
        </div>
      </div>
    </div>

    <div v-if="showTablePopup" class="confirm-overlay">
      <div class="table-mode-popup">
        <p class="table-mode-title">Chọn Hình Thức & Bàn</p>

        <div class="mode-choice-row">
          <button class="mode-choice-btn" :class="{ active: dineMode === false }" @click="onDineModeChange(false)">
            Mang đi
          </button>
          <button class="mode-choice-btn" :class="{ active: dineMode === true }" @click="onDineModeChange(true)">
            Tại quán
          </button>
        </div>

        <template v-if="dineMode === true">
          <div class="table-count-row" style="margin-top:14px">
            <template v-if="tablesFull">
              <span class="table-count-full">⚠ FULL BÀN — Không còn bàn trống!</span>
            </template>
            <template v-else>
              Bàn trống:
              <strong>{{ String(TOTAL_TABLES - otherOccupiedTables.length).padStart(2, '0') }}</strong>
              &nbsp;|&nbsp;
              <span class="table-selected-hint">
                Đã chọn: <strong>{{ selectedTables.length }}</strong>/{{ MAX_TABLES_PER_ORDER }}
              </span>
            </template>
          </div>
          <div v-if="selectedTables.length" class="selected-tables-row">
            <span v-for="t in selectedTables" :key="t" class="selected-table-badge">
              Bàn {{ String(t).padStart(2, '0') }}
              <button class="badge-remove" @click="selectTable(t)">✕</button>
            </span>
          </div>
          <div class="table-grid" style="margin-top:10px">
            <button
              v-for="num in availableTables"
              :key="num"
              class="table-btn"
              :class="{
                selected: isTableSelected(num),
                occupied: isTableOccupiedByOther(num) && !isTableSelected(num)
              }"
              @click="selectTable(num)"
              :disabled="isTableOccupiedByOther(num) && !isTableSelected(num)"
            >
              {{ getTableLabel(num) }}
            </button>
          </div>
        </template>

        <div class="confirm-btns" style="margin-top:16px">
          <button class="btn-back" @click="closeTablePopup">Đóng</button>
          <button class="btn-next" @click="closeTablePopup">Xác nhận</button>
        </div>
      </div>
    </div>

    
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
          <div v-for="topping in toppingList" :key="topping.id" class="topping-card"
            :class="{ selected: isToppingSelected(topping), disabled: selectedToppings.length >= 3 && !isToppingSelected(topping) }"
            @click="toggleTopping(topping)">
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
                <span class="size-price-hint">{{ SIZE_PRICES[s] ? '+' + SIZE_PRICES[s].toLocaleString() + 'đ' : 'Gốc'
                }}</span>
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
        <div class="payment-title-row">
          <h2 class="payment-title">Thanh toán</h2>
          <span class="payment-mode-badge" :class="dineMode === true ? 'badge--dine' : 'badge--takeaway'">
            {{ dineMode === true ? 'Tại quán' : 'Mang đi' }}
          </span>
        </div>

        <!-- Nhập tên & SĐT -->
        <div class="pay-customer-section">
          <p class="pay-customer-title">Thông tin khách hàng <span class="pay-optional">(tuỳ chọn)</span></p>
          <div class="pay-customer-row">
            <div class="pay-field">
              <label>Họ và tên</label>
              <input :value="payNameInput" @input="onPayNameInput" type="text"
                :placeholder="(currentOrder && currentOrder.anonCode && !currentOrder.customerName) ? currentOrder.anonCode : 'Nhập tên khách...'"
                class="pay-input" />
            </div>
            <div class="pay-field">
              <label>Số điện thoại</label>
              <input :value="payPhoneInput" @input="onPayPhoneInput" type="text" inputmode="numeric"
                placeholder="Nhập số điện thoại..." maxlength="10" class="pay-input"
                :class="{ error: payPhoneError }" />
              <span v-if="payPhoneError" class="pay-field-err">{{ payPhoneError }}</span>
            </div>
          </div>
          <p class="pay-hint">Nếu bỏ trống tên, đơn sẽ hiển thị mã khách ẩn danh</p>
        </div>

        <!-- Ghi chú -->
        <div class="note-section">
          <p class="note-label">Ghi chú</p>
          <textarea class="note-textarea" :value="orderNote" @input="onNoteInput"
            placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)..."></textarea>
        </div>

        <!-- Phương thức thanh toán -->
        <div class="payment-methods">
          <div class="payment-method-item" :class="{ active: paymentMethod === 'Tiền mặt' }"
            @click="paymentMethod = 'Tiền mặt'">
             Tiền mặt
          </div>
          <div class="payment-method-item momo-tab" :class="{ active: paymentMethod === 'momo' }"
            @click="paymentMethod = 'momo'">
            <img :src="logoMomo" class="momo-tab-logo" alt="MoMo" /> MoMo
          </div>
        </div>

        <!-- Tiền mặt -->
        <template v-if="paymentMethod === 'Tiền mặt'">
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
          <p v-if="customerMoney && (parseInt(customerMoney.replace(/\./g, '')) || 0) < finalPrice"
            class="cash-insufficient">
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

        <!-- MoMo -->
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

    <!-- ==================== POPUP KIỂM TRA THÔNG TIN ==================== -->
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
          <span class="review-lbl">Đặt bàn</span>
          <span class="review-val">{{ receiptData.tableNums && receiptData.tableNums.length ?
            formatTableNums(receiptData.tableNums) : 'Chưa có' }}</span>
        </div>
        <div class="review-row">
          <span class="review-lbl">Thanh Toán</span>
          <span class="review-val">{{ paymentMethod === 'Tiền mặt' ? ' Tiền mặt' : '🟣 Ví MoMo' }}</span>
        </div>
        <div class="review-row">
          <span class="review-lbl">Hình thức</span>
          <span class="review-val review-mode-badge" :class="receiptData.dineMode === true ? 'dine' : 'takeaway'">
            {{ receiptData.dineMode === true ? ' Tại quán' : 'Mang đi' }}
          </span>
        </div>
        <div class="review-row">
          <span class="review-lbl">Ghi chú</span>
          <span class="review-val review-note-val">{{ receiptData.note || 'Không có ghi chú' }}</span>
        </div>
        <div class="review-divider"></div>
        <p class="review-section-title">Sản Phẩm Đặt</p>
        <div v-for="(item, i) in receiptData.items" :key="i" class="review-item">
          <div class="review-item-header">
            <div class="review-item-name">{{ item.name }} ({{ item.size }}) × {{ item.qty }}</div>
            <div class="review-item-price">{{ (item.unitPrice * item.qty).toLocaleString() }}đ</div>
          </div>
          <div class="review-item-meta">
            Đá: {{ item.ice }} | Đường: {{ item.sugar }}
          </div>
          <div v-if="getItemToppingDetails(item).length" class="review-item-toppings">
            <span v-for="t in getItemToppingDetails(item)" :key="t.name" class="review-topping-tag">
              + {{ t.name }}<em v-if="t.price"> ({{ t.price.toLocaleString() }}đ)</em>
            </span>
          </div>
          <div v-if="item.isCustom" class="review-item-meta" style="margin-top:2px">
            <span v-if="item.beanName" class="rpc-custom-tag">☕ {{ item.beanName }}</span>
            <span v-if="item.baseName" class="rpc-custom-tag">⚗️ {{ item.baseName }}</span>
            <span v-if="item.milkName" class="rpc-custom-tag">🥛 {{ item.milkName }}</span>
          </div>
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
        <div v-if="paymentMethod === 'Tiền mặt'" class="review-row">
          <span class="review-lbl">Khách đưa</span>
          <span class="review-val">{{ (parseInt((customerMoney || '').replace(/\./g, '')) || 0).toLocaleString() }}
            VND</span>
        </div>
        <div v-if="paymentMethod === 'Tiền mặt'" class="review-row">
          <span class="review-lbl">Tiền thừa</span>
          <span class="review-val" style="color:#4a7c59;font-weight:900">{{ receiptData.change.toLocaleString() }}
            VND</span>
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

        <div class="success-header" :class="{ 'success-header--cash': paymentMethod === 'Tiền mặt' }">
          <img :src="logoDrip" alt="DripLab" class="success-header-logo" />
          <p class="success-header-title">Kết Quả Giao Dịch</p>
        </div>

        <div class="success-fixed-top">
          <h2 class="success-title">Giao dịch thành công</h2>
          <p class="success-amount">{{ receiptData.finalPrice.toLocaleString() }}đ</p>
        </div>

        <div class="success-scroll-body">
          <div class="success-receipt">
            <div class="success-receipt-header"
              :class="{ 'success-receipt-header--cash': paymentMethod === 'Tiền mặt' }">
              <img v-if="paymentMethod === 'momo'" :src="logoMomo" class="receipt-logo" alt="MoMo" />
              <span class="receipt-label">Biên lai {{ paymentMethod === 'Tiền mặt' ? 'thanh toán' : 'chuyển tiền'
                }}</span>
            </div>
            <div class="success-row b">
              <span>Họ và tên</span>
              <span>{{ receiptData.customerName || receiptData.anonCode || 'Không Có Thông Tin' }}</span>
            </div>
            <div class="success-row b">
              <span>Số điện thoại</span>
              <span>{{ receiptData.customerPhone || 'Không Có Thông Tin' }}</span>
            </div>
            <div class="success-row b">
              <span>Đặt bàn</span>
              <span>{{ receiptData.tableNums && receiptData.tableNums.length ? formatTableNums(receiptData.tableNums) :
                'Chưa có' }}</span>
            </div>
            <div class="success-row b">
              <span>Hình thức</span>
              <span>{{ receiptData.dineMode === true ? ' Tại quán' : ' Mang đi' }}</span>
            </div>
            <div class="success-row b">
              <span>Ghi chú</span>
              <span class="receipt-note-val">{{ receiptData.note || 'Không có ghi chú' }}</span>
            </div>
            <div class="receipt-divider"></div>
            <div class="success-row b">
              <span>Thanh toán</span>
              <span>{{ paymentMethod === 'Tiền mặt' ? 'Tiền mặt' : 'Ví MoMo' }}</span>
            </div>
            <div class="success-row b">
              <span>Mã Hóa Đơn</span>
              <span class="tx-id" :class="{ pink: paymentMethod === 'momo' }">{{ txId }}</span>
            </div>
            <div class="success-row b">
              <span>Thời gian thanh toán</span><span>{{ txTime }}</span>
            </div>
            <div class="receipt-divider"></div>
            <div class="receipt-items-section">
              <p class="receipt-items-title">Sản phẩm đã mua</p>
              <div v-for="(item, i) in receiptData.items" :key="i" class="receipt-item">
                <div class="receipt-item-header">
                  <div class="receipt-item-name">{{ item.name }} ({{ item.size }}) x{{ item.qty }}</div>
                  <div class="receipt-item-price-inline">{{ (item.unitPrice * item.qty).toLocaleString() }}đ</div>
                </div>
                
                <div class="receipt-item-meta">
                  Đá: {{ item.ice }} | Đường: {{ item.sugar }}
                </div>

                <div v-if="item.isCustom" class="rpc-custom-row">
                  <span class="rpc-custom-tag">{{ item.beanName }}</span>
                  <span class="rpc-custom-tag">{{ item.base }}</span>
                  <span v-if="item.milkName" class="rpc-custom-tag">{{ item.milkName }}</span>
                </div>

                <div v-if="getItemToppingDetails(item).length" class="receipt-item-toppings">
                  <span v-for="t in getItemToppingDetails(item)" :key="t.name" class="receipt-topping-tag">
                    + {{ t.name }}<em v-if="t.price"> ({{ t.price.toLocaleString() }}đ)</em>
                  </span>
                </div>
              </div>
            </div>
            <div class="receipt-divider"></div>
            <div v-if="receiptData.discountPercent > 0" class="success-row b">
              <span>Giá gốc</span><span>{{ receiptData.originalPrice.toLocaleString() }} VNĐ</span>
            </div>
            <div v-if="receiptData.discountPercent > 0" class="success-row b">
              <span>Giảm giá</span><span>-{{ receiptData.discountPercent }}%</span>
            </div>
            <div class="success-row b">
              <span>Số tiền thanh toán</span>
              <span class="cash-need">{{ receiptData.finalPrice.toLocaleString() }} VNĐ</span>
            </div>
            <template v-if="paymentMethod === 'Tiền mặt'">
              <div class="success-row b">
                <span>Số Tiền Khách đưa</span>
                <span>{{ (parseInt((customerMoney || '').replace(/\./g, '')) || 0).toLocaleString() }} VNĐ</span>
              </div>
              <div class="success-row b">
                <span>Tiền thừa trả khách</span>
                <span class="cash-change">{{ receiptData.change.toLocaleString() }} VNĐ</span>
              </div>
            </template>
          </div>
        </div>

        <div class="success-fixed-bottom">
          <button class="success-close-btn" :class="{ 'success-close-btn--cash': paymentMethod === 'Tiền mặt' }"
            @click="closeSuccessPopup">
            Hoàn thành
          </button>
        </div>

      </div>
    </div>

    <!-- ==================== POPUP QR MOMO ==================== -->
    <Momo :visible="showMomoQR" :amount="finalPrice"
      :orderInfo="`Thanh toan DripLab - ${displayCustomerName || (currentOrder && currentOrder.anonCode) || 'Khach le'}`"
      @close="closeMomoQR" @paid="onMomoPaid" />

  </div>
</template>