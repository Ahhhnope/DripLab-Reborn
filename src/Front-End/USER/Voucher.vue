<template>
  <div class="voucher-page">

    <!-- PHẦN TRÊN: Điểm danh + Sidebar -->
    <div class="top-section">

      <!-- Điểm danh hàng ngày -->
      <div class="daily-login-box">
        <h2 class="daily-title">Đăng Nhập Mỗi Ngày Nhận Xu</h2>
        <p class="daily-subtitle">Mỗi ngày đăng nhập nhận 100 xu, đăng nhập Ngày 7 nhận 500 xu.</p>

        <div class="daily-content">
          <div class="days-6-grid">
            <div
              v-for="day in [1, 2, 3, 4, 5, 6]" :key="day"
              class="day-card"
              :class="{ 'day-locked': !isDayUnlocked(day), 'day-claimed': claimedDays.includes(day) }"
            >
              <div class="day-label">Ngày {{ day }}</div>
              <div class="coin-wrap">
                <img :src="coinImg" class="coin-img" :class="{ 'coin-dim': !isDayUnlocked(day) }" />
                <span v-if="!isDayUnlocked(day)" class="lock-icon">🔒</span>
              </div>
              <button
                class="day-btn"
                :class="{ claimed: claimedDays.includes(day), locked: !isDayUnlocked(day) }"
                @click="claimDay(day)"
                :disabled="claimedDays.includes(day) || !isDayUnlocked(day)"
              >
                {{ claimedDays.includes(day) ? 'Đã Nhận' : isDayUnlocked(day) ? 'Nhận' : 'Chưa Tới' }}
              </button>
            </div>
          </div>

          <!-- Ngày 7 -->
          <div
            class="day-card day-card-7"
            :class="{ 'day-locked': !isDayUnlocked(7), 'day-claimed': claimedDays.includes(7) }"
          >
            <div class="day-label">Ngày 7</div>
            <div class="coin-wrap">
              <img :src="coinImg" class="coin-img-big" :class="{ 'coin-dim': !isDayUnlocked(7) }" />
              <span v-if="!isDayUnlocked(7)" class="lock-icon lock-icon-big">🔒</span>
            </div>
            <div class="day-7-reward">500 xu</div>
            <button
              class="day-btn"
              :class="{ claimed: claimedDays.includes(7), locked: !isDayUnlocked(7) }"
              @click="claimDay(7)"
              :disabled="claimedDays.includes(7) || !isDayUnlocked(7)"
            >
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
            <div class="right-count">{{ promos.length }}</div>
          </div>
          <div class="right-order-box">
            <div class="order-badge-label">ƯU ĐÃI THEO ĐƠN HÀNG</div>
            <h3 class="order-title">Theo dõi điều kiện áp dụng trước khi sang checkout.</h3>
            <p class="order-desc">
              Mỗi voucher hiển thị mức giảm và đơn tối thiểu để bạn biết ngay
              mã nào còn dùng được với giỏ hàng hiện tại.
            </p>
          </div>
        </div>
      </div>

    </div>

    <!-- KHO VOUCHER -->
    <div class="voucher-grid">
      <div class="voucher-card" v-for="v in promos" :key="v.id">

        <div class="vc-left">
          <div class="vc-discount">{{ fmtValue(v) }}</div>
          <div class="vc-type">{{ v.category === 'PHẦN TRĂM' ? 'Giảm %' : 'Giảm tiền' }}</div>
        </div>

        <div class="vc-divider"></div>

        <div class="vc-right">
          <span class="voucher-status-badge">HIỆN TẠI</span>
          <div class="vc-code">{{ v.code }}</div>
          <div class="vc-name">{{ v.name }}</div>
          <div class="vc-meta">
            <span v-if="v.minOrderValue > 0">
              🛒 Đơn từ {{ (+v.minOrderValue).toLocaleString('vi-VN') }}đ
            </span>
            <span v-else>🛒 Không giới hạn đơn</span>
            <span>📅 HSD: {{ v.endDate?.split('T')[0] }}</span>
            <span>🏷 Còn: {{ v.quantity }} mã</span>
          </div>

          <button v-if="!isSaved(v.id)" class="btn-save" @click="savePromo(v.id)">
            Lưu mã
          </button>
          <button v-else class="btn-saved" disabled>
            ✓ Đã lưu
          </button>
        </div>

      </div>

      <p v-if="promos.length === 0" class="empty-msg">
        Hiện không có voucher nào đang mở 😢
      </p>
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
        <div class="toast-icon-wrap">
          <span class="toast-checkmark">✓</span>
        </div>
        <span class="toast-text">{{ toast.message }}</span>
      </div>
    </transition>

  </div>
</template>

<script setup>
import coinImg from '../IMG/logoIconVoucher.png'
import { useVoucher }     from '../JS-USER/Voucher.JS'
import { useUserVoucher } from '../JS-USER/UserVoucher.JS'

const { claimedDays, isDayUnlocked, claimDay, modal, copyCode } = useVoucher()
const { promos, isSaved, savePromo, fmtValue, toast }           = useUserVoucher()
</script>
<style src="../CSS-USER/Voucher.css"></style>