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
          <p class="sidebar-role">{{ user.tier?.name }}</p>
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
                {{ myPoints.toLocaleString("vi-VN") }}
                <span class="metric-unit">điểm</span>
              </p>
            </div>
            <div class="metric-card">
              <p class="metric-label">Đã sử dụng</p>
              <p class="metric-value">
                {{ usedPoints.toLocaleString("vi-VN") }}
                <span class="metric-unit">điểm</span>
              </p>
            </div>
            <div class="metric-card tier-card">
              <p class="metric-label">Hạng thành viên</p>
              <p class="metric-value tier-value">
                <span class="material-symbols-outlined tier-icon"
                  >workspace_premium</span
                >
                {{ currentTier }}
              </p>
            </div>
          </div>

          <!-- Progress -->
          <div class="progress-wrap">
            <div class="progress-label">
              <span
                >Tiến độ đến hạng <strong>{{ nextTier }}</strong></span
              >
              <span>
                {{ myPoints.toLocaleString("vi-VN") }} /
                {{ nextTierPoints.toLocaleString("vi-VN") }} điểm
              </span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
            <p class="progress-hint">
              Cần thêm
              <strong>
                {{ (nextTierPoints - myPoints).toLocaleString("vi-VN") }} điểm
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
            <strong>{{ myPoints.toLocaleString("vi-VN") }} điểm</strong>
            — chọn voucher để đổi ngay
          </p>

          <p v-if="vouchers.length === 0" class="empty-hint">
            Hiện chưa có voucher nào để đổi 😢
          </p>

          <div class="voucher-grid" v-else>
            <div
              v-for="v in vouchers"
              :key="v.id"
              :class="[
                'voucher-card',
                { 'voucher-disabled': !canRedeem(v) || isAlreadySaved(v.id) },
              ]"
            >
              <span :class="['voucher-tag', tagColor(v)]">
                {{ v.category === "PHẦN TRĂM" ? "Giảm %" : "Giảm tiền" }}
              </span>
              <span class="voucher-remain">Còn {{ v.quantity }} mã</span>
              <p class="voucher-name">{{ v.name }}</p>
              <p class="voucher-desc">
                Mã: <strong>{{ v.code }}</strong>
                <template v-if="v.minOrderValue > 0">
                  &nbsp;·&nbsp;Đơn từ
                  {{ (+v.minOrderValue).toLocaleString("vi-VN") }}đ
                </template>
                &nbsp;·&nbsp;HSD: {{ v.endDate?.split("T")[0] }}
              </p>
              <div class="voucher-footer">
                <div class="voucher-cost">
                  <span class="material-symbols-outlined cost-icon">sell</span>
                  <strong>{{ fmtValue(v) }}</strong>
                </div>
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

        <!-- ── 2-column row: Mã KM của tôi  +  Lịch sử điểm ── -->
        <div class="bottom-row">
          <!-- CỘT TRÁI: Mã khuyến mãi của tôi -->
          <section class="card half-card">
            <div class="card-title-row">
              <div class="card-title-icon">
                <span class="material-symbols-outlined"
                  >confirmation_number</span
                >
              </div>
              <h3 class="card-title">Mã khuyến mãi của tôi</h3>
              <span class="history-total-badge">{{ myPromos.length }} mã</span>
            </div>

            <p v-if="myPromos.length === 0" class="empty-hint">
              Bạn chưa có mã khuyến mãi nào 🎫
            </p>

            <div class="my-promo-list" v-else>
              <TransitionGroup name="history-item">
                <div
                  v-for="p in visiblePromos"
                  :key="p.id"
                  class="my-promo-card"
                >
                  <div class="promo-left">
                    <span :class="['voucher-tag', tagColor(p)]">
                      {{ p.category === "PHẦN TRĂM" ? "Giảm %" : "Giảm tiền" }}
                    </span>
                    <p class="promo-name">{{ p.name }}</p>
                    <p class="promo-code-line">
                      Mã: <strong>{{ p.code }}</strong>
                    </p>
                    <p class="promo-exp">HSD: {{ p.endDate?.split("T")[0] }}</p>
                  </div>
                  <div class="promo-value">
                    <strong>{{ fmtValue(p) }}</strong>
                  </div>
                </div>
              </TransitionGroup>
            </div>

            <!-- Footer xem thêm / thu gọn -->
            <div v-if="myPromos.length > PROMOS_INIT" class="history-footer">
              <div v-if="!isPromosExpanded" class="history-fade"></div>
              <div class="history-footer-btns">
                <button
                  v-if="!isPromosExpanded"
                  class="history-expand-btn"
                  @click="showMorePromos"
                >
                  <span class="material-symbols-outlined">expand_more</span>
                  Xem thêm
                  <span class="history-expand-count">
                    ({{ myPromos.length - promosVisible }} mã còn lại)
                  </span>
                </button>
                <button
                  v-if="isPromosExpanded"
                  class="history-collapse-btn"
                  @click="collapsePromos"
                >
                  <span class="material-symbols-outlined">expand_less</span>
                  Thu gọn
                </button>
              </div>
            </div>
          </section>

          <!-- CỘT PHẢI: Lịch sử điểm -->
          <section class="card half-card">
            <div class="card-title-row">
              <div class="card-title-icon">
                <span class="material-symbols-outlined">history</span>
              </div>
              <h3 class="card-title">Lịch sử điểm</h3>
              <span class="history-total-badge">
                {{ pointHistory.length }} giao dịch
              </span>
            </div>

            <div class="history-list">
              <TransitionGroup name="history-item">
                <div
                  v-for="(h, i) in visibleHistory"
                  :key="h.date + h.desc + i"
                  class="history-row"
                >
                  <div class="history-left">
                    <div
                      :class="[
                        'history-dot',
                        h.type === 'earn' ? 'dot-earn' : 'dot-use',
                      ]"
                    ></div>
                    <div>
                      <p class="history-desc">{{ h.desc }}</p>
                      <p class="history-date">{{ h.date }}</p>
                    </div>
                  </div>
                  <span
                    :class="[
                      'history-pts',
                      h.type === 'earn' ? 'pts-earn' : 'pts-use',
                    ]"
                  >
                    {{ h.type === "earn" ? "+" : "−"
                    }}{{ h.pts.toLocaleString("vi-VN") }}
                  </span>
                </div>
              </TransitionGroup>

              <p v-if="pointHistory.length === 0" class="empty-hint">
                Chưa có lịch sử điểm nào.
              </p>
            </div>

            <div
              v-if="pointHistory.length > HISTORY_INIT"
              class="history-footer"
            >
              <div v-if="!isExpanded" class="history-fade"></div>
              <div class="history-footer-btns">
                <button
                  v-if="!isExpanded"
                  class="history-expand-btn"
                  @click="showMoreHistory"
                >
                  <span class="material-symbols-outlined">expand_more</span>
                  Xem thêm
                  <span class="history-expand-count">
                    ({{ pointHistory.length - historyVisible }} còn lại)
                  </span>
                </button>
                <button
                  v-if="isExpanded"
                  class="history-collapse-btn"
                  @click="collapseHistory"
                >
                  <span class="material-symbols-outlined">expand_less</span>
                  Thu gọn
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../Authorization/Auth";
import { useUserPoints } from "../JS-USER/UserPoints.JS";

