<script setup>
import { useAdminDatBan } from '../JS/AdminDatBan.JS'

const logoDrip = new URL('../IMG/DripLab_Logo.png', import.meta.url).href

const {
    TOTAL_TABLES,
    showDetail,
    selectedTable,
    selectedOrder,
    showConfirmDone,
    isOccupied,
    getTableLabel,
    openDetail,
    closeDetail,
    confirmDone,
    totalPrice,
} = useAdminDatBan()

function getProductImg(item) {
    if (item.imageUrl) return item.imageUrl
    const map = {
        'Bạc Xỉu':    new URL('../IMG/coffee_latte.jpg', import.meta.url).href,
        'Cà Phê Muối': new URL('../IMG/Matcha_tea.jpg',  import.meta.url).href,
        'Cold Brew':   new URL('../IMG/Cold brew.jpg',   import.meta.url).href,
    }
    return map[item.name] ?? ''
}
</script>

<style src="../CSS/AdminDatBan.CSS"></style>

<template>
  <div class="admin-datban-root">

    <!-- HEADER -->
    <div class="adb-header">QUẢN LÝ ĐẶT BÀN</div>

    <!-- LƯỚI BÀN -->
    <div class="adb-grid-wrap">
      <div class="adb-grid">
        <div
          v-for="num in TOTAL_TABLES"
          :key="num"
          class="adb-table-card"
          :class="{ 'occupied-card': isOccupied(num) }"
          @click="openDetail(num)"
        >
          <span class="adb-table-num">{{ getTableLabel(num) }}</span>
        </div>
      </div>
    </div>

    <!-- MODAL CHI TIẾT -->
    <div v-if="showDetail" class="adb-overlay" @click.self="closeDetail">
      <div class="adb-modal">

        <div class="adb-modal-topbar">
          <span class="adb-modal-table-id">{{ getTableLabel(selectedTable) }}</span>
          <span
            class="adb-modal-status"
            :class="isOccupied(selectedTable) ? 'occupied' : 'available'"
          >
            {{ isOccupied(selectedTable) ? 'Đang Sử Dụng' : 'Sẵn Bàn' }}
          </span>
          <button class="adb-modal-close" @click="closeDetail">✕</button>
        </div>

        <div class="adb-modal-body">

          <!-- Cột trái — scroll nội bộ -->
          <div class="adb-modal-left">
            <div class="adb-detail-logo-wrap">
              <img :src="logoDrip" alt="DripLab" class="adb-logo-img"
                   @error="$event.target.style.display='none'" />
              <p class="adb-detail-title">Chi Tiết Đặt Bàn</p>
            </div>

            <div class="adb-section">
              <p class="adb-section-title">Thông Tin Khách Hàng</p>
              <div class="adb-info-row">
                <span class="adb-info-lbl">Họ và tên</span>
                <span class="adb-info-val">{{ selectedOrder?.customerName || '—' }}</span>
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

            <div class="adb-section">
              <p class="adb-section-title">Thông Tin Sản Phẩm</p>
              <p v-if="!selectedOrder?.items?.length" class="adb-empty">Chưa có sản phẩm</p>
              <div v-for="item in selectedOrder?.items" :key="item.id" class="adb-product-item">
                <div class="adb-product-img-wrap">
                  <img v-if="getProductImg(item)" :src="getProductImg(item)" :alt="item.name"
                       class="adb-product-img" @error="$event.target.style.display='none'" />
                  <span v-else>☕</span>
                </div>
                <div class="adb-product-info">
                  <p class="adb-product-name">{{ item.name }} × {{ item.qty }}</p>
                  <div class="adb-product-tags">
                    <span class="adb-tag size">Size: {{ item.size }}</span>
                    <span class="adb-tag">Đá: {{ item.ice }}</span>
                    <span class="adb-tag">Đường: {{ item.sugar }}</span>
                    <span v-if="item.toppings && item.toppings !== 'Không có'" class="adb-tag topping">
                      {{ item.toppings }}
                    </span>
                  </div>
                  <p class="adb-product-price">{{ (item.price * item.qty).toLocaleString() }}đ</p>
                </div>
              </div>
            </div>

            <div class="adb-section">
              <p class="adb-section-title" style="margin-bottom:4px">Ghi Chú</p>
              <p class="adb-note-text">Không có ghi chú</p>
            </div>
          </div>

          <!-- Cột phải — cố định -->
          <div class="adb-modal-right">
            <p class="adb-right-title">Thanh Toán</p>

            <template v-if="isOccupied(selectedTable) && selectedOrder?.items?.length">
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
              <button class="adb-btn-done" @click="showConfirmDone = true">Xác nhận hoàn thành</button>
              <button class="adb-btn-cancel" @click="closeDetail">Huỷ đơn</button>
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

    <!-- CONFIRM POPUP -->
    <div v-if="showConfirmDone" class="adb-confirm-overlay">
      <div class="adb-confirm-popup">
        <p class="adb-confirm-title">Xác nhận hoàn thành?</p>
        <p class="adb-confirm-sub">Bàn sẽ được giải phóng và đơn hàng kết thúc.</p>
        <div class="adb-confirm-btns">
          <button class="adb-confirm-back" @click="showConfirmDone = false">Quay lại</button>
          <button class="adb-confirm-ok" @click="confirmDone">✓ Xác nhận</button>
        </div>
      </div>
    </div>

  </div>
</template>