<template>
  <div class="voucher-page">
    <div class="top-section">
      <div class="daily-login-box">
        <h2 class="daily-title">Đăng Nhập Mỗi Ngày Nhận Điểm</h2>
        <p class="daily-subtitle">Mỗi ngày đăng nhập nhận 100 điểm, đăng nhập Ngày 7 nhận 500 điểm.</p>

        <div class="daily-content">
          <!-- Ngày 1–6 -->
          <div class="days-grid">
            <div
              v-for="day in [1,2,3,4,5,6]"
              :key="day"
              class="day-card"
              :class="{ 'day-locked': !isDayUnlocked(day), 'day-claimed': claimedDays.includes(day) }"
            >
              <div class="day-label">Ngày {{ day }}</div>
              <div class="coin-wrap">
                <img :src="coinImg" class="coin-img" :class="{ 'coin-dim': !isDayUnlocked(day) }" />
                <span v-if="!isDayUnlocked(day)" class="lock-icon">🔒</span>
              </div>
              <div class="point-label">100 điểm</div>
              <button
                class="day-btn"
                :class="{ claimed: claimedDays.includes(day), locked: !isDayUnlocked(day) }"
                @click="handleClaimDay(day)"
                :disabled="claimedDays.includes(day) || !isDayUnlocked(day)"
              >
                {{ claimedDays.includes(day) ? 'Đã Nhận' : isDayUnlocked(day) ? 'Nhận' : 'Chưa Tới' }}
              </button>
            </div>
          </div>

          <!-- Ngày 7 — kéo dài full chiều cao -->
          <div
            class="day-card day-card-7"
            :class="{ 'day-locked': !isDayUnlocked(7), 'day-claimed': claimedDays.includes(7) }"
          >
            <div class="day-label">Ngày 7</div>
            <div class="coin-wrap">
              <img :src="coinImg" class="coin-img-big" :class="{ 'coin-dim': !isDayUnlocked(7) }" />
              <span v-if="!isDayUnlocked(7)" class="lock-icon lock-icon-big">🔒</span>
            </div>
            <div class="day-7-reward">500 Điểm</div>
            <button
              class="day-btn"
              :class="{ claimed: claimedDays.includes(7), locked: !isDayUnlocked(7) }"
              @click="handleClaimDay(7)"
              :disabled="claimedDays.includes(7) || !isDayUnlocked(7)"
            >
              {{ claimedDays.includes(7) ? 'Đã Nhận' : isDayUnlocked(7) ? 'Nhận' : 'Chưa Tới' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL YÊU CẦU ĐĂNG NHẬP -->
    <Teleport to="body">
      <div v-if="authModal.show" class="modal-overlay" @click.self="authModal.show = false">
        <div class="auth-modal-box">
          <div class="auth-modal-logo-wrap">
            <img :src="dripLabLogo" class="auth-modal-logo" alt="DripLab Logo" />
          </div>
          <div class="auth-modal-title">Chưa đăng nhập</div>
          <div class="auth-modal-desc">Vui lòng đăng nhập để {{ authModal.action }}.</div>
          <button class="auth-modal-btn" @click="goToLogin">Đăng Nhập</button>
        </div>
      </div>
    </Teleport>

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
import { useRouter } from 'vue-router'
import coinImg from '../IMG/logoIconVoucher.png'
import dripLabLogo from '../IMG/DripLab_Logo.png'
import { useVoucher } from '../JS-USER/Voucher.JS'
import { useAuthStore } from '../Authorization/Auth'

const router = useRouter()
const { claimedDays, isDayUnlocked, claimDay, authModal, toast } = useVoucher()

function handleClaimDay(day) {
  const auth = useAuthStore()
  if (!auth.user) {
    authModal.value = { show: true, action: 'nhận điểm hàng ngày' }
    return
  }
  claimDay(day, auth.user)
}

function goToLogin() {
  authModal.value.show = false
  router.push('/login')
}
</script>
<style scoped src="../CSS-USER/Voucher.CSS"></style>