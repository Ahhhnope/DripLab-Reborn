<script setup>
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
import { useAdminDatBan } from '../JS/AdminDatBan.JS'

const logoDrip = new URL('../IMG/DripLab_Logo.png', import.meta.url).href
const router   = useRouter()

const {
    TOTAL_TABLES,
    showDetail,
    selectedTable,
    selectedOrder,
    showConfirmDone,
    activeFilter,
    filteredTables,
    activeInvoices,
    isOccupied,
    getTableLabel,
    openDetail,
    openDetailForInvoice,
    closeDetail,
    confirmDone,
    addProduct,
    totalPrice,
    setFilter,
    setRouter,
    syncFromShared,
    getModalTableLabel,
    isTableOccupiedInModal,
    countOccupied,
    countAvailable,
} = useAdminDatBan()

// Truyền router vào composable để addProduct() có thể navigate
setRouter(router)

// Đồng bộ mỗi khi tab được focus hoặc component mount
let syncTimer = null
onMounted(() => {
    syncFromShared()
    syncTimer = setInterval(syncFromShared, 2000)
})
onUnmounted(() => {
    if (syncTimer) clearInterval(syncTimer)
})

function getProductImg(item) {
    if (item.imageUrl) return item.imageUrl
    if (item.image)    return item.image
    return ''
}

function getCustomerDisplay(order) {
    return order?.customerName || order?.anonCode || '—'
}
</script>

<style src="../CSS/AdminDatBan.CSS"></style>

