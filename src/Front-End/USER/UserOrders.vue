<template>
  <div class="account-wrapper">
    <div class="account-inner">

      <!-- Sidebar -->
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

        <!-- Bảng tất cả đơn hàng -->
        <section class="card orders-card">
          <div class="orders-header">
            <div class="card-title-row" style="margin-bottom: 0;">
              <div class="card-title-icon">
                <span class="material-symbols-outlined">receipt_long</span>
              </div>
              <h3 class="card-title" style="margin-bottom: 0;">Đơn hàng của tôi</h3>
            </div>
            <button class="filter-btn" @click="showFilter = !showFilter">
              <span class="material-symbols-outlined">filter_list</span>
              Lọc
            </button>
          </div>

          <!-- Filter panel -->
          <div v-if="showFilter" class="filter-panel">
            <div class="filter-row">
              <div class="filter-group">
                <label>Tìm theo mã</label>
                <input v-model="searchId" type="text" placeholder="VD: #DL-1234" />
              </div>
              <div class="filter-group">
                <label>Trạng thái</label>
                <select v-model="filterStatus">
                  <option value="">Tất cả</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipping">Đang vận chuyển</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancelled">Đã huỷ</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Từ ngày</label>
                <input type="date" v-model="filterFromDate" />
              </div>
              <div class="filter-group">
                <label>Đến ngày</label>
                <input type="date" v-model="filterToDate" />
              </div>
            </div>
            <div class="filter-actions">
              <button class="filter-apply-btn" @click="applyFilter">
                <span class="material-symbols-outlined">search</span>
                Áp dụng
              </button>
              <button class="filter-reset-btn" @click="resetFilter">
                Xóa bộ lọc
              </button>
            </div>
          </div>

          <!-- Bảng đơn hàng -->
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
                <tr
                  v-for="order in pagedOrders"
                  :key="order.id"
                  class="order-row"
                >
                  <!-- Mã đơn -->
                  <td>
                    <div class="order-code-cell">
                      <div :class="['order-status-dot', order.status]"></div>
                      <span class="order-code">{{ order.name }}</span>
                    </div>
                  </td>

                  <!-- Thanh toán -->
                  <td class="order-payment">{{ order.paymentMethod }}</td>

                  <!-- Trạng thái -->
                  <td>
                    <span :class="['status-badge', order.status]">
                      {{ statusLabel(order.status) }}
                    </span>
                  </td>

                  <!-- Số lượng -->
                  <td class="text-center order-qty">{{ order.totalQty }}</td>

                  <!-- Tổng tiền -->
                  <td class="text-right order-total">{{ order.price }}</td>

                  <!-- Ngày đặt -->
                  <td class="order-date">{{ order.date }}</td>

                  <!-- Hành động -->
                  <td class="text-center">
                    <div class="action-btns">
                      <button
                        class="btn-view"
                        @click="openModal(order)"
                        title="Xem chi tiết"
                      >
                        <span class="material-symbols-outlined">visibility</span>
                        Chi tiết
                      </button>
                      <button
                        v-if="order.status === 'pending'"
                        class="btn-cancel"
                        @click="confirmCancel(order)"
                        title="Huỷ đơn"
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

          <!-- Footer phân trang -->
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

    <!-- Modal xem chi tiết -->
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

        <!-- Timeline tiến trình -->
        <div class="modal-timeline" v-if="selectedOrder.status !== 'cancelled'">
          <p class="modal-timeline-label">Tiến trình đơn hàng</p>
          <div class="modal-steps">
            <div class="modal-steps-line-bg"></div>
            <div
              class="modal-steps-line-progress"
              :style="{ width: getProgressWidth(selectedOrder.status) }"
            ></div>
            <div class="modal-steps-row">
              <div
                v-for="(step, i) in getOrderSteps(selectedOrder.status)"
                :key="i"
                class="modal-step-item"
              >
                <div :class="['modal-step-circle', step.state]">
                  <span class="material-symbols-outlined">{{ step.icon }}</span>
                </div>
                <span :class="['modal-step-label', step.state]">{{ step.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Huỷ đơn thông báo -->
        <div v-if="selectedOrder.status === 'cancelled'" class="modal-cancelled-notice">
          <span class="material-symbols-outlined">cancel</span>
          <span>Đơn hàng này đã bị huỷ</span>
        </div>

        <!-- Thông tin giao hàng -->
        <div class="modal-shipping">
          <p class="modal-shipping-label">Địa chỉ giao hàng</p>
          <p class="modal-shipping-addr">{{ selectedOrder.shippingAddress || 'Không có thông tin' }}</p>
        </div>

        <!-- Danh sách sản phẩm -->
        <div class="modal-products">
          <div
            v-for="item in selectedOrder.receiptData.items"
            :key="item.name"
            class="modal-product-item"
          >
            <div class="modal-product-img">
              <img :src="item.img" :alt="item.name" />
            </div>
            <div class="modal-product-info">
              <h4>{{ item.name }}</h4>
              <p v-if="item.toppings" class="modal-topping">+ {{ item.toppings }}</p>
              <p>Số lượng: x{{ item.qty }}</p>
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
            <p class="modal-product-price">{{ item.price }}</p>
          </div>
        </div>

        <!-- Tổng tiền (không có thuế) -->
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

    <!-- Confirm cancel dialog -->
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
import { useRouter } from 'vue-router'

const {
  user, navItems, currentRoute,
  allOrders, filteredOrders, pagedOrders,
  hasMore, loadMore,
  searchId, filterStatus, filterFromDate, filterToDate,
  showFilter, applyFilter, resetFilter,
  showModal, selectedOrder,
  openModal, closeModal,
  showCancelConfirm, cancelTarget,
  confirmCancel, doCancel,
  goTo, logout,
} = useUserOrders()

function statusLabel(status) {
  const map = {
    pending:    'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipping:   'Đang vận chuyển',
    delivered:  'Đã giao',
    cancelled:  'Đã huỷ',
  }
  return map[status] ?? status
}

const STEPS_DEF = [
  { label: 'Chờ xác nhận',    icon: 'pending_actions', status: 'pending'    },
  { label: 'Đang xử lý',      icon: 'settings',        status: 'processing' },
  { label: 'Đang vận chuyển', icon: 'local_shipping',  status: 'shipping'   },
  { label: 'Đã giao',         icon: 'home',            status: 'delivered'  },
]

const STATUS_ORDER = ['pending', 'processing', 'shipping', 'delivered']

function getOrderSteps(status) {
  const idx = STATUS_ORDER.indexOf(status)
  return STEPS_DEF.map((s, i) => ({
    ...s,
    state: i < idx ? 'done' : i === idx ? 'active' : 'pending',
  }))
}

function getProgressWidth(status) {
  const idx   = STATUS_ORDER.indexOf(status)
  const total = STATUS_ORDER.length - 1
  return `${Math.max(0, (idx / total) * 100)}%`
}

const auth = useAuthStore()
const router = useRouter()
const logout2 = () => { auth.logout(); router.push('/login') }
</script>

<style scoped src="../CSS-USER/UserAccount.CSS"></style>