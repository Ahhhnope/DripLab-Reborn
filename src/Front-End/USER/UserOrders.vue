<template>
  <div class="account-wrapper">
    <div class="account-inner">

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-profile">
          <div class="avatar-ring">
            <img :src="auth.user?.avatar" alt="Ảnh đại diện" class="avatar-img" />
          </div>
          <h2 class="sidebar-name">{{ auth.user.fullName }}</h2>
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

      <main class="account-main">
        <section class="card orders-card">

          <!-- Header -->
          <div class="orders-header">
            <div class="card-title-row" style="margin-bottom:0">
              <div class="card-title-icon">
                <span class="material-symbols-outlined">receipt_long</span>
              </div>
              <h3 class="card-title" style="margin-bottom:0">Đơn hàng của tôi</h3>
            </div>
          </div>

          <!-- Tab lọc trạng thái -->
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

          <!-- Tìm kiếm + lọc ngày -->
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
                    <span :class="['status-badge', order.status]">
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

    <!-- ═══ MODAL CHI TIẾT ═══ -->
    <div v-if="showModal && selectedOrder" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Chi tiết đơn hàng</h2>
            <p class="modal-id">{{ selectedOrder.name }}</p>
            <p class="modal-date">{{ selectedOrder.date }}</p>
            <span :class="['modal-status-badge', selectedOrder.status]">
              {{ statusLabel(selectedOrder.status) }}
            </span>
          </div>
          <button class="modal-close-btn" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Timeline -->
        <div v-if="selectedOrder.status !== 'cancelled'" class="modal-timeline">
          <p class="modal-timeline-label">Tiến trình đơn hàng</p>
          <div class="modal-steps">
            <div class="modal-steps-line-bg"></div>
            <div class="modal-steps-line-progress"
                 :style="{ width: getProgressWidth(selectedOrder.status) }"></div>
            <div class="modal-steps-row">
              <div v-for="(step, i) in getOrderSteps(selectedOrder.status)" :key="i"
                   class="modal-step-item">
                <div :class="['modal-step-circle', step.state]">
                  <span class="material-symbols-outlined">{{ step.icon }}</span>
                </div>
                <span :class="['modal-step-label', step.state]">{{ step.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedOrder.status === 'cancelled'" class="modal-cancelled-notice">
          <span class="material-symbols-outlined">cancel</span>
          <span>Đơn hàng này đã bị huỷ</span>
        </div>

        <!-- Địa chỉ -->
        <div class="modal-shipping">
          <p class="modal-shipping-label">Địa chỉ giao hàng</p>
          <p class="modal-shipping-addr">
            {{ selectedOrder.shippingAddress || 'Không có thông tin' }}
          </p>
        </div>

        <!-- Danh sách sản phẩm — có size + topping riêng -->
        <div class="modal-products">
          <div
            v-for="(item, idx) in selectedOrder.receiptData.items"
            :key="idx"
            class="modal-product-item"
          >
            <div class="modal-product-img">
              <img :src="item.img" :alt="item.name" />
            </div>

            <div class="modal-product-info">
              <h4>{{ item.name }}</h4>

              <!-- Size -->
              <div v-if="item.sizeName" class="modal-attr-row">
                <span class="modal-attr-label">
                  <span class="material-symbols-outlined">straighten</span>
                  Size {{ item.sizeName }}
                </span>
                <span class="modal-attr-price">+{{ formatPrice(item.sizePrice) }}</span>
              </div>

              <!-- Từng topping -->
              <div v-if="item.toppingList?.length" class="modal-topping-block">
                <div v-for="t in item.toppingList" :key="t.name" class="modal-attr-row">
                  <span class="modal-attr-label">
                    <span class="material-symbols-outlined">add_circle</span>
                    {{ t.name }}
                  </span>
                  <span class="modal-attr-price">+{{ formatPrice(t.price) }}</span>
                </div>
              </div>

              <p class="modal-item-qty">Số lượng: x{{ item.qty }}</p>
              <div class="item-options">
                <span class="option-tag sugar">
                  <span class="material-symbols-outlined">nutrition</span>
                  Đường: {{ item.sugar }}%
                </span>
                <span class="option-tag ice">
                  <span class="material-symbols-outlined">ac_unit</span>
                  Đá: {{ item.ice }}%
                </span>
              </div>
            </div>

            <div class="modal-product-price-col">
              <p class="modal-product-price">{{ item.price }}</p>
              <p class="modal-product-price-hint">x{{ item.qty }}</p>
            </div>
          </div>
        </div>

        <!-- Tổng kết -->
        <div class="modal-summary">
          <div class="summary-row">
            <span>Phương thức thanh toán</span>
            <span>{{ selectedOrder.paymentMethod }}</span>
          </div>
          <div class="summary-row">
            <span>Tổng số món</span>
            <span>{{ selectedOrder.totalQty }} món</span>
          </div>
          <div class="summary-row total-row">
            <span>Tổng cộng</span>
            <span class="total-price">{{ selectedOrder.price }}</span>
          </div>
          <div class="modal-footer-btns">
            <button
              v-if="selectedOrder.status === 'pending'"
              class="modal-cancel-btn"
              @click="confirmCancel(selectedOrder); closeModal()"
            >
              <span class="material-symbols-outlined">cancel</span>
              Huỷ đơn hàng
            </button>
            <button class="modal-close-main-btn" @click="closeModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ POPUP XÁC NHẬN ĐÃ NHẬN HÀNG ═══ -->
    <div v-if="showReceiveConfirm" class="modal-overlay">
      <div class="confirm-box receive-box">
        <div class="receive-icon">
          <span class="material-symbols-outlined">inventory</span>
        </div>
        <h3 class="confirm-title">Bạn đã nhận được hàng?</h3>
        <p class="confirm-desc">
          Đơn hàng <strong>{{ receiveTarget?.name }}</strong> đã được giao tới.
          Xác nhận để hoàn tất và nhận điểm tích lũy.
        </p>
        <div class="receive-points-preview">
          <span class="material-symbols-outlined">loyalty</span>
          Nhận <strong>{{ receiveTarget?.earnPoints }}</strong> điểm tích lũy
        </div>
        <div class="confirm-btns">
          <button class="confirm-no" @click="dismissReceive">Chưa nhận được</button>
          <button class="confirm-yes receive-yes" @click="doConfirmReceive">
            <span class="material-symbols-outlined">check_circle</span>
            Đã nhận hàng
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ TOAST TÍCH ĐIỂM ═══ -->
    <transition name="toast-slide">
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
    </transition>

    <!-- ═══ CONFIRM HUỶ ĐƠN ═══ -->
    <div v-if="showCancelConfirm" class="modal-overlay" @click.self="showCancelConfirm = false">
      <div class="confirm-box">
        <div class="confirm-icon">
          <span class="material-symbols-outlined">warning</span>
        </div>
        <h3 class="confirm-title">Xác nhận huỷ đơn?</h3>
        <p class="confirm-desc">
          Bạn có chắc muốn huỷ đơn hàng
          <strong>{{ cancelTarget?.name }}</strong>?
          Hành động này không thể hoàn tác.
        </p>
        <div class="confirm-btns">
          <button class="confirm-no" @click="showCancelConfirm = false">Không, giữ lại</button>
          <button class="confirm-yes" @click="doCancel">Có, huỷ đơn</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useUserOrders } from '../JS-USER/UserOrders.JS'
import { useAuthStore } from '../Authorization/Auth'

const auth = useAuthStore()

const {
  navItems, currentRoute,
  allOrders, filteredOrders, pagedOrders,
  hasMore, loadMore,
  searchId, filterStatus, filterFromDate, filterToDate,
  hasActiveFilter, resetFilter, setStatusTab, countByStatus,
  showModal, selectedOrder,
  openModal, closeModal,
  showCancelConfirm, cancelTarget, confirmCancel, doCancel,
  showReceiveConfirm, receiveTarget, dismissReceive, doConfirmReceive,
  showPointsToast, earnedPoints,
  goTo, logout,
} = useUserOrders()

const STATUS_TABS = [
  { label: 'Tất cả',          value: ''           },
  { label: 'Chờ xác nhận',    value: 'pending'    },
  { label: 'Đang xử lý',      value: 'processing' },
  { label: 'Đang vận chuyển', value: 'shipping'   },
  { label: 'Đã giao',         value: 'delivered'  },
  { label: 'Đã huỷ',          value: 'cancelled'  },
]

function statusLabel(s) {
  return { pending:'Chờ xác nhận', processing:'Đang xử lý',
           shipping:'Đang vận chuyển', delivered:'Đã giao', cancelled:'Đã huỷ' }[s] ?? s
}

function formatPrice(val) {
  if (!val && val !== 0) return '0 đ'
  return Number(val).toLocaleString('vi-VN') + ' đ'
}

const STEPS_DEF = [
  { label: 'Chờ xác nhận',    icon: 'pending_actions' },
  { label: 'Đang xử lý',      icon: 'settings'        },
  { label: 'Đang vận chuyển', icon: 'local_shipping'  },
  { label: 'Đã giao',         icon: 'home'            },
]
const STATUS_ORDER = ['pending','processing','shipping','delivered']

function getOrderSteps(status) {
  const idx = STATUS_ORDER.indexOf(status)
  return STEPS_DEF.map((s, i) => ({
    ...s,
    state: i < idx ? 'done' : i === idx ? 'active' : 'pending',
  }))
}
function getProgressWidth(status) {
  const idx = STATUS_ORDER.indexOf(status)
  return `${Math.max(0, (idx / (STATUS_ORDER.length - 1)) * 100)}%`
}
</script>

<style scoped src="../CSS-USER/UserAccount.CSS"></style>