const auth = useAuthStore();
const router = useRouter();

const {
  navItems,
  currentRoute,
  myPromos,
  myPoints,
  usedPoints,
  nextTierPoints,
  currentTier,
  progress,
  vouchers,
  canRedeem,
  isAlreadySaved,
  redeem,
  fmtValue,
  tagColor,
  pointHistory,
  toastVisible,
  toastMessage,
  toastType,
  goTo,
  initPage,
} = useUserPoints();

const user = computed(() => auth.user || {});

function logout() {
  auth.logout();
  router.push("/login");
}

onMounted(() => initPage());
// ── Mã KM: xem thêm / thu gọn ────────────────────
const PROMOS_INIT = 2;
const promosVisible = ref(PROMOS_INIT);

const isPromosExpanded = computed(
  () => promosVisible.value >= myPromos.value.length,
);

const visiblePromos = computed(() =>
  myPromos.value.slice(0, promosVisible.value),
);

function showMorePromos() {
  promosVisible.value = Math.min(
    promosVisible.value + 3,
    myPromos.value.length,
  );
}

function collapsePromos() {
  promosVisible.value = PROMOS_INIT;
}

// ── Lịch sử điểm: xem thêm / thu gọn ────────────────────
const HISTORY_INIT = 3;
const historyVisible = ref(HISTORY_INIT);

const isExpanded = computed(
  () => historyVisible.value >= pointHistory.value.length,
);

const visibleHistory = computed(() =>
  pointHistory.value.slice(0, historyVisible.value),
);

function showMoreHistory() {
  historyVisible.value = Math.min(
    historyVisible.value + 5,
    pointHistory.value.length,
  );
}

function collapseHistory() {
  historyVisible.value = HISTORY_INIT;
}

</script>

<style scoped src="../CSS-USER/UserAccount.CSS"></style>
