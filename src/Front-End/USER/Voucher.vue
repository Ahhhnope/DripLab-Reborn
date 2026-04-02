<template>
  <div class="voucher-page">

    <!-- ===== HERO SECTION ===== -->
    <div class="voucher-hero">

      <!-- LEFT: Title + Stats -->
      <div class="voucher-hero-left">
        <div>
          <span class="voucher-section-label">TRUNG TÂM ƯU ĐÃI</span>
          <h1 class="voucher-hero-title">TẤT CẢ MÃ GIẢM GIÁ<br />CỦA BẠN TRONG MỘT NƠI.</h1>
          <p class="voucher-hero-desc">
            Kiểm tra mã còn dùng được, mã đã dùng và hạn áp dụng để<br />chốt đơn nhanh hơn.
          </p>
        </div>

        <div class="voucher-stats">
          <div class="stat-card">
            <div class="stat-label">Mã Hiện Tại Còn Sử Dụng</div>
            <div class="stat-value">{{ activeCount }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">TỔNG SỐ MÃ</div>
            <div class="stat-value">{{ totalCount }}</div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Order voucher card -->
      <div class="voucher-hero-right">
        <div class="ticket-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
            <path d="M13 5v2M13 17v2M13 11v2"/>
          </svg>
        </div>
        <div>
          <div class="order-badge">ƯU ĐÃI THEO ĐƠN HÀNG</div>
          <h2 class="order-title">Theo dõi điều kiện áp dụng<br />trước khi sang checkout.</h2>
          <p class="order-desc">
            Mỗi voucher hiển thị mức giảm và đơn tối thiểu để bạn<br />
            biết ngay mã nào còn dùng được với giỏ hàng hiện tại.
          </p>
        </div>
      </div>

    </div>

    <!-- ===== TABS ===== -->
    <div class="voucher-tabs">
      <button
        class="tab-btn"
        :class="activeTab === 'available' ? 'active' : 'inactive'"
        @click="setTab('available')"
      >
        Đang khả dụng
      </button>
      <button
        class="tab-btn"
        :class="activeTab === 'used' ? 'active' : 'inactive'"
        @click="setTab('used')"
      >
        Đã dùng và hết hạn
      </button>
    </div>

    <!-- ===== VOUCHER GRID ===== -->
    <div class="voucher-grid">
      <template v-if="displayedVouchers.length > 0">
        <div
          v-for="voucher in displayedVouchers"
          :key="voucher.id"
          class="voucher-card"
          :class="{ 'is-used': voucher.status !== 'active' }"
        >
          <!-- LEFT: Code -->
          <div class="voucher-card-left">
            <div class="voucher-code-label">MÃ ƯU ĐÃI</div>
            <div class="voucher-code">{{ voucher.code }}</div>
          </div>

          <!-- RIGHT: Info -->
          <div class="voucher-card-right">
            <div class="voucher-top-row">
              <div class="voucher-discount">{{ voucher.discount }}</div>
              <span
                class="voucher-status-badge"
                :class="voucher.status"
              >
                {{
                  voucher.status === 'active'
                    ? 'Hiện Tại '
                    : voucher.status === 'used'
                    ? 'ĐÃ DÙNG'
                    : 'HẾT HẠN'
                }}
              </span>
            </div>
            <div class="voucher-meta">
              Hạn dùng đến {{ voucher.expiry }}.<br />
              Đơn tối thiểu {{ voucher.minOrder }}.
            </div>
            <button
              v-if="voucher.status === 'active'"
              class="copy-btn"
              :class="{ copied: copiedCode === voucher.id }"
              @click="copyCode(voucher)"
              :disabled="copiedCode === voucher.id"
            >
              {{ copiedCode === voucher.id ? '✓ Đã sao chép!' : 'Sao chép mã' }}
            </button>
          </div>
        </div>
      </template>

      <div v-else class="voucher-empty">
        <div class="voucher-empty-icon">🎟️</div>
        <p>Không có mã voucher nào ở đây.</p>
      </div>
    </div>

    <!-- ===== TOAST ===== -->
    <div class="toast" :class="{ show: showToast }">
      <span class="toast-icon">✓</span>
      {{ toastMessage }}
    </div>

  </div>
</template>

<script setup>
import { useVoucher } from '../JS-USER/Voucher.JS'

const {
  activeTab,
  displayedVouchers,
  totalCount,
  activeCount,
  usedCount,
  copiedCode,
  showToast,
  toastMessage,
  setTab,
  copyCode,
} = useVoucher()
</script>

<style src="../CSS-USER/Voucher.CSS"></style>