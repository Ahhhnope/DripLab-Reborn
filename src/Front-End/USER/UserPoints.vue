<template>
  <div class="account-wrapper">
    <ToastNotification
      :visible="toastVisible"
      :message="toastMessage"
      :type="toastType"
    />

    <div class="account-inner">

      <!-- ══════════ SIDEBAR ══════════ -->
      <aside class="sidebar">
        <div class="sidebar-profile">
          <div class="avatar-ring">
            <img :src="user.avatar" alt="Avatar" class="avatar-img" />
          </div>
          <h2 class="sidebar-name">{{ user.fullName }}</h2>
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

      <!-- ══════════ MAIN ══════════ -->
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

          <!-- Progress -->
          <div class="progress-wrap">
            <div class="progress-label">
              <span>Tiến độ đến hạng <strong>{{ nextTier }}</strong></span>
              <span>
                {{ myPoints.toLocaleString('vi-VN') }} /
                {{ nextTierPoints.toLocaleString('vi-VN') }} điểm
              </span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <p class="progress-hint">
              Cần thêm
              <strong>
                {{ (nextTierPoints - myPoints).toLocaleString('vi-VN') }} điểm
              </strong>
              để lên hạng {{ nextTier }}
            </p>
          </div>
        </section>

        <!-- ── Kho khuyến mãi đổi thưởng ── -->
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

          <!-- Empty state -->
          <p v-if="vouchers.length === 0" class="empty-hint">
            Hiện chưa có voucher nào để đổi 😢
          </p>

          <!-- Voucher grid -->
          <div class="voucher-grid" v-else>
            <div
              v-for="v in vouchers"
              :key="v.id"
              :class="[
                'voucher-card',
                { 'voucher-disabled': !canRedeem(v) || isAlreadySaved(v.id) }
              ]"
            >
              <!-- Tag loại -->
              <span :class="['voucher-tag', tagColor(v)]">
                {{ v.category === 'PHẦN TRĂM' ? 'Giảm %' : 'Giảm tiền' }}
              </span>

              <!-- Badge số lượng còn lại -->
              <span class="voucher-remain">Còn {{ v.quantity }} mã</span>

              <!-- Tên -->
              <p class="voucher-name">{{ v.name }}</p>

              <!-- Mô tả -->
              <p class="voucher-desc">
                Mã: <strong>{{ v.code }}</strong>
                <template v-if="v.minOrderValue > 0">
                  &nbsp;·&nbsp;Đơn từ {{ (+v.minOrderValue).toLocaleString('vi-VN') }}đ
                </template>
                &nbsp;·&nbsp;HSD: {{ v.endDate?.split('T')[0] }}
              </p>

              <div class="voucher-footer">
                <!-- Giá trị giảm -->
                <div class="voucher-cost">
                  <span class="material-symbols-outlined cost-icon">sell</span>
                  <strong>{{ fmtValue(v) }}</strong>
                </div>

                <!-- Nút đổi -->
                <button
                  class="btn-doi"
                  :disabled="!canRedeem(v) || isAlreadySaved(v.id)"
                  @click="redeem(v)"
                >
                  <template v-if="isAlreadySaved(v.id)">✓ Đã đổi</template>
                  <template v-else-if="v.quantity <= 0">Hết mã</template>
                  <template v-else-if="canRedeem(v)">Đổi ngay</template>
                  <template v-else>Không đủ điều kiện</template>
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
                <div :class="['history-dot',
                  h.type === 'earn' ? 'dot-earn' : 'dot-use']">
                </div>
                <div>
                  <p class="history-desc">{{ h.desc }}</p>
                  <p class="history-date">{{ h.date }}</p>
                </div>
              </div>
              <span :class="['history-pts',
                h.type === 'earn' ? 'pts-earn' : 'pts-use']">
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
import { computed, onMounted } from 'vue'
import { useRouter }           from 'vue-router'
import { useAuthStore }        from '../Authorization/Auth'
import { useUserPoints }       from '../JS-USER/UserPoints.JS'

const auth   = useAuthStore()
const router = useRouter()

const {
  navItems, currentRoute,
  myPoints, usedPoints, nextTierPoints,
  currentTier, nextTier, progress,
  vouchers, canRedeem, isAlreadySaved, redeem, fmtValue, tagColor,
  pointHistory,
  toastVisible, toastMessage, toastType,
  goTo, initPage,
} = useUserPoints()

const user = computed(() => auth.user || {})

function logout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => initPage())
</script>

<style scoped src="../CSS-USER/UserAccount.CSS"></style>