<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
defineOptions({ name: 'CounterOrder' })
import { useCounterOrder } from '../JS/CounterOrder.JS'
import Momo from '../TheATMmomo/Momo.vue'

const router = useRouter()
const logoMomo = new URL('../IMG/logoMOMO.png', import.meta.url).href
const logoDrip = new URL('../IMG/DripLab_Logo.png', import.meta.url).href

const {
  orderMode,
  showCancelOrderPopup,
  requestCancelOrder, confirmCancelOrder, closeCancelOrderPopup,
  customerName, customerPhone,
  customerNameInput, customerPhoneInput,
  nameError, phoneError,
  onNameInput, onPhoneInput,
  saveCustomerInfo,
  showSelectCustomerPopup, openSelectCustomerPopup, closeSelectCustomerPopup,
  customerList, selectExistingCustomer,
  TOTAL_TABLES, selectedTable, selectedTables, occupiedTables,
  availableTables, tablesFull, selectTable, MAX_TABLES_PER_ORDER,
  otherOccupiedTables,
  searchText, products, searchProducts,
  orderList, currentOrder, createNewOrder, selectOrder, MAX_ORDERS,
  orderedItems, totalPrice, removeItem,
  discountInput, discountCodeList, appliedCode, discountPercent, discountMessage, applyDiscount, finalPrice,
  orderNote, onNoteInput,
  checkout, showPaymentPopup, paymentMethod,
  goToReview, backFromReview,
  showReviewPopup,
  confirmPayment, closePaymentPopup,
  showSuccessPopup, closeSuccessPopup, txId, txTime, receiptData,
  showPopup, selectedProduct, toppingList, selectedToppings, selectedSize, selectedQty,
  selectedIce, selectedSugar, iceOptions, sugarOptions, SIZE_PRICES,
  openPopup, closePopup, toggleTopping, isToppingSelected, incQty, decQty, confirmOrder,
  displayCustomerName, displayCustomerPhone, displayTableNums,
  displayDineMode,
  MAX_CASH,
  showTablePopup, openTablePopup, closeTablePopup,
  dineMode,
  pendingInvoiceId,
} = useCounterOrder()

const showMomoQR = ref(false)

// ── Thông báo thêm khách hàng ──
const showCustomerNotif = ref(false)
const customerNotifSuccess = ref(true)
const customerNotifProgress = ref(100)
let notifTimer = null
let notifProgressInterval = null

function showNotification(success) {
  if (notifTimer) { clearTimeout(notifTimer); notifTimer = null }
  if (notifProgressInterval) { clearInterval(notifProgressInterval); notifProgressInterval = null }

  customerNotifSuccess.value = success
  customerNotifProgress.value = 100
  showCustomerNotif.value = true

  const duration = 5000
  const step = 50
  const decrement = (step / duration) * 100

  notifProgressInterval = setInterval(() => {
    customerNotifProgress.value = Math.max(0, customerNotifProgress.value - decrement)
  }, step)

  notifTimer = setTimeout(() => {
    showCustomerNotif.value = false
    clearInterval(notifProgressInterval)
    notifProgressInterval = null
  }, duration)
}

// FIX 2: Đóng popup thông báo khi click ra ngoài
function closeNotifOnOverlay() {
  if (!showCustomerNotif.value) return
  showCustomerNotif.value = false
  if (notifTimer) { clearTimeout(notifTimer); notifTimer = null }
  if (notifProgressInterval) { clearInterval(notifProgressInterval); notifProgressInterval = null }
}

// FIX 3: Validate cả tên lẫn số điện thoại trước khi thêm
async function handleSaveCustomerInfo() {
  let valid = true

  // Validate tên
  if (!customerNameInput.value || !customerNameInput.value.trim()) {
    nameError.value = 'Vui lòng nhập họ và tên khách hàng!'
    valid = false
  }

  // Validate số điện thoại
  if (!customerPhoneInput.value) {
    phoneError.value = 'Vui lòng nhập số điện thoại để thêm khách hàng!'
    valid = false
  } else if (customerPhoneInput.value.length < 10) {
    phoneError.value = 'Số điện thoại phải đủ 10 số!'
    valid = false
  }

  if (!valid) {
    showNotification(false)
    return
  }

  try {
    await saveCustomerInfo()
    showNotification(true)
  } catch (e) {
    showNotification(false)
  }
}