<template>
  <div class="admin-datban-root">

    <!-- ═══ HEADER ═══ -->
    <div class="adb-header">QUẢN LÝ ĐẶT BÀN</div>

    <!-- ═══ FILTER TABS ═══ -->
    <div class="adb-filter-bar">
      <button
        class="adb-filter-btn"
        :class="{ active: activeFilter === 'all' }"
        @click="setFilter('all')"
      >
        Tất cả <span class="adb-filter-count">{{ TOTAL_TABLES }}</span>
      </button>
      <button
        class="adb-filter-btn occupied-filter"
        :class="{ active: activeFilter === 'occupied' }"
        @click="setFilter('occupied')"
      >
        Đang sử dụng <span class="adb-filter-count">{{ countOccupied() }}</span>
      </button>
      <button
        class="adb-filter-btn available-filter"
        :class="{ active: activeFilter === 'available' }"
        @click="setFilter('available')"
      >
        Còn trống <span class="adb-filter-count">{{ countAvailable() }}</span>
      </button>
    </div>

    <!-- ═══ VIEW: TẤT CẢ / CÒN TRỐNG — lưới bàn ═══ -->
    <div
      v-if="activeFilter === 'all' || activeFilter === 'available'"
      class="adb-grid-wrap"
    >
      <div v-if="filteredTables.length" class="adb-grid">
        <div
          v-for="num in filteredTables"
          :key="num"
          class="adb-table-card"
          :class="{ 'occupied-card': isOccupied(num) }"
          @click="openDetail(num)"
        >
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

      <!-- Cột trái: tổng hóa đơn -->
      <div class="adb-invoice-panel">
        <div class="adb-invoice-panel-title">TỔNG HÓA ĐƠN</div>
        <div class="adb-invoice-list">
          <div v-if="!activeInvoices.length" class="adb-invoice-empty">
            Chưa có hóa đơn nào đang sử dụng bàn
          </div>
          <div
            v-for="invoice in activeInvoices"
            :key="invoice.id"
            class="adb-invoice-item"
            @click="openDetailForInvoice(invoice)"
          >
            <div class="adb-invoice-num">Hóa đơn {{ invoice.orderNumber }}</div>
            <div class="adb-invoice-tables">
              <span
                v-for="t in invoice.selectedTables"
                :key="t"
                class="adb-invoice-table-badge"
              >Bàn {{ String(t).padStart(2, '0') }}</span>
            </div>
            <div class="adb-invoice-customer">
              {{ getCustomerDisplay(invoice) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Cột phải: bàn đang dùng -->
      <div class="adb-occupied-grid-wrap">
        <template v-if="countOccupied() > 0">
          <div class="adb-grid adb-grid--occupied">
            <template v-for="num in TOTAL_TABLES" :key="num">
              <div
                v-if="isOccupied(num)"
                class="adb-table-card occupied-card"
                @click="openDetail(num)"
              >
                <span class="adb-table-num">{{ getTableLabel(num) }}</span>
                <span class="adb-occupied-badge">Đang sử dụng</span>
                <span class="adb-card-dot"></span>
              </div>
            </template>
          </div>
        </template>
        <div v-else class="adb-empty-filter">
          <span class="adb-empty-icon">✅</span>
          <span>Không có bàn nào đang sử dụng</span>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL CHI TIẾT ═══ -->
    <div v-if="showDetail" class="adb-overlay" @click.self="closeDetail">
      <div class="adb-modal">

        <!-- Topbar -->
        <div class="adb-modal-topbar">
          <span class="adb-modal-table-id">{{ getModalTableLabel() }}</span>
          <span
            class="adb-modal-status"
            :class="isTableOccupiedInModal() ? 'occupied' : 'available'"
          >
            {{ isTableOccupiedInModal() ? 'Đang Sử Dụng' : 'Sẵn Bàn' }}
          </span>
          <button class="adb-modal-close" @click="closeDetail">✕</button>
        </div>

        <div class="adb-modal-body">

          <!-- Cột trái: chi tiết -->
          <div class="adb-modal-left">
            <div class="adb-detail-logo-wrap">
              <img :src="logoDrip" alt="DripLab" class="adb-logo-img"
                   @error="$event.target.style.display='none'" />
              <p class="adb-detail-title">Chi Tiết Đặt Bàn</p>
            </div>

            <!-- Badge nhiều bàn -->
            <div
              v-if="selectedOrder?.selectedTables?.length > 1"
              class="adb-section adb-tables-section"
            >
              <p class="adb-section-title">Bàn Đang Dùng</p>
              <div class="adb-tables-badges">
                <span
                  v-for="t in selectedOrder.selectedTables"
                  :key="t"
                  class="adb-table-badge-large"
                >Bàn {{ String(t).padStart(2, '0') }}</span>
              </div>
            </div>

            <!-- Thông tin khách -->
            <div class="adb-section">
              <p class="adb-section-title">Thông Tin Khách Hàng</p>
              <div class="adb-info-row">
                <span class="adb-info-lbl">Họ và tên</span>
                <span class="adb-info-val">{{ getCustomerDisplay(selectedOrder) }}</span>
              </div>
              <div class="adb-info-row">
                <span class="adb-info-lbl">Số điện thoại</span>
                <span class="adb-info-val">{{ selectedOrder?.customerPhone || '—' }}</span>
              </div>
              <div class="adb-info-row">
                <span class="adb-info-lbl">Hình thức thanh toán</span>
                <span class="adb-info-val">{{ selectedOrder?.paymentMethod || '—' }}</span>
              </div>
              <div class="adb-info-row">
                <span class="adb-info-lbl">Thời gian đặt</span>
                <span class="adb-info-val">{{ selectedOrder?.orderTime || '—' }}</span>
              </div>
            </div>

            <!-- Sản phẩm -->
            <div class="adb-section">
              <p class="adb-section-title">Thông Tin Sản Phẩm</p>
              <p v-if="!selectedOrder?.items?.length" class="adb-empty">Chưa có sản phẩm</p>
              <div
                v-for="item in selectedOrder?.items"
                :key="item.id"
                class="adb-product-item"
              >
                <div class="adb-product-img-wrap">
                  <img
                    v-if="getProductImg(item)"
                    :src="getProductImg(item)"
                    :alt="item.name"
                    class="adb-product-img"
                    @error="$event.target.style.display='none'"
                  />
                  <span v-else>☕</span>
                </div>
                <div class="adb-product-info">
                  <p class="adb-product-name">{{ item.name }} × {{ item.qty }}</p>
                  <div class="adb-product-tags">
                    <span class="adb-tag size">Size: {{ item.size }}</span>
                    <span class="adb-tag">Đá: {{ item.ice }}</span>
                    <span class="adb-tag">Đường: {{ item.sugar }}</span>
                    <template v-if="item.toppingDetails?.length">
                      <span
                        v-for="tp in item.toppingDetails"
                        :key="tp.name"
                        class="adb-tag topping"
                      >{{ tp.name }}</span>
                    </template>
                    <span
                      v-else-if="item.toppings && item.toppings !== 'Không có'"
                      class="adb-tag topping"
                    >{{ item.toppings }}</span>
                  </div>
                  <p class="adb-product-price">
                    {{ ((item.unitPrice ?? item.price ?? 0) * item.qty).toLocaleString() }}đ
                  </p>
                </div>
              </div>
            </div>

            <!-- Ghi chú -->
            <div class="adb-section">
              <p class="adb-section-title" style="margin-bottom:4px">Ghi Chú</p>
              <p class="adb-note-text">{{ selectedOrder?.note || 'Không có ghi chú' }}</p>
            </div>
          </div>

          <!-- Cột phải: thanh toán -->
          <div class="adb-modal-right">
            <p class="adb-right-title">Thanh Toán</p>

            <template v-if="isTableOccupiedInModal() && selectedOrder?.items?.length">
              <div class="adb-price-row">
                <span>Tạm tính</span>
                <span>{{ totalPrice.toLocaleString() }} đ</span>
              </div>
              <div class="adb-price-row">
                <span>Giảm giá</span>
                <span class="discount">- 0 đ</span>
              </div>
              <div class="adb-divider"></div>
              <div class="adb-total-row">
                <span class="adb-total-lbl">Tổng cộng</span>
                <span class="adb-total-val">{{ totalPrice.toLocaleString() }} đ</span>
              </div>

              <button class="adb-btn-done" @click="showConfirmDone = true">
                Trả hàng
              </button>
              <button class="adb-btn-add-product" @click="addProduct">
                + Thêm sản phẩm
              </button>
            </template>

            <template v-else>
              <div class="adb-empty-right">
                <span class="adb-empty-icon">🪑</span>
                <span>Bàn đang trống<br />Chưa có đơn hàng</span>
              </div>
            </template>
          </div>

        </div>
      </div>
    </div>

    <!-- ═══ CONFIRM POPUP ═══ -->
    <div v-if="showConfirmDone" class="adb-confirm-overlay">
      <div class="adb-confirm-popup">
        <p class="adb-confirm-title">Xác nhận trả hàng?</p>
        <p class="adb-confirm-sub">Bàn sẽ được giải phóng và đơn hàng kết thúc.</p>
        <div class="adb-confirm-btns">
          <button class="adb-confirm-back" @click="showConfirmDone = false">Quay lại</button>
          <button class="adb-confirm-ok" @click="confirmDone">✓ Xác nhận</button>
        </div>
      </div>
    </div>

  </div>
</template>