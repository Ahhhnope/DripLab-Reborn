<template>
  <div class="voucher-page">
    <div class="top-section">

      <div class="daily-login-box">
        <h2 class="daily-title">Đăng Nhập Mỗi Ngày Nhận Xu</h2>
        <p class="daily-subtitle">Mỗi ngày đăng nhập nhận 100 xu, đăng nhập Ngày 7 nhận 500 xu.</p>

        <div class="daily-content">
          <!-- Ngày 1-6 -->
          <div class="days-6-grid">
            <div v-for="day in [1, 2, 3, 4, 5, 6]" :key="day" class="day-card"
              :class="{ 'day-locked': !isDayUnlocked(day), 'day-claimed': claimedDays.includes(day) }">
              <div class="day-label">Ngày {{ day }}</div>
              <div class="coin-wrap">
                <img :src="coinImg" class="coin-img" :class="{ 'coin-dim': !isDayUnlocked(day) }" />
                <span v-if="!isDayUnlocked(day)" class="lock-icon">🔒</span>
              </div>
              <button class="day-btn" :class="{ claimed: claimedDays.includes(day), locked: !isDayUnlocked(day) }"
                @click="claimDay(day)" :disabled="claimedDays.includes(day) || !isDayUnlocked(day)">
                {{ claimedDays.includes(day) ? 'Đã Nhận' : isDayUnlocked(day) ? 'Nhận' : 'Chưa Tới' }}
              </button>
            </div>
          </div>

          <!-- Ngày 7 -->
          <div class="day-card day-card-7"
            :class="{ 'day-locked': !isDayUnlocked(7), 'day-claimed': claimedDays.includes(7) }">
            <div class="day-label">Ngày 7</div>
            <div class="coin-wrap">
              <img :src="coinImg" class="coin-img-big" :class="{ 'coin-dim': !isDayUnlocked(7) }" />
              <span v-if="!isDayUnlocked(7)" class="lock-icon lock-icon-big">🔒</span>
            </div>
            <div class="day-7-reward">500 xu</div>
            <button class="day-btn" :class="{ claimed: claimedDays.includes(7), locked: !isDayUnlocked(7) }"
              @click="claimDay(7)" :disabled="claimedDays.includes(7) || !isDayUnlocked(7)">
              {{ claimedDays.includes(7) ? 'Đã Nhận' : isDayUnlocked(7) ? 'Nhận' : 'Chưa Tới' }}
            </button>
          </div>
        </div>


      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <div class="sidebar-card">
          <div class="right-box">
            <div class="right-label">MÃ HIỆN TẠI CÒN SỬ DỤNG</div>
            <div class="right-count">{{ activeCount }}</div>
          </div>
          <div class="right-order-box">
            <div class="order-badge-label">ƯU ĐÃI THEO ĐƠN HÀNG</div>
            <h3 class="order-title">Theo dõi điều kiện áp dụng trước khi sang checkout.</h3>
            <p class="order-desc">Mỗi voucher hiển thị mức giảm và đơn tối thiểu để bạn biết ngay mã nào còn dùng được
              với giỏ hàng hiện tại.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- VOUCHER LIST -->
    <div class="voucher-list">
      <template v-if="displayedVouchers.length > 0">
        <div v-for="v in displayedVouchers" :key="v.id" class="voucher-card">
          <div class="voucher-logo-wrap">
            <img :src="logoImg" class="voucher-logo" />
          </div>
          <div class="voucher-info">
            <span class="voucher-status-badge">HIỆN TẠI</span>
            <div class="voucher-discount">{{ v.discount }}, giảm tối đa {{ v.maxDiscount }}</div>
            <div class="voucher-min">Đơn tối thiểu: {{ v.minOrder }}</div>
            <button class="use-btn" :class="{ success: usedIds.includes(v.id) }" @click="applyVoucher(v)">
              {{ usedIds.includes(v.id) ? 'Thành Công' : 'Dùng Ngay' }}
            </button>
          </div>
        </div>
      </template>
      <div v-else class="voucher-empty">
        <div class="voucher-empty-icon">🎟️</div>
        <p>Không có mã voucher nào khả dụng.</p>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="modal.show" class="modal-overlay" @click.self="modal.show = false">
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-title">NHẬN KHUYẾN MÃI THÀNH CÔNG</div>
          <div class="modal-date">Hiệu lực: {{ modal.date }}</div>
        </div>
        <div class="modal-body">
          <div class="modal-code-wrap">
            <div class="modal-code">{{ modal.code }}</div>
            <div class="modal-code-hint">Nhấn nút bên dưới để sao chép mã</div>
          </div>
          <button class="modal-copy-btn" @click="copyCode">Sao Chép Mã</button>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <transition name="toast-slide">
      <div v-if="toast.show" class="toast">
        <div class="toast-icon-wrap"><span class="toast-checkmark">✓</span></div>
        <span class="toast-text">{{ toast.msg }}</span>
      </div>
    </transition>

  </div>
</template>

<script setup>
import coinImg from '../IMG/logoIconVoucher.png'
import logoImg from '../IMG/DripLab_Logo.png'
import { useVoucher } from '../JS-USER/Voucher.JS'

const {
  claimedDays, isDayUnlocked, claimDay, resetLogin,
  displayedVouchers, activeCount, usedIds, applyVoucher,
  modal, copyCode,
  toast,
} = useVoucher()
</script>
<style scoped>
@import "../CSS-USER/Voucher.CSS";
</style>