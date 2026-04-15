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
        <!-- Trạng thái đơn hàng -->
        <section class="card">
          <h3 class="card-title">Trạng thái đơn hàng hiện tại</h3>
          <div class="order-steps">
            <div class="steps-line-bg"></div>
            <div
              class="steps-line-progress"
              :style="{ width: progressWidth }"
            ></div>
            <div class="steps-row">
              <div v-for="(step, i) in orderSteps" :key="i" class="step-item">
                <div :class="['step-circle', step.state]">
                  <span class="material-symbols-outlined">{{ step.icon }}</span>
                </div>
                <span :class="['step-label', step.state]">{{
                  step.label
                }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Địa chỉ + Đơn hàng đang hoạt động -->
        <div class="order-grid">
          <section class="card">
            <h3 class="card-title">
              <span class="material-symbols-outlined title-icon"
                >location_on</span
              >
              Địa chỉ giao hàng
            </h3>
            <div class="shipping-info">
              <p class="shipping-name">{{ shipping.name }}</p>
              <p class="shipping-text">{{ shipping.phone }}</p>
              <p class="shipping-text">{{ shipping.address }}</p>
            </div>
            <div class="shipping-footer">
              <button class="link-btn" @click="goTo('/account/address')">
                Thay đổi địa chỉ
              </button>
            </div>
          </section>

          <!-- Active Orders -->
          <section class="card">
            <h3 class="card-title">Đơn hàng đang hoạt động</h3>

            <!-- Không có đơn nào -->
            <div v-if="activeOrders.length === 0" class="empty-result">
              <span class="material-symbols-outlined">inventory_2</span>
              <p>Không có đơn hàng nào đang hoạt động</p>
            </div>

            <template v-else>
              <!-- Bộ chọn đơn hàng (chỉ hiện khi có >= 2 đơn) -->
              <div v-if="activeOrders.length > 1" class="order-selector">
                <p class="order-selector-label">
                  <span class="material-symbols-outlined">swap_horiz</span>
                  Chọn đơn để xem tiến trình ({{ activeOrders.length }} đơn đang
                  xử lý)
                </p>
                <div class="order-selector-tabs">
                  <button
                    v-for="order in activeOrders"
                    :key="order.id"
                    :class="[
                      'order-tab',
                      { active: selectedOrderId === order.id },
                    ]"
                    @click="selectOrder(order.id)"
                  >
                    <span class="order-tab-name">{{ order.name }}</span>
                    <span :class="['order-tab-badge', order.status]">
                      {{ statusLabel(order.status) }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Chi tiết đơn đang chọn -->
              <div v-if="selectedOrder" class="active-order-item">
                <div class="active-order-info">
                  <div class="active-order-header">
                    <h4>Mã đơn hàng: {{ selectedOrder.name }}</h4>
                    <span class="active-order-date">{{
                      selectedOrder.date
                    }}</span>
                  </div>

                  <div class="active-drink-list">
                    <div
                      v-for="(drink, i) in selectedOrder.receiptData.items"
                      :key="i"
                      class="active-drink-row"
                    >
                      <div class="active-drink-img">
                        <img :src="drink.img" :alt="drink.name" />
                      </div>
                      <div class="active-drink-info">
                        <p class="active-drink-name">{{ drink.name }}</p>
                        <p v-if="drink.toppings" class="active-drink-topping">
                          + {{ drink.toppings }}
                        </p>
                        <p class="active-drink-qty">
                          Số lượng: x{{ drink.qty }}
                        </p>
                        <div class="item-options">
                          <span class="option-tag sugar">
                            <span class="material-symbols-outlined"
                              >nutrition</span
                            >
                            Đường: {{ drink.sugar }}%
                          </span>
                          <span class="option-tag ice">
                            <span class="material-symbols-outlined"
                              >ac_unit</span
                            >
                            Đá: {{ drink.ice }}%
                          </span>
                        </div>
                      </div>
                      <p class="active-drink-price">{{ drink.price }}</p>
                    </div>
                  </div>

                  <div class="active-order-bottom">
                    <p class="active-order-price">
                      Tổng: {{ selectedOrder.price }}
                    </p>
                    <button
                      class="view-detail-btn"
                      @click="openModal(selectedOrder.receiptData)"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </section>
        </div>

        <!-- Hóa đơn -->
        <section class="card receipts-card">
          <div class="receipts-header">
            <h3 class="card-title">Hóa đơn của tôi</h3>
            <button class="filter-btn" @click="showFilter = !showFilter">
              <span class="material-symbols-outlined">filter_list</span>
              Lọc
            </button>
          </div>

          <div v-if="showFilter" class="filter-panel">
            <div class="filter-row">
              <div class="filter-group">
                <label>Tìm theo mã</label>
                <input
                  v-model="searchId"
                  type="text"
                  placeholder="VD: #DL-9283"
                />
              </div>

              <div class="filter-group">
                <label>Danh mục</label>
                <select v-model="filterCategory">
                  <option value="">Tất cả</option>
                  <option
                    v-for="cat in categoryOptions"
                    :key="cat"
                    :value="cat"
                  >
                    {{ cat }}
                  </option>
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

          <div class="receipts-table-wrapper">
            <table class="receipts-table">
              <thead>
                <tr>
                  <th>Thông tin đơn hàng</th>
                  <th>Ngày tháng</th>
                  <th class="text-right">Tổng giá tiền</th>
                  <th class="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="receipts.length === 0">
                  <td colspan="4" class="empty-result">
                    <span class="material-symbols-outlined">search_off</span>
                    <p>Không tìm thấy đơn hàng phù hợp</p>
                  </td>
                </tr>
                <tr
                  v-for="receipt in receipts"
                  :key="receipt.id"
                  class="receipt-row"
                >
                  <td>
                    <div class="receipt-info">
                      <div class="receipt-icon">
                        <span class="material-symbols-outlined"
                          >receipt_long</span
                        >
                      </div>
                      <div>
                        <p class="receipt-id">{{ receipt.id }}</p>
                        <p class="receipt-category">{{ receipt.category }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="receipt-date">{{ receipt.date }}</td>
                  <td class="receipt-price text-right">{{ receipt.total }}</td>
                  <td class="text-right">
                    <button class="view-detail-btn" @click="openModal(receipt)">
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="receipts-footer">
            <button v-if="hasMore" class="load-more-btn" @click="loadMore">
              <span class="material-symbols-outlined">expand_more</span>
              Xem thêm lịch sử đơn hàng
            </button>
            <p v-else class="no-more-text">Đã hiển thị tất cả đơn hàng</p>
          </div>
        </section>
      </main>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Chi tiết đơn hàng</h2>
            <p class="modal-id">{{ selectedReceipt.id }}</p>
            <p class="modal-date">{{ selectedReceipt.date }}</p>
          </div>
          <button class="modal-close-btn" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="modal-products">
          <div
            v-for="item in selectedReceipt.items"
            :key="item.name"
            class="modal-product-item"
          >
            <div class="modal-product-img">
              <img :src="item.img" :alt="item.name" />
            </div>
            <div class="modal-product-info">
              <h4>{{ item.name }}</h4>
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

        <div class="modal-summary">
          <div class="summary-row">
            <span>Tạm tính</span>
            <span>{{ selectedReceipt.subtotal }}</span>
          </div>
          <div class="summary-row">
            <span>Thuế (5%)</span>
            <span>{{ selectedReceipt.tax }}</span>
          </div>
          <div class="summary-row total-row">
            <span>Tổng cộng</span>
            <span class="total-price">{{ selectedReceipt.total }}</span>
          </div>
          <button class="modal-close-main-btn" @click="closeModal">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserOrders } from "../JS-USER/UserOrders.JS";
import { useAuthStore } from "../Authorization/Auth";
import { useRouter } from "vue-router";

const {
  navItems,
  currentRoute,
  orderSteps,
  progressWidth,
  shipping,
  activeOrders,
  selectedOrderId,
  selectedOrder,
  selectOrder,
  receipts,
  hasMore,
  loadMore,
  searchId,
  filterCategory,
  filterFromDate,
  filterToDate,
  showFilter,
  categoryOptions,
  applyFilter,
  resetFilter,
  showModal,
  selectedReceipt,
  openModal,
  closeModal,
  goTo,
} = useUserOrders();

function statusLabel(status) {
  const map = {
    pending:    'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipping:   'Đang giao',
    delivered:  'Đã giao',
  }
  return map[status] ?? status
}

const auth = useAuthStore();
const router = useRouter();

const user = auth.user;

const logout = () => {
  auth.logout();
  router.push("/login");
};
</script>

<style scoped src="../CSS-USER/UserAccount.CSS"></style>
