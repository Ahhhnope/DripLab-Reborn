<script setup>
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
import { useAdminDatBan } from '../JS/AdminDatBan'

const logoDrip = new URL('../IMG/DripLab_Logo.png', import.meta.url).href
const router = useRouter()

const {
  TOTAL_TABLES,
  showDetail,
  selectedTable,
  selectedOrder,
  showConfirmDone,
  activeFilter,
  filteredTables,
  activeInvoices,
  selectedInvoice,
  isOccupied,
  getTableLabel,
  openDetail,
  selectInvoice,
  closeDetail,
  confirmDoneSingle,
  confirmDoneAll,
  addProduct,
  setFilter,
  setRouter,
  syncFromShared,
  getModalTableLabel,
  isTableOccupiedInModal,
  countOccupied,
  countAvailable,
} = useAdminDatBan()

setRouter(router)

let syncTimer = null
onMounted(() => {
  syncFromShared()
  syncTimer = setInterval(syncFromShared, 2000)
})
onUnmounted(() => {
  if (syncTimer) clearInterval(syncTimer)
})

function getImageUrl(url) {
  if (!url) return ''
  return url.startsWith('http') ? url : `http://localhost:8080${url}`
}

function getProductImg(item) {
  const url = item.drink?.imageUrl || item.drink?.image || item.imageUrl || item.image || ''
  if (item.isCustom) {
    url = item.imageUrl
  }
  return getImageUrl(url)
}

function getBasePrice(item) {
  return item.basePriceAtPurchase || 0
}
</script>

<style src="../CSS/AdminDatBan.css"></style>

