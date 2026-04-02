<template>
  <div class="cart-page">

    <!-- ══════════════════════════════════════════
         MAIN LAYOUT
    ══════════════════════════════════════════ -->
    <main class="cart-layout">

      <!-- ── LEFT: DANH SÁCH GIỎ HÀNG ── -->
      <section>
        <div class="cart-section-header">
          <h1 class="cart-title">Giỏ Hàng</h1>

          <div class="cart-meta-bar">
            <span class="cart-count">{{ cartItems.length }} sản phẩm</span>

            <!-- Chọn tất cả -->
            <label v-if="cartItems.length > 0" class="select-all-label">
              <input type="checkbox" class="custom-checkbox" :checked="isAllSelected"
                :indeterminate.prop="isSomeSelected && !isAllSelected" @change="toggleSelectAll" />
              Chọn tất cả
            </label>
          </div>
        </div>

        <!-- Danh sách sản phẩm -->
        <transition-group name="slide" tag="div" class="cart-list">
          <div v-for="item in cartItems" :key="item.id" class="cart-card"
            :class="{ 'is-selected': selectedIds.includes(item.id) }">
            <!-- Radio chọn -->
            <div class="card-radio-wrap">
              <input type="checkbox" class="custom-radio" :checked="selectedIds.includes(item.id)"
                @change="toggleSelect(item.id)" />
            </div>

            <!-- Ảnh sản phẩm -->
            <div class="card-image-wrap">
              <img :src="item.image" :alt="item.name" loading="lazy" />
            </div>

            <!-- Thông tin sản phẩm -->
            <div class="card-body">
              <h1 class="card-name">{{ item.name }}</h1>

              <!-- Toppings -->
              <div class="card-tags" v-if="item.toppings && item.toppings.length">
                <span v-for="(tp, i) in item.toppings" :key="i" class="tag tag-topping">🧋 {{ tp }}</span>
              </div>

              <!-- Đường & đá -->
              <div class="card-specs">
                <span class="card-spec">
                  <span class="spec-icon">🍬</span>
                  <span>Đường: <strong>{{ item.sugar }}</strong></span>
                </span>
                <span class="card-spec">
                  <span class="spec-icon">🧊</span>
                  <span>Đá: <strong>{{ item.ice }}</strong></span>
                </span>
              </div>
            </div>

            <!-- Giá & điều chỉnh -->
            <div class="card-right">
              <div class="card-price">
                {{ formatVND(item.basePrice * item.quantity) }}
              </div>

              <div class="qty-control">
                <button class="qty-btn" :disabled="item.quantity <= 1" @click="decreaseQty(item)"
                  aria-label="Giảm số lượng">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" @click="increaseQty(item)" aria-label="Tăng số lượng">+</button>
              </div>

              <button class="delete-btn" @click="confirmDelete(item)">
                🗑 Xóa
              </button>
            </div>
          </div>
        </transition-group>

        <!-- Giỏ trống -->
        <div v-if="cartItems.length === 0" class="empty-cart">
          <span class="empty-icon">☕</span>
          <p>Giỏ hàng của bạn đang trống.<br />Hãy thêm thức uống yêu thích!</p>
        </div>
      </section>

      <!-- ── RIGHT: ĐƠN HÀNG ── -->
      <aside>
        <div class="order-summary-box">
          <div class="summary-heading">
            📋 Tóm tắt đơn hàng
          </div>

          <div class="selected-preview">
            <template v-if="selectedItems.length > 0">
              <div v-for="item in selectedItems" :key="item.id" class="preview-item">
                <div class="preview-name">
                  {{ item.name }}
                  <div class="preview-qty">x{{ item.quantity }}</div>
                </div>
                <div class="preview-price">{{ formatVND(item.basePrice * item.quantity) }}</div>
              </div>
            </template>
            <p v-else class="preview-empty">Chưa chọn sản phẩm nào</p>
          </div>

          <div class="summary-rows">
            <div class="summary-row">
              <span>Tạm tính</span>
              <span>{{ formatVND(selectedSubtotal) }}</span>
            </div>
            <div class="summary-row">
              <span>Phí giao hàng</span>
              <span>{{ selectedSubtotal >= 100000 ? formatVND(20000) : 'Miễn phí' }}</span>
            </div>
            <div class="summary-row total">
              <span>Tổng cộng</span>
              <span class="amount">{{ formatVND(selectedTotal) }}</span>
            </div>
          </div>

          <button class="btn-checkout" :disabled="selectedItems.length === 0" @click="openOrderModal">
            <span>Mua hàng</span>
            <span>→</span>
          </button>
        </div>
      </aside>
    </main>

    <!-- ══════════════════════════════════════════
         CONFIRM XÓA
    ══════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="deleteTarget" class="overlay" @click.self="cancelDelete">
          <div class="confirm-dialog">
            <div class="confirm-icon">🗑️</div>
            <div class="confirm-title">Xóa sản phẩm?</div>
            <p class="confirm-msg">
              Bạn có chắc muốn xóa
              <span class="confirm-product-name">"{{ deleteTarget.name }}"</span>
              khỏi giỏ hàng không?
            </p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="cancelDelete">Hủy bỏ</button>
              <button class="btn-confirm-delete" @click="executeDelete">Xóa ngay</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ══════════════════════════════════════════
         ORDER REVIEW MODAL
    ══════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showOrderModal" class="modal-overlay" @click.self="closeOrderModal">
          <div class="modal-box">

            <div class="modal-header">
              <div class="modal-title">Xem lại đơn hàng</div>
              <button class="modal-close-btn" @click="closeOrderModal">✕</button>
            </div>

            <div class="modal-body">

              <div class="modal-section">
                <div class="modal-section-label">Sản phẩm của bạn</div>
                <div v-for="item in selectedItems" :key="item.id" class="modal-order-item">
                  <div class="moi-info">
                    <div class="moi-name">{{ item.name }}</div>
                    <div class="moi-detail">
                      x{{ item.quantity }} • Đường {{ item.sugar }} • Đá {{ item.ice }}
                      <template v-if="item.toppings && item.toppings.length">
                        • {{ item.toppings.join(', ') }}
                      </template>
                    </div>
                  </div>
                  <div class="moi-price">{{ formatVND(item.basePrice * item.quantity) }}</div>
                </div>
              </div>

              <div class="modal-section">
                <div class="modal-section-label">Mã giảm giá</div>
                <div class="coupon-wrap">
                  <input class="coupon-input" type="text" v-model="couponCode" placeholder="Nhập mã giảm giá..."
                    @keyup.enter="applyCoupon" :disabled="couponApplied" />
                  <button class="btn-apply-coupon" @click="couponApplied ? removeCoupon() : applyCoupon()">
                    {{ couponApplied ? 'Hủy mã' : 'Áp dụng' }}
                  </button>
                </div>
                <div v-if="couponMessage" class="coupon-feedback" :class="couponApplied ? 'success' : 'error'">
                  {{ couponMessage }}
                </div>
              </div>

              <div class="modal-section">
                <div class="modal-section-label">Phương thức thanh toán</div>
                <div class="payment-methods">
                  <div class="payment-option" :class="{ active: paymentMethod === 'COD' }"
                    @click="paymentMethod = 'COD'">
                    <span class="payment-icon">🚚</span>
                    <span class="payment-label">COD</span>
                    <span class="payment-sub">Thanh toán khi nhận</span>
                  </div>
                  <div class="payment-option" :class="{ active: paymentMethod === 'TRANSFER' }"
                    @click="paymentMethod = 'TRANSFER'; resetTransfer()">
                    <span class="payment-icon">📱</span>
                    <span class="payment-label">Chuyển khoản</span>
                    <span class="payment-sub">QR / Internet Banking</span>
                  </div>
                </div>

                <!-- ── TRANSFER: Giống MoMo bên CounterOrder ── -->
                <div v-if="paymentMethod === 'TRANSFER'" class="transfer-section">

                  <!-- Header chuyển khoản -->
                  <div class="transfer-header">
                    <span class="transfer-header-icon">📱</span>
                    <div>
                      <p class="transfer-brand">Chuyển khoản ngân hàng</p>
                      <p class="transfer-amount">{{ formatVND(grandTotal) }}</p>
                    </div>
                  </div>

                  <!-- Bước 1: Nhập SĐT -->
                  <div v-if="transferStep === 1" class="transfer-body">
                    <p class="transfer-label">Số điện thoại / STK người nhận</p>
                    <div class="transfer-input-wrap" :class="{
                      loading: transferLoading,
                      found: transferName,
                      error: transferError
                    }">
                      <span class="transfer-input-prefix">🇻🇳 +84</span>
                      <input :value="transferPhone" @input="onTransferPhoneInput" type="tel" inputmode="numeric"
                        placeholder="Nhập số điện thoại..." class="transfer-input" maxlength="10" />
                      <span v-if="transferLoading" class="transfer-status-icon spin">⟳</span>
                      <span v-else-if="transferName" class="transfer-status-icon green">✓</span>
                      <span v-else-if="transferError" class="transfer-status-icon red">✕</span>
                    </div>

                    <transition name="slide-down">
                      <div v-if="transferName" class="transfer-found-card">
                        <div class="transfer-avatar">{{ transferName.charAt(0) }}</div>
                        <div class="transfer-found-info">
                          <p class="transfer-found-name">{{ transferName }}</p>
                          <p class="transfer-found-phone">{{ transferPhone }}</p>
                        </div>
                        <span class="transfer-verified">✓ Đã xác thực</span>
                      </div>
                    </transition>

                    <p v-if="transferError" class="transfer-error-msg">{{ transferError }}</p>
                  </div>

                  <!-- Bước 2: Xác nhận -->
                  <div v-else class="transfer-body">
                    <div class="transfer-processing-label">
                      <span class="transfer-processing-dot"></span>
                      Giao dịch đang được xử lý
                    </div>
                    <div class="transfer-confirm-card">
                      <div class="transfer-confirm-row">
                        <span class="transfer-confirm-label">Người nhận</span>
                        <span class="transfer-confirm-val">{{ transferName }}</span>
                      </div>
                      <div class="transfer-confirm-row">
                        <span class="transfer-confirm-label">Số điện thoại</span>
                        <span class="transfer-confirm-val">{{ transferPhone }}</span>
                      </div>
                      <div class="transfer-confirm-row">
                        <span class="transfer-confirm-label">Số tiền</span>
                        <span class="transfer-confirm-val bold blue">{{ formatVND(grandTotal) }}</span>
                      </div>
                      <div class="transfer-confirm-row">
                        <span class="transfer-confirm-label">Nội dung</span>
                        <span class="transfer-confirm-val">Cà Phê Nhà - Thanh toán đơn hàng</span>
                      </div>
                    </div>
                  </div>

                </div>
                <!-- ── /TRANSFER ── -->

              </div>
            </div>

            <div class="modal-footer">
              <div class="grand-total-row">
                <span class="gt-label">Tổng thanh toán</span>
                <span class="gt-amount">{{ formatVND(grandTotal) }}</span>
              </div>

              <!-- Footer actions tuỳ bước -->
              <template v-if="paymentMethod === 'TRANSFER'">
                <div v-if="transferStep === 1" class="transfer-footer-btns">
                  <button class="btn-place-order" @click="confirmTransferReceiver" :disabled="!transferName">
                    Tiếp tục →
                  </button>
                </div>
                <div v-else class="transfer-footer-btns">
                  <button class="btn-back-transfer" @click="backTransfer">← Quay lại</button>
                  <button class="btn-place-order" @click="placeOrder" :disabled="isPlacingOrder">
                    {{ isPlacingOrder ? '⏳ Đang xử lý...' : '✓ Xác nhận đặt hàng' }}
                  </button>
                </div>
              </template>
              <template v-else>
                <button class="btn-place-order" @click="placeOrder" :disabled="isPlacingOrder">
                  {{ isPlacingOrder ? '⏳ Đang xử lý...' : '✓ Xác nhận đặt hàng' }}
                </button>
              </template>

              <p class="modal-terms">Bằng cách nhấn xác nhận, bạn đồng ý với điều khoản dịch vụ của chúng tôi.</p>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ══════════════════════════════════════════
         SUCCESS MODAL
    ══════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showSuccessModal" class="modal-overlay">
          <div class="success-modal">
            <span class="success-icon">🎉</span>
            <div class="success-title">Đặt hàng thành công!</div>
            <div class="success-order-id">Mã đơn: {{ lastOrderId }}</div>
            <p class="success-msg">
              Cảm ơn bạn đã tin tưởng Cà Phê Nhà! Chúng tôi sẽ xác nhận và giao hàng sớm nhất có thể ☕
            </p>
            <button class="btn-success-ok" @click="closeSuccessModal">Hoàn tất</button>
          </div>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<script src="../JS-USER/Cart.js"></script>

<style src="../CSS-USER/Cart.CSS"></style>