// ── Phân trang popup chọn khách hàng ──
const customerSearchText = ref('')
const customerPageSize = 10
const customerCurrentPage = ref(1)

const filteredCustomerList = computed(() => {
  const kw = customerSearchText.value.toLowerCase().trim()
  if (!kw) return customerList.value
  return customerList.value.filter(c =>
    (c.name || '').toLowerCase().includes(kw) ||
    (c.phone || '').includes(kw)
  )
})

const customerTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCustomerList.value.length / customerPageSize))
)

const pagedCustomerList = computed(() => {
  const start = (customerCurrentPage.value - 1) * customerPageSize
  return filteredCustomerList.value.slice(start, start + customerPageSize)
})

function onCustomerSearch() {
  customerCurrentPage.value = 1
}

function openSelectCustomerPopupWrapped() {
  customerSearchText.value = ''
  customerCurrentPage.value = 1
  openSelectCustomerPopup()
}

const visiblePages = computed(() => {
  const total = customerTotalPages.value
  const current = customerCurrentPage.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  if (end - start < 4) start = Math.max(1, end - 4)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// ── MoMo ──
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
    customerName: order?.customerName || customerName.value || '',
    customerPhone: order?.customerPhone || customerPhone.value || '',
    tableNums: order?.selectedTables || selectedTables.value || [],
    anonCode: order?.anonCode || '',
    discountPercent: discountPercent.value,
    originalPrice: totalPrice.value,
    note: orderNote.value || order?.note || '',
    dineMode: dineMode.value,
  }
  confirmPayment()
}

// ── Điều hướng ──
function goAdmin() {
  router.push('/AdminPOS')
}

// ── Bàn ──
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
  if (isTableOccupiedByOther(num) && !isTableSelected(num)) return 'Hết bàn'
  return `Bàn ${String(num).padStart(2, '0')}`
}

// ── Tab hóa đơn ──
function onOrderTabClick(order) {
  if (currentOrder.value && currentOrder.value.id === order.id) {
    requestCancelOrder(order)
  } else {
    selectOrder(order)
  }
}

// ── Hình thức ──
function onDineModeChange(val) {
  dineMode.value = val
  if (currentOrder.value) currentOrder.value.dineMode = val
}

function getDineModeLabel(mode) {
  if (mode === null || mode === undefined) return 'Chưa chọn'
  return mode === true ? 'Tại quán' : 'Mang đi'
}

function getDineModeClass(mode) {
  if (mode === null || mode === undefined) return 'mode-none'
  return mode === true ? 'mode-dine' : 'mode-takeaway'
}

// ── Topping & giá ──
function getItemToppingDetails(item) {
  if (item.toppingDetails && item.toppingDetails.length) return item.toppingDetails
  if (item.toppings && item.toppings.length) {
    return item.toppings.map(t => ({
      id: t.topping?.id || t.id,
      name: t.topping?.name || t.name,
      price: t.topping?.price || t.price || 0
    }))
  }
  return []
}

function getItemBasePrice(item) {
  const toppingTotal = getItemToppingDetails(item).reduce((s, t) => s + (t.price || 0), 0)
  return item.unitPrice - toppingTotal
}

// ── Review ──
async function goToReviewWithId() {
  await goToReview()
}
</script>

<style src="../CSS/CounterOrder.CSS"></style>