<template>
  <div class="admin-datban-root">

    <!-- ═══ HEADER ═══ -->
    <div class="adb-header">QUẢN LÝ ĐẶT BÀN</div>

    <!-- ═══ FILTER TABS ═══ -->
    <div class="adb-filter-bar">
      <button class="adb-filter-btn" :class="{ active: activeFilter === 'all' }" @click="setFilter('all')">
        Tất cả <span class="adb-filter-count">{{ TOTAL_TABLES }}</span>
      </button>
      <button class="adb-filter-btn occupied-filter" :class="{ active: activeFilter === 'occupied' }"
        @click="setFilter('occupied')">
        Đang sử dụng <span class="adb-filter-count">{{ countOccupied() }}</span>
      </button>
      <button class="adb-filter-btn available-filter" :class="{ active: activeFilter === 'available' }"
        @click="setFilter('available')">
        Còn trống <span class="adb-filter-count">{{ countAvailable() }}</span>
      </button>
    </div>

    <!-- ═══ VIEW: TẤT CẢ / CÒN TRỐNG ═══ -->
    <div v-if="activeFilter === 'all' || activeFilter === 'available'" class="adb-grid-wrap">
      <div v-if="filteredTables.length" class="adb-grid">
        <div v-for="num in filteredTables" :key="num" class="adb-table-card"
          :class="{ 'occupied-card': isOccupied(num) }" @click="openDetail(num)">
          <span class="adb-table-num">{{ getTableLabel(num) }}</span>
          <span v-if="isOccupied(num)" class="adb-occupied-badge">Đang sử dụng</span>
          <span v-if="isOccupied(num)" class="adb-card-dot"></span>
        </div>
      </div>
      <div v-else class="adb-empty-filter">
        <span class="adb-empty-icon">{{ activeFilter === 'available' ? '✅' : '🪑' }}</span>
        <span>{{ activeFilter === 'available' ? 'Tất cả bàn đang được sử dụng' : 'Chưa có bàn nào' }}</span>
      </div>
    </div>

    <!-- ═══ VIEW: ĐANG SỬ DỤNG ═══ -->
    <div v-if="activeFilter === 'occupied'" class="adb-occupied-view">

      <!-- Cột trái: danh sách hóa đơn -->
      <div class="adb-invoice-panel">
        <div class="adb-invoice-panel-title">TỔNG HÓA ĐƠN</div>
        <div class="adb-invoice-list">
          <div v-if="!activeInvoices.length" class="adb-invoice-empty">
            Chưa có hóa đơn nào đang sử dụng bàn
          </div>
          <div v-for="invoice in activeInvoices" :key="invoice.id" class="adb-invoice-item"
            :class="{ 'is-active': selectedInvoice?.id === invoice.id }" @click="selectInvoice(invoice)">
            <div class="adb-invoice-name">Tên: {{ invoice.displayName }}</div>
            <div class="adb-invoice-tables-line">
              Bàn: {{invoice.selectedTables.map(t => String(t).padStart(2, '0')).join(' + ')}}
            </div>
          </div>
        </div>
      </div>

      <!-- Cột phải: lưới bàn -->
      <div class="adb-occupied-grid-wrap">
        <template v-if="!selectedInvoice">
          <div class="adb-empty-filter">
            <span class="adb-empty-icon">👈</span>
            <span>Chọn một hóa đơn để xem bàn</span>
          </div>
        </template>

        <template v-else>
          <div v-if="selectedInvoice.selectedTables.length" class="adb-grid adb-grid--occupied">
            <div v-for="num in selectedInvoice.selectedTables" :key="num" class="adb-table-card occupied-card"
              @click="openDetail(num)">
              <span class="adb-table-num">{{ getTableLabel(num) }}</span>
              <span class="adb-occupied-badge">Đang sử dụng</span>
              <span class="adb-card-dot"></span>
            </div>
          </div>
          <div v-else class="adb-empty-filter">
            <span class="adb-empty-icon">✅</span>
            <span>Không có bàn nào trong hóa đơn này</span>
          </div>
        </template>
      </div>
    </div>

    <!-- ═══ MODAL CHI TIẾT ═══ -->
    <div v-if="showDetail" class="adb-overlay" @click.self="closeDetail">
      <div class="adb-modal">

        <!-- Topbar -->
        <div class="adb-modal-topbar">
          <button class="adb-modal-close" @click="closeDetail">✕</button>
          <span class="adb-modal-status" :class="isTableOccupiedInModal() ? 'occupied' : 'available'">
            {{ isTableOccupiedInModal() ? 'Đang Sử Dụng' : 'Sẵn Bàn' }}
          </span>
        </div>

        <div class="adb-modal-body">

          <!-- Logo + tiêu đề -->
          <div class="adb-detail-logo-wrap">
            <img :src="logoDrip" alt="DripLab" class="adb-logo-img" @error="$event.target.style.display = 'none'" />
            <p class="adb-detail-title">Chi Tiết Đặt Bàn</p>
          </div>

          <!-- Badge bàn -->
          <div class="adb-table-badge-wrap">
            <span class="adb-table-badge">{{ getModalTableLabel() }}</span>
          </div>

          <!-- Thông tin khách -->
          <div class="adb-section">
            <p class="adb-section-title">Thông Tin Khách Hàng</p>
            <div class="adb-info-row">
              <span class="adb-info-lbl">Họ và tên</span>
              <span class="adb-info-val">{{ selectedOrder?.receiverName || selectedOrder?.customerName ||
                selectedOrder?.anonCode || 'Không có thông tin' }}</span>
            </div>
            <div class="adb-info-row">
              <span class="adb-info-lbl">Số điện thoại</span>
              <span class="adb-info-val">{{ selectedOrder?.receiverPhone || selectedOrder?.customerPhone || '–'
                }}</span>
            </div>
            <div class="adb-info-row">
              <span class="adb-info-lbl">Hình thức thanh toán</span>
              <span class="adb-info-val">{{ selectedOrder?.paymentMethod || 'Không có thông tin' }}</span>
            </div>
            <div class="adb-info-row">
              <span class="adb-info-lbl">Thời gian đặt</span>
              <span class="adb-info-val">{{ selectedOrder?.createdAt || 'Không có thông tin' }}</span>
            </div>
          </div>

          <template v-if="selectedOrder?.orderSections && selectedOrder.orderSections.length">
            <div v-for="(section, sIdx) in selectedOrder.orderSections" :key="section.orderId || sIdx"
              class="adb-section">
              <div class="adb-section-title-row">
                <p class="adb-section-title">
                  {{ sIdx === 0 ? 'Thông Tin Sản Phẩm' : 'Sản Phẩm Thêm' }}
                </p>
                <span v-if="section.orderNumber" class="adb-txn-badge">
                  Mã giao dịch: {{ section.orderNumber }}
                </span>
              </div>

              <p v-if="!section.items?.length" class="adb-empty">Chưa có sản phẩm</p>

              <div v-for="item in section.items" :key="item.id" class="adb-product-item">
                <div class="adb-product-img-wrap">
                  <img v-if="getProductImg(item)" :src="getProductImg(item)" :alt="item.drink?.name"
                    class="adb-product-img" @error="$event.target.style.display = 'none'" />
                  <span v-else>☕</span>
                </div>

                <div class="adb-product-info">
                  <div class="adb-product-name-row">
                    <span class="adb-product-name">{{ item.drink?.name }}</span>
                    <span class="adb-product-qty">x{{ item.quantity }}</span>
                    <span class="adb-product-base-price">{{ getBasePrice(item).toLocaleString() }} đ</span>
                  </div>

                  <div class="adb-product-options">
                    <div v-if="item.size" class="adb-option-row">
                      <span class="adb-option-icon">≡</span>
                      <span class="adb-option-name">Size {{ item.size.name }}</span>
                      <span class="adb-option-price" :class="item.size.price > 0 ? 'plus' : 'zero'">
                        +{{ (item.size.price || 0).toLocaleString() }} đ
                      </span>
                    </div>
                    <template v-if="item.orderItemToppings?.length">
                      <div v-for="otp in item.orderItemToppings" :key="otp.id" class="adb-option-row">
                        <span class="adb-option-icon">+</span>
                        <span class="adb-option-name">{{ otp.topping?.name }}</span>
                        <span class="adb-option-price plus">+{{ (otp.topping?.price || 0).toLocaleString() }} đ</span>
                      </div>
                    </template>
                    <div class="adb-badge-row">
                      <span v-if="item.sugar" class="adb-badge-pill sugar">Đường {{ item.sugar }} %</span>
                      <span v-if="item.ice" class="adb-badge-pill ice">Đá {{ item.ice }} %</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="adb-section">
              <div class="adb-section-title-row">
                <p class="adb-section-title">Thông Tin Sản Phẩm</p>
                <span v-if="selectedOrder?.orderNumber" class="adb-txn-badge">
                  Mã giao dịch: {{ selectedOrder.orderNumber }}
                </span>
              </div>
              <p v-if="!selectedOrder?.items?.length" class="adb-empty">Chưa có sản phẩm</p>

              <div v-for="item in selectedOrder?.items" :key="item.id" class="adb-product-item">
                <div class="adb-product-img-wrap">
                  <img v-if="getProductImg(item)" :src="getProductImg(item)" :alt="item.drink?.name"
                    class="adb-product-img" @error="$event.target.style.display = 'none'" />
                  <span v-else>☕</span>
                </div>

                <div class="adb-product-info">
                  <div class="adb-product-name-row">
                    <span class="adb-product-name">{{ item.drink?.name }}</span>
                    <span class="adb-product-qty">x{{ item.quantity }}</span>
                    <span class="adb-product-base-price">{{ getBasePrice(item).toLocaleString() }} đ</span>
                  </div>

                  <div class="adb-product-options">
                    <div v-if="item.size" class="adb-option-row">
                      <span class="adb-option-icon">≡</span>
                      <span class="adb-option-name">Size {{ item.size.name }}</span>
                      <span class="adb-option-price" :class="item.size.price > 0 ? 'plus' : 'zero'">
                        +{{ (item.size.price || 0).toLocaleString() }} đ
                      </span>
                    </div>
                    <template v-if="item.orderItemToppings?.length">
                      <div v-for="otp in item.orderItemToppings" :key="otp.id" class="adb-option-row">
                        <span class="adb-option-icon">+</span>
                        <span class="adb-option-name">{{ otp.topping?.name }}</span>
                        <span class="adb-option-price plus">+{{ (otp.topping?.price || 0).toLocaleString() }} đ</span>
                      </div>
                    </template>
                    <div class="adb-badge-row">
                      <span v-if="item.sugar" class="adb-badge-pill sugar">Đường {{ item.sugar }} %</span>
                      <span v-if="item.ice" class="adb-badge-pill ice">Đá {{ item.ice }} %</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Nút hành động -->
          <template v-if="isTableOccupiedInModal()">
            <div class="adb-action-row">
              <button class="adb-btn-done" @click="showConfirmDone = true">Trả Bàn</button>
              <button class="adb-btn-add-product" @click="addProduct">+ Thêm sản phẩm</button>
            </div>
          </template>

          <template v-else>
            <div class="adb-empty-right">
              <span class="adb-empty-icon">🪑</span>
              <span>Bàn đang trống — Chưa có đơn hàng</span>
            </div>
          </template>

        </div>
      </div>
    </div>

    <!-- ═══ CONFIRM POPUP ═══ -->
    <div v-if="showConfirmDone" class="adb-confirm-overlay" @click.self="showConfirmDone = false">
      <div class="adb-confirm-popup">
        <div class="adb-confirm-icon">🪑</div>
        <p class="adb-confirm-title">Xác nhận trả bàn?</p>
        <p class="adb-confirm-sub">Sau khi xác nhận, bàn sẽ trở về trạng thái trống và đơn hàng sẽ được đóng lại.</p>
        <div class="adb-confirm-btns">
          <button class="adb-confirm-back" @click="showConfirmDone = false">
            <span> Quay lại</span>
          </button>
          <button class="adb-confirm-single" @click="confirmDoneSingle">
            <span>Trả bàn này</span>
          </button>
          <button class="adb-confirm-all" @click="confirmDoneAll">
            <span> Trả tất cả </span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>