<template>
  <div class="account-wrapper">
    <div class="account-inner">

      <!-- ══ SIDEBAR ══ -->
      <aside class="sidebar">
        <div class="sidebar-profile">
          <div class="avatar-ring">
            <img :src="user.avatar" alt="Ảnh đại diện" class="avatar-img" />
          </div>
          <h2 class="sidebar-name">{{ user.name }}</h2>
          <p class="sidebar-role">Thành viên cao cấp</p>
        </div>
        <nav class="sidebar-nav">
          <a
            v-for="item in navItems" :key="item.id"
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

      <!-- ══ MAIN ══ -->
      <main class="account-main">
        <section class="card orders-card">

          <div class="orders-header">
            <div class="card-title-row" style="margin-bottom:0">
              <div class="card-title-icon">
                <span class="material-symbols-outlined">receipt_long</span>
              </div>
              <h3 class="card-title" style="margin-bottom:0">Đơn hàng của tôi</h3>
            </div>
          </div>

          <!-- Tab trạng thái -->
          <div class="status-tab-bar">
            <button
              v-for="tab in STATUS_TABS" :key="tab.value"
              :class="['status-tab', { active: filterStatus === tab.value }]"
              @click="setStatusTab(tab.value)"
            >
              {{ tab.label }}
              <span class="tab-count">
                {{ tab.value === '' ? allOrders.length : countByStatus(tab.value) }}
              </span>
            </button>
          </div>

          <!-- Search bar -->
          <div class="orders-search-bar">
            <div class="search-input-wrap">
              <span class="material-symbols-outlined search-icon">search</span>
              <input
                v-model="searchId" type="text"
                class="search-input" placeholder="Tìm theo mã đơn hàng..."
              />
              <button v-if="searchId" class="search-clear" @click="searchId = ''">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <input type="date" v-model="filterFromDate" class="date-input" title="Từ ngày" />
            <input type="date" v-model="filterToDate"   class="date-input" title="Đến ngày" />
            <button v-if="hasActiveFilter" class="filter-reset-btn" @click="resetFilter">
              Xóa lọc
            </button>
          </div>

          <!-- Bảng -->
          <div class="orders-table-wrapper">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th class="text-center">Số lượng</th>
                  <th class="text-right">Tổng tiền</th>
                  <th>Ngày đặt</th>
                  <th class="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="pagedOrders.length === 0">
                  <td colspan="7" class="empty-result">
                    <span class="material-symbols-outlined">search_off</span>
                    <p>Không tìm thấy đơn hàng phù hợp</p>
                  </td>
                </tr>
                <tr v-for="order in pagedOrders" :key="order.id" class="order-row">
                  <td>
                    <div class="order-code-cell">
                      <div :class="['order-status-dot', order.status]"></div>
                      <span class="order-code">{{ order.name }}</span>
                    </div>
                  </td>
                  <td class="order-payment">{{ order.paymentMethod }}</td>
                  <td>
                    <span :class="['status-badge', `status-badge--${order.status}`]">
                      {{ statusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="text-center order-qty">{{ order.totalQty }}</td>
                  <td class="text-right order-total">{{ order.price }}</td>
                  <td class="order-date">{{ order.date }}</td>
                  <td class="text-center">
                    <div class="action-btns">
                      <button class="btn-view" @click="openModal(order)">
                        <span class="material-symbols-outlined">visibility</span>
                        Chi tiết
                      </button>
                      <button
                        v-if="order.status === 'pending'"
                        class="btn-cancel"
                        @click="confirmCancel(order)"
                      >
                        <span class="material-symbols-outlined">cancel</span>
                        Huỷ
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="orders-footer">
            <button v-if="hasMore" class="load-more-btn" @click="loadMore">
              <span class="material-symbols-outlined">expand_more</span>
              Xem thêm đơn hàng
            </button>
            <p v-else-if="allOrders.length > 0" class="no-more-text">
              Đã hiển thị tất cả {{ filteredOrders.length }} đơn hàng
            </p>
          </div>
        </section>
      </main>
    </div>

    <!-- ══════════════════════════════════════
         MODAL CHI TIẾT  (style admin)
    ══════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal && selectedOrder" class="ud-backdrop" @click.self="closeModal">
          <div class="ud-container">

            <!-- HEADER -->
            <div class="ud-header">
              <div class="ud-header__left">
                <span class="ud-order-code">#{{ selectedOrder.name }}</span>
                <span :class="['ud-status-badge', `ud-status-badge--${selectedOrder.status}`]">
                  {{ statusLabel(selectedOrder.status) }}
                </span>
                <span class="ud-date-chip">{{ selectedOrder.date }}</span>
              </div>
              <button class="ud-close-btn" @click="closeModal">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- BODY -->
            <div class="ud-body custom-scrollbar">

              <!-- TIMELINE -->
              <div class="ud-timeline" v-if="selectedOrder.status !== 'cancelled'">
                <div class="ud-timeline__title">Tiến trình đơn hàng</div>
                <div class="ud-steps">
                  <div class="ud-steps__connector"
                       :style="{ '--progress': getProgressWidth(selectedOrder.status) }">
                  </div>
                  <div
                    v-for="(step, i) in getVisibleSteps(selectedOrder.status)"
                    :key="step.key"
                    :class="['ud-step', getStepClass(step, selectedOrder.status)]"
                  >
                    <div class="ud-step__circle">
                      <!-- doc -->
                      <svg v-if="step.icon === 'doc'" class="ud-step__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14 2v6h6M9 13h6M9 17h6"/>
                      </svg>
                      <!-- gear -->
                      <svg v-else-if="step.icon === 'gear'" class="ud-step__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                      </svg>
                      <!-- truck -->
                      <svg v-else-if="step.icon === 'truck'" class="ud-step__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 7h11v10H3z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4l3 3v4h-7z"/>
                        <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
                      </svg>
                      <!-- home -->
                      <svg v-else-if="step.icon === 'home'" class="ud-step__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 11l9-8 9 8M5 10v10h14V10"/>
                      </svg>
                      <!-- x / ban -->
                      <svg v-else class="ud-step__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </div>
                    <span class="ud-step__label">{{ step.label }}</span>
                  </div>
                </div>
              </div>

              <!-- Huỷ notice -->
              <div v-if="selectedOrder.status === 'cancelled'" class="ud-cancelled-notice">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M15 9l-6 6M9 9l6 6"/>
                </svg>
                Đơn hàng này đã bị huỷ
              </div>

              <!-- GRID: trái + phải -->
              <div class="ud-grid">

                <!-- CỘT TRÁI -->
                <div class="ud-col-left">

                  <!-- Địa chỉ giao -->
                  <section class="ud-section">
                    <div class="ud-section__header">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ud-section__icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span class="ud-section__title">Địa chỉ giao hàng</span>
                    </div>
                    <div class="ud-info-card">
                      <p class="ud-addr-text">
                        {{ selectedOrder.shippingAddress || 'Chưa có địa chỉ giao hàng' }}
                      </p>
                    </div>
                  </section>

                  <!-- Chi tiết món -->
                  <section class="ud-section">
                    <div class="ud-section__header ud-section__header--between">
                      <div style="display:flex;align-items:center;gap:8px">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ud-section__icon">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        <span class="ud-section__title">Chi tiết món</span>
                      </div>
                      <span class="ud-qty-badge">{{ selectedOrder.totalQty }} món</span>
                    </div>

                    <div
                      v-for="(item, idx) in selectedOrder.receiptData.items"
                      :key="idx"
                      class="ud-item-row"
                    >
                      <!-- Ảnh -->
                      <div class="ud-item-img">
                        <img v-if="item.img" :src="item.img" :alt="item.name" />
                        <div v-else class="ud-item-img__placeholder">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/>
                            <rect x="2" y="2" width="20" height="20" rx="3"/>
                          </svg>
                        </div>
                      </div>

                      <!-- Thông tin -->
                      <div class="ud-item-info">
                        <p class="ud-item-name">{{ item.name }}</p>

                        <!-- Size -->
                        <div v-if="item.sizeName" class="ud-item-attr-row">
                          <span class="ud-item-attr">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" d="M3 6h18M3 12h18M3 18h18"/>
                            </svg>
                            Size {{ item.sizeName }}
                          </span>
                          <span class="ud-item-attr-price">+{{ formatPrice(item.sizePrice) }}</span>
                        </div>

                        <!-- Toppings -->
                        <div v-if="item.toppingList?.length">
                          <div v-for="t in item.toppingList" :key="t.name" class="ud-item-attr-row">
                            <span class="ud-item-attr">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" d="M12 5v14M5 12h14"/>
                              </svg>
                              {{ t.name }}
                            </span>
                            <span class="ud-item-attr-price">+{{ formatPrice(t.price) }}</span>
                          </div>
                        </div>

                        <!-- Options tags -->
                        <div class="ud-item-tags">
                          <span class="ud-tag ud-tag--sugar">
                            Đường {{ item.sugar }}%
                          </span>
                          <span class="ud-tag ud-tag--ice">
                            Đá {{ item.ice }}%
                          </span>
                        </div>
                      </div>

                      <!-- Số lượng + giá -->
                      <div class="ud-item-right">
                        <span class="ud-item-qty">x{{ item.qty }}</span>
                        <span class="ud-item-price">{{ item.price }}</span>
                      </div>
                    </div>
                  </section>
                </div>

                <!-- CỘT PHẢI -->
                <div class="ud-col-right">

                  <!-- Thanh toán -->
                  <div class="ud-payment-card">
                    <span class="ud-section__title" style="display:block;margin-bottom:14px">
                      Thanh toán
                    </span>
                    <div class="ud-payment-row">
                      <span>Phương thức</span>
                      <span class="ud-payment-val--bold">{{ selectedOrder.paymentMethod }}</span>
                    </div>
                    <div class="ud-payment-row">
                      <span>Số lượng món</span>
                      <span>{{ selectedOrder.totalQty }} món</span>
                    </div>
                    <div class="ud-payment-total">
                      <span>Tổng cộng</span>
                      <span class="ud-payment-total__amount">{{ selectedOrder.price }}</span>
                    </div>
                  </div>

                  <!-- Hành động -->
                  <div class="ud-action-group">
                    <!-- Xác nhận nhận hàng (delivered, chưa tích điểm) -->
                    <button
                      v-if="selectedOrder.status === 'delivered' && !isPointed(selectedOrder.id)"
                      class="ud-btn ud-btn--receive"
                      @click="closeModal(); triggerReceiveConfirm(selectedOrder)"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Xác nhận đã nhận hàng
                    </button>

                    <!-- Huỷ đơn (chỉ pending) -->
                    <button
                      v-if="selectedOrder.status === 'pending'"
                      class="ud-btn ud-btn--danger"
                      @click="confirmCancel(selectedOrder); closeModal()"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Huỷ đơn hàng
                    </button>

                    <button class="ud-btn ud-btn--ghost" @click="closeModal">Đóng</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ POPUP XÁC NHẬN NHẬN HÀNG ══ -->
    <Teleport to="body">
      <div v-if="showReceiveConfirm" class="ud-confirm-backdrop">
        <div class="ud-confirm-card">
          <div class="ud-confirm-icon ud-confirm-icon--green">
            <span class="ud-confirm-icon__inner">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </span>
          </div>
          <h3 class="ud-confirm-title">Xác nhận đã nhận hàng?</h3>
          <p class="ud-confirm-desc">
            Đơn hàng <strong>{{ receiveTarget?.name }}</strong> đã được giao tới bạn.
            Xác nhận để nhận điểm tích lũy.
          </p>
          <div class="ud-points-preview">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Nhận <strong>{{ receiveTarget?.earnPoints }}</strong> điểm tích lũy
          </div>
          <div class="ud-confirm-actions">
            <button class="ud-confirm-btn ud-confirm-btn--ghost" @click="dismissReceive">
              Chưa nhận được
            </button>
            <button class="ud-confirm-btn ud-confirm-btn--primary ud-confirm-btn--green" @click="doConfirmReceive">
              Đã nhận hàng
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ TOAST TÍCH ĐIỂM ══ -->
    <Teleport to="body">
      <Transition name="toast-slide">
        <div v-if="showPointsToast" class="points-toast">
          <div class="points-toast-icon">
            <span class="material-symbols-outlined">workspace_premium</span>
          </div>
          <div class="points-toast-content">
            <p class="points-toast-title">Tích điểm thành công!</p>
            <p class="points-toast-desc">
              +{{ earnedPoints }} điểm đã được cộng vào kho của bạn
            </p>
          </div>
          <button class="points-toast-close" @click="showPointsToast = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ CONFIRM HUỶ ĐƠN ══ -->
    <Teleport to="body">
      <Transition name="confirm-pop">
        <div v-if="showCancelConfirm" class="ud-confirm-backdrop" @click.self="showCancelConfirm = false">
          <div class="ud-confirm-card">
            <div class="ud-confirm-icon">
              <span class="ud-confirm-icon__inner">✦</span>
            </div>
            <h3 class="ud-confirm-title">Xác nhận huỷ đơn?</h3>
            <p class="ud-confirm-desc">
              Bạn có chắc muốn huỷ đơn hàng
              <strong>{{ cancelTarget?.name }}</strong>?
              Hành động này không thể hoàn tác.
            </p>
            <div class="ud-confirm-actions">
              <button class="ud-confirm-btn ud-confirm-btn--ghost" @click="showCancelConfirm = false">
                Không, giữ lại
              </button>
              <button class="ud-confirm-btn ud-confirm-btn--primary" @click="doCancel">
                Có, huỷ đơn
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserOrders } from '../JS-USER/UserOrders.JS'

const {
  user, navItems, currentRoute,
  allOrders, filteredOrders, pagedOrders,
  hasMore, loadMore,
  searchId, filterStatus, filterFromDate, filterToDate,
  hasActiveFilter, resetFilter, setStatusTab, countByStatus,
  showModal, selectedOrder, openModal, closeModal,
  showCancelConfirm, cancelTarget, confirmCancel, doCancel,
  showReceiveConfirm, receiveTarget,
  dismissReceive, doConfirmReceive, triggerReceiveConfirm,
  showPointsToast, earnedPoints,
  isPointed,
  goTo, logout,
} = useUserOrders()

// ── Tabs ─────────────────────────────────────────────────
const STATUS_TABS = [
  { label: 'Tất cả',                    value: ''           },
  { label: 'Chờ xác nhận',              value: 'pending'    },
  { label: 'Đang xử lý',                value: 'processing' },
  { label: 'Đang vận chuyển',           value: 'shipping'   },
  { label: 'Đã giao',                   value: 'delivered'  },
  { label: 'Không thành công',          value: 'failed'     },
  { label: 'Đã huỷ',                    value: 'cancelled'  },
]

// ── Labels ───────────────────────────────────────────────
function statusLabel(s) {
  return {
    pending:    'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipping:   'Đang vận chuyển',
    delivered:  'Đã giao',
    failed:     'Giao hàng không thành công',
    cancelled:  'Đã huỷ',
  }[s] ?? s
}

function formatPrice(val) {
  if (!val && val !== 0) return '0 đ'
  return Number(val).toLocaleString('vi-VN') + ' đ'
}

// ── Timeline steps (dùng logic giống admin) ──────────────
const ALL_STEPS = [
  { key: 'pending',    label: 'Chờ xác nhận',              icon: 'doc'   },
  { key: 'processing', label: 'Đang xử lý',                icon: 'gear'  },
  { key: 'shipping',   label: 'Đang vận chuyển',           icon: 'truck' },
  { key: 'delivered',  label: 'Đã giao',                   icon: 'home'  },
  { key: 'failed',     label: 'Giao không thành công',     icon: 'x'     },
  { key: 'cancelled',  label: 'Đã huỷ',                    icon: 'x'     },
]

function getVisibleSteps(status) {
  if (status === 'delivered') {
    return ALL_STEPS.filter(s => ['pending','processing','shipping','delivered'].includes(s.key))
  }
  if (status === 'failed') {
    return ALL_STEPS.filter(s => ['pending','processing','shipping','failed'].includes(s.key))
  }
  if (status === 'cancelled') {
    return ALL_STEPS.filter(s => ['pending','processing','cancelled'].includes(s.key))
  }
  // pending / processing / shipping → hiện full (trừ cancelled và failed)
  return ALL_STEPS.filter(s => !['cancelled','failed'].includes(s.key))
}

function getStepClass(step, currentStatus) {
  const steps   = getVisibleSteps(currentStatus)
  const curIdx  = steps.findIndex(s => s.key === currentStatus)
  const stepIdx = steps.findIndex(s => s.key === step.key)
  return {
    'ud-step--done':    stepIdx < curIdx,
    'ud-step--current': stepIdx === curIdx,
    'ud-step--todo':    stepIdx > curIdx,
  }
}

function getProgressWidth(status) {
  const steps  = getVisibleSteps(status)
  const curIdx = steps.findIndex(s => s.key === status)
  if (curIdx < 0) return '0%'
  const pct = Math.min(((curIdx + 0.6) / (steps.length - 1)) * 100, 100)
  return `${pct}%`
}
</script>

<style scoped src="../CSS-USER/UserAccount.CSS"></style>