<template>
  <div class="account-wrapper">
    <div class="account-inner">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-profile">
          <div class="avatar-ring">
            <img :src="user.avatar" alt="Avatar" class="avatar-img" />
          </div>
          <h2 class="sidebar-name">{{ user.name }}</h2>
          <p class="sidebar-role">Premium Member</p>
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
            <span>Logout</span>
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="account-main">
        <!-- Current Order Status -->
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

        <!-- Shipping + Active Order -->
        <div class="order-grid">
          <!-- Shipping Address -->
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

          <!-- Active Order Items -->
          <section class="card">
            <h3 class="card-title">Đơn hàng đang hoạt động</h3>
            <div
              v-for="item in activeOrder"
              :key="item.id"
              class="active-order-item"
            >
              <div class="active-order-info">
                <h4>Mã đơn hàng: {{ item.name }}</h4>
                <div class="active-order-bottom">
                  <div>
                    <p class="active-order-price">{{ item.price }}</p>
                  </div>
                  <button
                    class="view-detail-btn"
                    @click="openModal(item.receiptData)"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Receipts Table -->
        <section class="card receipts-card">
          <div class="receipts-header">
            <h3 class="card-title">Hóa đơn của tôi</h3>
            <button class="filter-btn">
              <span class="material-symbols-outlined">filter_list</span>
              Lọc
            </button>
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
            </div>
            <p class="modal-product-price">{{ item.price }}</p>
          </div>
        </div>

        <div class="modal-summary">
          <div class="summary-row">
            <span>Tổng phụ</span>
            <span>{{ selectedReceipt.subtotal }}</span>
          </div>
          <div class="summary-row">
            <span>Thuế (5%)</span>
            <span>{{ selectedReceipt.tax }}</span>
          </div>
          <div class="summary-row total-row">
            <span>Tổng giá tiền</span>
            <span class="total-price">{{ selectedReceipt.total }}</span>
          </div>
          <button class="modal-close-main-btn" @click="closeModal">
            Close Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserOrders } from "../JS-USER/UserOrders.JS";

const {
  user, navItems, currentRoute,
  orderSteps, progressWidth,
  shipping, activeOrder,
  receipts, hasMore, loadMore,
  showModal, selectedReceipt,
  openModal, closeModal,
  goTo, logout
} = useUserOrders();
</script>

<style scoped src="../CSS-USER/UserAccount.CSS"></style>
