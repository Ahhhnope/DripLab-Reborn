<template>
  <div class="account-wrapper">
    <div class="account-inner">
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

      <main class="account-main">
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
                <span :class="['step-label', step.state]">{{ step.label }}</span>
              </div>
            </div>
          </div>
        </section>

        <div class="order-grid">
          <section class="card">
            <h3 class="card-title">
              <span class="material-symbols-outlined title-icon">location_on</span>
              Địa chỉ giao hàng
            </h3>
            
            <div class="shipping-info" v-if="shipping">
              <p class="shipping-name">{{ shipping.name }}</p>
              <p class="shipping-text">{{ shipping.phone }}</p>
              <p class="shipping-text" style="white-space: pre-line;">{{ shipping.address }}</p>
            </div>
            
            <div v-else class="shipping-info">
              <p class="shipping-text">Đang tải thông tin giao hàng...</p>
            </div>

            <div class="shipping-footer">
              <button class="link-btn" @click="goTo('/account/address')">
                Thay đổi địa chỉ
              </button>
            </div>
          </section>

          <section class="card">
            <h3 class="card-title">Các mục đơn hàng đang hoạt động</h3>
            <div v-if="activeOrder.length === 0" class="empty-state">
              <span class="material-symbols-outlined">coffee</span>
              <p>Hiện không có đơn hàng nào đang xử lý.</p>
            </div>
            <div
              v-for="order in activeOrder"
              :key="order.id"
              class="active-order-item"
            >
              <div class="active-order-info">
                <h4>Mã đơn hàng: #DL-{{ order.orderNumber }}</h4>
                <div class="active-drink-list">
                  <div
                    v-for="(item, i) in order.orderItems"
                    :key="i"
                    class="active-drink-row"
                  >
                    <div class="active-drink-img">
                      <img :src="item.drink.imageUrl || '/default-drink.png'" :alt="item.drink.name" />
                    </div>
                    <div class="active-drink-info">
                      <p class="active-drink-name">{{ item.drink.name }}</p>
                      <p class="active-drink-qty">Số lượng: x{{ item.quantity }}</p>
                      <div class="item-options">
                        <span class="option-tag sugar">
                          <span class="material-symbols-outlined">nutrition</span>
                          Size: {{ item.size || 'M' }}
                        </span>
                      </div>
                    </div>
                    <p class="active-drink-price">
                      {{ new Intl.NumberFormat('vi-VN').format(item.basePriceAtPurchase) }}đ
                    </p>
                  </div>
                </div>

                <div class="active-order-bottom">
                  <p class="active-order-price">
                    Tổng: {{ new Intl.NumberFormat('vi-VN').format(order.finalPrice) }} VNĐ
                  </p>
                  <button
                    class="view-detail-btn"
                    @click="openModal(order)"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

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
                <label>Loại đơn</label>
                <select v-model="filterCategory">
                  <option value="">Tất cả</option>
                  <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
            </div>
            <div class="filter-actions">
              <button class="filter-apply-btn" @click="applyFilter">Áp dụng</button>
              <button class="filter-reset-btn" @click="resetFilter">Xóa bộ lọc</button>
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
                    <p>Không có lịch sử đơn hàng</p>
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
                        <span class="material-symbols-outlined">receipt_long</span>
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
        </section>
      </main>
    </div>

    <div v-if="showModal && selectedReceipt" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Chi tiết đơn hàng</h2>
            <p class="modal-id">{{ selectedReceipt.id || selectedReceipt.orderNumber }}</p>
            <p class="modal-date">{{ selectedReceipt.date || selectedReceipt.orderDate }}</p>
          </div>
          <button class="modal-close-btn" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="modal-products">
          <div
            v-for="item in (selectedReceipt.orderItems || selectedReceipt.items)"
            :key="item.id"
            class="modal-product-item"
          >
            <div class="modal-product-info">
              <h4>{{ item.drink?.name || item.name }}</h4>
              <p>Số lượng: x{{ item.quantity || item.qty }}</p>
            </div>
            <p class="modal-product-price">
               {{ new Intl.NumberFormat('vi-VN').format(item.basePriceAtPurchase || 0) }} đ
            </p>
          </div>
        </div>

        <div class="modal-summary">
          <div class="summary-row">
            <span>Tạm tính</span>
            <span>{{ new Intl.NumberFormat('vi-VN').format(selectedReceipt.originalPrice || 0) }}đ</span>
          </div>
          <div class="summary-row">
            <span>Thuế (10%)</span>
            <span>{{ new Intl.NumberFormat('vi-VN').format(selectedReceipt.taxAmount || 0) }}đ</span>
          </div>
          <div class="summary-row total-row">
            <span>Tổng cộng</span>
            <span class="total-price">{{ new Intl.NumberFormat('vi-VN').format(selectedReceipt.finalPrice || 0) }}đ</span>
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
  activeOrder,
  receipts,
  searchId,
  filterCategory,
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

const auth = useAuthStore();
const router = useRouter();

const user = auth.user;

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<style scoped src="../CSS-USER/UserAccount.CSS"></style>