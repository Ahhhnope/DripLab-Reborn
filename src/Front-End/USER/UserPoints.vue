<template>
  <div class="account-wrapper">
    <ToastNotification
      :visible="toastVisible"
      :message="toastMessage"
      :type="toastType"
    />

    <div class="account-inner">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-profile">
          <div class="avatar-ring">
            <img :src="user.avatar" alt="Avatar" class="avatar-img" />
          </div>
          <h2 class="sidebar-name">{{ user.name }}</h2>
          <p class="sidebar-role">Thành viên cao cấp</p>
        </div>

        <nav class="sidebar-nav">
          <a
            v-for="item in navItems"
            :key="item.id"
            :class="['nav-item', { active: currentRoute === item.route }]"
            @click="goTo(item.route)"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>

          <div class="nav-divider"></div>

          <a class="nav-item logout" @click="logout">
            <span class="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="account-main">

        <!-- ── Điểm tích lũy ── -->
        <section class="card">
          <div class="card-title-row">
            <div class="card-title-icon">
              <span class="material-symbols-outlined">loyalty</span>
            </div>
            <h3 class="card-title">Điểm tích lũy của tôi</h3>
          </div>

          <div class="point-summary">
            <div class="metric-card">
              <p class="metric-label">Điểm hiện có</p>
              <p class="metric-value">
                {{ myPoints.toLocaleString('vi-VN') }}
                <span class="metric-unit">điểm</span>
              </p>
            </div>
            <div class="metric-card">
              <p class="metric-label">Đã sử dụng</p>
              <p class="metric-value">
                {{ usedPoints.toLocaleString('vi-VN') }}
                <span class="metric-unit">điểm</span>
              </p>
            </div>
            <div class="metric-card tier-card">
              <p class="metric-label">Hạng thành viên</p>
              <p class="metric-value tier-value">
                <span class="material-symbols-outlined tier-icon">workspace_premium</span>
                {{ currentTier }}
              </p>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="progress-wrap">
            <div class="progress-label">
              <span>Tiến độ đến hạng <strong>{{ nextTier }}</strong></span>
              <span>{{ myPoints.toLocaleString('vi-VN') }} / {{ nextTierPoints.toLocaleString('vi-VN') }} điểm</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <p class="progress-hint">
              Cần thêm
              <strong>{{ (nextTierPoints - myPoints).toLocaleString('vi-VN') }} điểm</strong>
              để lên hạng {{ nextTier }}
            </p>
          </div>
        </section>

        <!-- ── Kho khuyến mãi ── -->
        <section class="card">
          <div class="card-title-row">
            <div class="card-title-icon">
              <span class="material-symbols-outlined">redeem</span>
            </div>
            <h3 class="card-title">Kho khuyến mãi — Đổi điểm lấy voucher</h3>
          </div>

          <p class="section-sub">
            Bạn đang có
            <strong>{{ myPoints.toLocaleString('vi-VN') }} điểm</strong>
            — chọn voucher để đổi ngay
          </p>

          <div class="voucher-grid">
            <div
              v-for="v in vouchers"
              :key="v.id"
              :class="['voucher-card', { 'voucher-disabled': !canRedeem(v.cost) }]"
            >
              <span :class="['voucher-tag', `tag-${v.color}`]">{{ v.tag }}</span>
              <p class="voucher-name">{{ v.name }}</p>
              <p class="voucher-desc">{{ v.desc }}</p>
              <div class="voucher-footer">
                <div class="voucher-cost">
                  <span class="material-symbols-outlined cost-icon">toll</span>
                  <strong>{{ v.cost.toLocaleString('vi-VN') }}</strong> điểm
                </div>
                <button
                  class="btn-doi"
                  :disabled="!canRedeem(v.cost)"
                  @click="redeem(v)"
                >
                  {{ canRedeem(v.cost) ? 'Đổi' : 'Thiếu điểm' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ── Lịch sử điểm ── -->
        <section class="card">
          <div class="card-title-row">
            <div class="card-title-icon">
              <span class="material-symbols-outlined">history</span>
            </div>
            <h3 class="card-title">Lịch sử điểm</h3>
          </div>

          <div class="history-list">
            <div
              v-for="(h, i) in pointHistory"
              :key="i"
              class="history-row"
            >
              <div class="history-left">
                <div :class="['history-dot', h.type === 'earn' ? 'dot-earn' : 'dot-use']"></div>
                <div>
                  <p class="history-desc">{{ h.desc }}</p>
                  <p class="history-date">{{ h.date }}</p>
                </div>
              </div>
              <span :class="['history-pts', h.type === 'earn' ? 'pts-earn' : 'pts-use']">
                {{ h.type === 'earn' ? '+' : '−' }}{{ h.pts.toLocaleString('vi-VN') }}
              </span>
            </div>

            <p v-if="pointHistory.length === 0" class="empty-hint">
              Chưa có lịch sử điểm nào.
            </p>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<script setup>
import { useUserPoints } from '../JS-USER/UserPoints.JS'

const {
  user, navItems, currentRoute,
  myPoints, usedPoints, nextTierPoints,
  currentTier, nextTier, progress,
  vouchers, canRedeem, redeem,
  pointHistory,
  toastVisible, toastMessage, toastType,
  goTo, logout,
} = useUserPoints()
</script>

<style scoped src="../CSS-USER/UserPoints.CSS"></style>