<template>
  <div class="counter-root">

    <!-- ==================== MÀN HÌNH ĐẶT MÓN ==================== -->
    <div class="counter-order">

      <!-- Cột trái -->
      <div class="product-section">
        <div class="top-bar">ĐƠN TẠI QUẦY</div>

        <div class="tabs-bar">
          <button class="add-order-tab" @click="createNewOrder" :disabled="orderList.length >= MAX_ORDERS">
            + Thêm hóa đơn
          </button>
          <button v-for="order in orderList" :key="order.id" class="order-tab"
            :class="{ active: currentOrder && currentOrder.id === order.id }" @click="onOrderTabClick(order)">
            Hóa đơn {{ order.orderNumber }}
          </button>
        </div>

        <template v-if="currentOrder">
          <div class="product-main">
            <div class="search-bar">
              <input v-model="searchText" type="text" placeholder="Tìm Sản Phẩm...." class="search-input" />
              <button class="search-btn" @click="searchProducts">Tìm kiếm</button>
            </div>
            <div class="product-grid">
              <!-- Card logo DripLab -->
              <div class="product-card logo-card" @click="goAdmin">
                <div class="logo-card-img-wrap">
                  <img :src="logoDrip" alt="DripLab" class="logo-card-img" />
                </div>
                <p class="logo-card-label">COFFEE <br> Tự Pha Chế</p>
                <button class="detail-btn" style="width:80%;margin:0 auto 10px" @click.stop="goAdmin">Chi tiết</button>
              </div>
              <!-- Danh sách sản phẩm -->
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
        </template>

        <!-- Trạng thái rỗng -->
        <div v-else class="empty-state">
          <div class="empty-state-icon">🧾</div>
          <p class="empty-state-title">Chưa có hóa đơn nào!</p>
          <p class="empty-state-sub">Nhấn "+ Thêm hóa đơn" để bắt đầu</p>
        </div>
      </div>

      <!-- Cột phải -->
      <div class="order-section">
        <div class="order-section-title">CHI TIẾT KHÁCH HÀNG</div>

        <!-- FIX 1: Thông tin khách hàng - chỉ hiện đầy đủ khi có hóa đơn -->
        <div class="right-customer-block">
          <p class="right-sub-title">Khách Hàng</p>

          <div class="right-field">
            <label class="right-field-lbl">Họ và tên</label>
            <input
              :value="customerNameInput"
              @input="onNameInput"
              type="text"
              placeholder="Nhập tên khách hàng..."
              class="right-input"
              :class="{ error: nameError, 'input-disabled': !currentOrder }"
              :disabled="!currentOrder"
            />
            <span v-if="nameError" class="right-field-err">{{ nameError }}</span>
          </div>

          <div class="right-field">
            <label class="right-field-lbl">Số điện thoại</label>
            <input
              :value="customerPhoneInput"
              @input="onPhoneInput"
              type="text"
              inputmode="numeric"
              placeholder="Nhập số điện thoại..."
              maxlength="10"
              class="right-input"
              :class="{ error: phoneError, 'input-disabled': !currentOrder }"
              :disabled="!currentOrder"
            />
            <span v-if="phoneError" class="right-field-err">{{ phoneError }}</span>
          </div>

          <!-- FIX 1: Ẩn 2 nút khi chưa có hóa đơn -->
          <div v-if="currentOrder" class="right-customer-action-row">
            <button class="right-customer-btn right-customer-btn--select" @click="openSelectCustomerPopupWrapped">
              Chọn khách hàng
            </button>
            <button class="right-customer-btn right-customer-btn--add" @click="handleSaveCustomerInfo">
              Thêm khách hàng
            </button>
          </div>
          <!-- Placeholder giữ layout khi chưa có hóa đơn -->
          <div v-else class="right-customer-action-row right-customer-action-row--placeholder">
            <button class="right-customer-btn right-customer-btn--select" disabled>Chọn khách hàng</button>
            <button class="right-customer-btn right-customer-btn--add" disabled>Thêm khách hàng</button>
          </div>

          <div class="right-meta-row">
            <div class="right-meta-item">
              <span class="right-info-lbl">Đặt bàn:</span>
              <span class="right-table-val">
                {{ displayTableNums.length ? formatTableNums(displayTableNums) : 'Chưa có' }}
              </span>
            </div>
            <div class="right-meta-item">
              <span class="right-info-lbl">Hình thức:</span>
              <span class="right-table-val" :class="getDineModeClass(displayDineMode)">
                {{ getDineModeLabel(displayDineMode) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Danh sách sản phẩm đã chọn -->
        <div class="right-products-block">
          <p class="right-products-title">Sản Phẩm Mua</p>
          <p v-if="!orderedItems.length" style="font-size:12px;color:#aaa;text-align:center;padding:20px 0">
            Chưa có sản phẩm
          </p>

          <div v-for="(item, index) in orderedItems" :key="index" class="rpc-card">
            <div class="rpc-top">
              <span class="rpc-name">{{ item.name }}</span>
              <div class="rpc-meta-row">
                <span class="rpc-size-badge">Size: {{ item.sizeLabel ?? item.size }}</span>
                <span class="rpc-qty-badge">SL: {{ item.qty }}</span>
              </div>
              <button class="rpc-remove" @click="removeItem(index, item.cartItemId)" title="Xóa">✕</button>
            </div>
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
              <div class="rpc-price-breakdown">
                <div class="rpc-price-row">
                  <span class="rpc-price-lbl">Giá gốc</span>
                  <span class="rpc-price-val">{{ getItemBasePrice(item).toLocaleString() }} đ</span>
                </div>
                <div v-for="t in getItemToppingDetails(item)" :key="t.name || t.id"
                  class="rpc-price-row rpc-price-row--topping">
                  <span class="rpc-price-lbl">{{ t.name }}</span>
                  <span class="rpc-price-val rpc-price-val--topping">+{{ (t.price || 0).toLocaleString() }} đ</span>
                </div>
              </div>
            </div>
            <div class="rpc-footer">
              <span class="rpc-unit-price">Tổng số tiền</span>
              <span class="rpc-total-price">{{ (item.unitPrice * item.qty).toLocaleString() }}đ</span>
            </div>
          </div>
        </div>

        <!-- Footer thanh toán -->
        <div class="order-footer-block">
          <div class="discount-section">
            <p class="discount-label">Mã khuyến mãi</p>
            <div class="discount-bar">
              <!-- FIX 1: Disable select và nút Áp dụng khi chưa có hóa đơn -->
              <select v-model="discountInput" class="discount-select" :disabled="!currentOrder">
                <option value="">Chọn mã khuyến mãi</option>
                <option v-for="item in discountCodeList" :key="item.code" :value="item.code">{{ item.label }}</option>
              </select>
              <button class="discount-btn" @click="applyDiscount" :disabled="!currentOrder">Áp dụng</button>
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
            <!-- FIX 1: Disable nút Hình thức khi chưa có hóa đơn -->
            <button
              class="right-mode-btn"
              :class="{ 'right-mode-btn--disabled': !currentOrder }"
              :disabled="!currentOrder"
              @click="openTablePopup"
            >Hình thức</button>

            <!-- FIX 1: Thanh toán chỉ hiện khi có hóa đơn VÀ có sản phẩm -->
            <button
              v-if="currentOrder && orderedItems.length > 0"
              class="right-pay-btn"
              @click="checkout"
            >Thanh toán</button>
            <button
              v-else
              class="right-pay-btn right-pay-btn--disabled"
              disabled
            >Thanh toán</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP HỦY HÓA ĐƠN ==================== -->
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

    <!-- ==================== POPUP THÔNG BÁO THÊM KHÁCH HÀNG ==================== -->
    <!-- FIX 2: Click ra ngoài overlay để tắt popup -->
    <div v-if="showCustomerNotif" class="confirm-overlay customer-notif-overlay" @click.self="closeNotifOnOverlay">
      <div class="confirm-popup customer-notif-popup" :class="customerNotifSuccess ? 'notif-success' : 'notif-error'">
        <div class="confirm-logo">
          <img :src="logoDrip" alt="DripLab" style="height:60px;object-fit:contain" />
        </div>
        <div class="notif-icon-wrap">
          <span v-if="customerNotifSuccess" class="notif-icon notif-icon--success">✓</span>
          <span v-else class="notif-icon notif-icon--error">✕</span>
        </div>
        <p class="confirm-title notif-title" :class="customerNotifSuccess ? 'notif-title--success' : 'notif-title--error'">
          {{ customerNotifSuccess ? 'Thêm thành công!' : 'Thêm thất bại!' }}
        </p>
        <p class="cancel-order-sub">
          {{ customerNotifSuccess
            ? 'Thông tin khách hàng đã được lưu lại.'
            : 'Vui lòng kiểm tra lại thông tin khách hàng.' }}
        </p>
        <!-- Thanh tiến trình tự đóng -->
        <div class="notif-progress-wrap">
          <div
            class="notif-progress-bar"
            :class="customerNotifSuccess ? 'notif-progress-bar--success' : 'notif-progress-bar--error'"
            :style="{ width: customerNotifProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP CHỌN KHÁCH HÀNG ==================== -->
    <div v-if="showSelectCustomerPopup" class="confirm-overlay">
      <div class="select-customer-popup">

        <!-- Header -->
        <div class="scp-header">
          <div class="scp-header-left">
            <span class="scp-header-icon">ℹ</span>
            <span class="scp-header-title">Chọn khách hàng</span>
          </div>
          <button class="scp-close-btn" @click="closeSelectCustomerPopup">✕</button>
        </div>

        <!-- Tìm kiếm -->
        <div class="scp-search-wrap">
          <input v-model="customerSearchText" @input="onCustomerSearch" type="text" class="scp-search-input"
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..." />
        </div>

        <!-- Bảng danh sách -->
        <div class="scp-table-wrap">
          <table class="scp-table">
            <thead>
              <tr>
                <th class="scp-th col-stt">STT</th>
                <th class="scp-th col-name">Tên khách hàng</th>
                <th class="scp-th col-phone">Số điện thoại</th>
                <th class="scp-th col-action">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pagedCustomerList.length === 0">
                <td colspan="4" class="scp-empty">Không có khách hàng nào</td>
              </tr>
              <tr v-for="(cus, i) in pagedCustomerList" :key="cus.id || cus.phone" class="scp-tr">
                <td class="scp-td col-stt">{{ (customerCurrentPage - 1) * customerPageSize + i + 1 }}</td>
                <td class="scp-td col-name">{{ cus.fullName || 'Không tên' }}</td>
                <td class="scp-td col-phone">{{ cus.phone || '—' }}</td>
                <td class="scp-td col-action">
                  <button class="scp-choose-btn" @click="selectExistingCustomer(cus)">Chọn</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Phân trang -->
        <div class="scp-pagination">
          <button class="scp-page-btn" :disabled="customerCurrentPage <= 1" @click="customerCurrentPage--">&lt;</button>
          <span v-for="p in visiblePages" :key="p" class="scp-page-num" :class="{ active: p === customerCurrentPage }"
            @click="customerCurrentPage = p">{{ p }}</span>
          <button class="scp-page-btn" :disabled="customerCurrentPage >= customerTotalPages"
            @click="customerCurrentPage++">&gt;</button>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP CHỌN HÌNH THỨC + BÀN ==================== -->
    <div v-if="showTablePopup" class="confirm-overlay">
      <div class="table-mode-popup">
        <p class="table-mode-title">Chọn Hình Thức & Bàn</p>

        <div class="mode-choice-row">
          <button class="mode-choice-btn" :class="{ active: dineMode === false }" @click="onDineModeChange(false)">Mang
            đi</button>
          <button class="mode-choice-btn" :class="{ active: dineMode === true }" @click="onDineModeChange(true)">Tại
            quán</button>
        </div>

        <template v-if="dineMode === true">
          <div class="table-count-row" style="margin-top:14px">
            <template v-if="tablesFull">
              <span class="table-count-full">⚠ FULL BÀN — Không còn bàn trống!</span>
            </template>
            <template v-else>
              Bàn trống: <strong>{{ String(TOTAL_TABLES - otherOccupiedTables.length).padStart(2, '0') }}</strong>
              &nbsp;|&nbsp;
              <span class="table-selected-hint">Đã chọn: <strong>{{ selectedTables.length }}</strong>/{{
                MAX_TABLES_PER_ORDER }}</span>
            </template>
          </div>

          <div v-if="selectedTables.length" class="selected-tables-row">
            <span v-for="t in selectedTables" :key="t" class="selected-table-badge">
              Bàn {{ String(t).padStart(2, '0') }}
              <button class="badge-remove" @click="selectTable(t)">✕</button>
            </span>
          </div>

          <div class="table-grid" style="margin-top:10px">
            <button v-for="num in availableTables" :key="num" class="table-btn"
              :class="{ selected: isTableSelected(num), occupied: isTableOccupiedByOther(num) && !isTableSelected(num) }"
              @click="selectTable(num)" :disabled="isTableOccupiedByOther(num) && !isTableSelected(num)">
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

        <p class="payment-method-title">Lựa chọn phương thức thanh toán</p>
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

        <div class="note-section">
          <p class="note-label">Ghi chú</p>
          <textarea class="note-textarea" :value="orderNote" @input="onNoteInput"
            placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)..."></textarea>
        </div>

        <template v-if="paymentMethod === 'Tiền mặt'">
          <div class="payment-footer">
            <button class="btn-cancel" @click="closePaymentPopup">Hủy</button>
            <button class="btn-confirm" @click="goToReview">Kiểm tra</button>
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

    <!-- ==================== POPUP KIỂM TRA THÔNG TIN ==================== -->
    <div v-if="showReviewPopup" class="popup-overlay">
      <div class="review-popup">
        <p class="review-title">Kiểm Tra Đơn Hàng</p>

        <p class="review-section-title">Thông Tin Khách Hàng</p>

        <div class="review-row">
          <span class="review-lbl">Mã Hóa Đơn</span>
          <span class="review-val review-invoice-id">
            <span class="tx-id" :class="{ pink: paymentMethod === 'momo' }">{{ receiptData.invoiceId || pendingInvoiceId
              }}</span>
          </span>
        </div>
        <div class="review-row">
          <span class="review-lbl">Họ và tên</span>
          <span class="review-val">{{ receiptData.customerName?.trim() || 'Khách vãng lai' }}</span>
        </div>
        <div class="review-row">
          <span class="review-lbl">Số điện thoại</span>
          <span class="review-val">{{ receiptData.customerPhone || 'Không Có Thông Tin' }}</span>
        </div>
        <div class="review-row">
          <span class="review-lbl">Đặt bàn</span>
          <span class="review-val">{{ receiptData.tableNums?.length ? formatTableNums(receiptData.tableNums) : 'Chưa có'
            }}</span>
        </div>
        <div class="review-row">
          <span class="review-lbl">Thanh Toán</span>
          <span class="review-val">{{ paymentMethod === 'Tiền mặt' ? 'Tiền mặt' : '🟣 Ví MoMo' }}</span>
        </div>
        <div class="review-row">
          <span class="review-lbl">Hình thức</span>
          <span class="review-val review-mode-badge" :class="receiptData.dineMode === true ? 'dine' : 'takeaway'">
            {{ receiptData.dineMode === true ? 'Tại quán' : 'Mang đi' }}
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
            <div class="review-item-name">{{ item.name }} ({{ item.sizeLabel || item.size }}) x{{ item.qty }}</div>
            <div class="review-item-price">{{ (item.unitPrice * item.qty).toLocaleString() }}đ</div>
          </div>
          <div class="review-item-meta">Đá: {{ item.ice }} | Đường: {{ item.sugar }}</div>

          <div class="review-item-badges" v-if="getItemToppingDetails(item).length">
            <span class="review-badge">Size {{ item.sizeLabel || item.size }}</span>
            <span v-for="t in getItemToppingDetails(item)" :key="t.name" class="review-badge">{{ t.name }}</span>
          </div>

          <div class="review-price-breakdown">
            <div class="review-price-row">
              <span class="review-price-lbl">Giá gốc</span>
              <span class="review-price-val">{{ getItemBasePrice(item).toLocaleString() }}đ</span>
            </div>
            <div class="review-price-row">
              <span class="review-price-lbl">Số lượng</span>
              <span class="review-price-val">× {{ item.qty }}</span>
            </div>
            <div v-if="SIZE_PRICES && SIZE_PRICES[item.sizeLabel || item.size]" class="review-price-row">
              <span class="review-price-lbl">Size {{ item.sizeLabel || item.size }}</span>
              <span class="review-price-val review-price-val--addon">+{{ (SIZE_PRICES[item.sizeLabel || item.size] ||
                0).toLocaleString() }}đ</span>
            </div>
            <div v-for="t in getItemToppingDetails(item)" :key="t.name" class="review-price-row">
              <span class="review-price-lbl">{{ t.name }}</span>
              <span class="review-price-val review-price-val--addon">+{{ (t.price || 0).toLocaleString() }}đ</span>
            </div>
          </div>

          <div v-if="item.isCustom" class="review-item-meta" style="margin-top:2px">
            <span v-if="item.beanName" class="rpc-custom-tag">☕ {{ item.beanName }}</span>
            <span v-if="item.baseName" class="rpc-custom-tag">⚗️ {{ item.baseName }}</span>
            <span v-if="item.milkName" class="rpc-custom-tag">🥛 {{ item.milkName }}</span>
          </div>
        </div>

        <div v-if="receiptData.discountPercent > 0" class="review-row">
          <span class="review-lbl">Giá gốc</span>
          <span class="review-val">{{ receiptData.originalPrice.toLocaleString() }}đ</span>
        </div>
        <div v-if="receiptData.discountPercent > 0" class="review-row">
          <span class="review-lbl">Giảm giá</span>
          <span class="review-val" style="color:#c0392b">-{{ receiptData.discountPercent }}%</span>
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
            <div class="success-row b"><span>Họ và tên</span><span>{{ receiptData.customerName?.trim() || 'Khách vãng lai' }}</span></div>
            <div class="success-row b"><span>Số điện thoại</span><span>{{ receiptData.customerPhone || 'Không Có Thông Tin' }}</span></div>
            <div class="success-row b"><span>Đặt bàn</span><span>{{ receiptData.tableNums?.length ?
              formatTableNums(receiptData.tableNums) : 'Chưa có' }}</span></div>
            <div class="success-row b"><span>Hình thức</span><span>{{ receiptData.dineMode === true ? 'Tại quán' : 'Mang đi' }}</span></div>
            <div class="success-row b"><span>Ghi chú</span><span class="receipt-note-val">{{ receiptData.note || 'Không có ghi chú' }}</span></div>
            <div class="receipt-divider"></div>
            <div class="success-row b"><span>Thanh toán</span><span>{{ paymentMethod === 'Tiền mặt' ? 'Tiền mặt' : 'Ví MoMo'}}</span></div>
            <div class="success-row b"><span>Mã Hóa Đơn</span><span class="tx-id":class="{ pink: paymentMethod === 'momo' }">{{ txId }}</span></div>
            <div class="success-row b"><span>Thời gian thanh toán</span><span>{{ txTime }}</span></div>
            <div class="receipt-divider"></div>
            <div class="receipt-items-section">
              <p class="receipt-items-title">Sản phẩm đã mua</p>
              <div v-for="(item, i) in receiptData.items" :key="i" class="receipt-item">
                <div class="receipt-item-header">
                  <div class="receipt-item-name">{{ item.name }} ({{ item.size ?? item.sizeLabel }}) x{{ item.qty }}
                  </div>
                  <div class="receipt-item-price-inline">{{ (item.unitPrice * item.qty).toLocaleString() }}đ</div>
                </div>
                <div class="receipt-item-meta">Đá: {{ item.ice }} | Đường: {{ item.sugar }}</div>
                <div v-if="item.isCustom" class="rpc-custom-row">
                  <span class="rpc-custom-tag">{{ item.beanName }}</span>
                  <span class="rpc-custom-tag">{{ item.base }}</span>
                  <span v-if="item.milkName" class="rpc-custom-tag">{{ item.milkName }}</span>
                </div>
                <div class="receipt-price-breakdown">
                  <div class="receipt-price-row">
                    <span class="receipt-price-lbl">Giá gốc</span>
                    <span class="receipt-price-val">{{ getItemBasePrice(item).toLocaleString() }} đ</span>
                  </div>
                  <div class="receipt-price-row">
                    <span class="receipt-price-lbl">Số lượng</span>
                    <span class="receipt-price-val">× {{ item.qty }}</span>
                  </div>
                  <div v-for="t in getItemToppingDetails(item)" :key="t.name" class="receipt-price-row">
                    <span class="receipt-price-lbl">{{ t.name }}</span>
                    <span class="receipt-price-val receipt-price-val--addon">+{{ (t.price || 0).toLocaleString() }}
                      đ</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="receipt-divider"></div>
            <div v-if="receiptData.discountPercent > 0" class="success-row b"><span>Giá gốc</span><span>{{
              receiptData.originalPrice.toLocaleString() }} VNĐ</span></div>
            <div v-if="receiptData.discountPercent > 0" class="success-row b"><span>Giảm giá</span><span>-{{
              receiptData.discountPercent }}%</span></div>
            <div class="success-row b"><span>Số tiền thanh toán</span><span class="cash-need">{{
              receiptData.finalPrice.toLocaleString() }} VNĐ</span></div>
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