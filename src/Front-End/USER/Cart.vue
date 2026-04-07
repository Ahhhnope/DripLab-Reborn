<template>
  <div class="cart-page">

    <main class="cart-layout">

      <!-- ── LEFT: DANH SÁCH GIỎ HÀNG ── -->
      <section>
        <div class="cart-section-header">
          <h1 class="cart-title">Giỏ Hàng</h1>
          <div class="cart-meta-bar">
            <span class="cart-count">{{ cartItems.length }} sản phẩm</span>
            <label v-if="cartItems.length > 0" class="select-all-label">
              <input type="checkbox" class="custom-checkbox" :checked="isAllSelected"
                :indeterminate.prop="isSomeSelected && !isAllSelected" @change="toggleSelectAll" />
              Chọn tất cả
            </label>
          </div>
        </div>

        <transition-group name="slide" tag="div" class="cart-list">
          <div v-for="item in cartItems" :key="item.id" class="cart-card"
            :class="{ 'is-selected': selectedIds.includes(item.id) }" @click="toggleSelect(item.id)">
            <div class="card-radio-wrap">
              <input type="checkbox" class="custom-radio" :checked="selectedIds.includes(item.id)" @change="toggleSelect(item.id)" />
            </div>
            <div class="card-image-wrap">
              <img :src="item.image" :alt="item.name" loading="lazy" />
            </div>
            <div class="card-body">
              <h1 class="card-name">{{ item.name }}</h1>
              <div class="card-tags" v-if="item.toppings && item.toppings.length">
                <span v-for="(tp, i) in item.toppings" :key="i" class="tag tag-topping">🧋 {{ tp }}</span>
              </div>
              <div class="card-specs">
                <span class="card-spec"><span class="spec-icon">🍬</span><span>Đường: <strong>{{ item.sugar }}</strong></span></span>
                <span class="card-spec"><span class="spec-icon">🧊</span><span>Đá: <strong>{{ item.ice }}</strong></span></span>
              </div>
            </div>
            <div class="card-right">
              <div class="card-price">{{ formatVND(item.basePrice * item.quantity) }}</div>
              <div class="qty-control">
                <button class="qty-btn" :disabled="item.quantity <= 1" @click.stop="decreaseQty(item)">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" @click.stop="increaseQty(item)">+</button>
              </div>
              <button class="delete-btn" @click.stop="confirmDelete(item)">🗑 Xóa</button>
            </div>
          </div>
        </transition-group>

        <div v-if="cartItems.length === 0" class="empty-cart">
          <span class="empty-icon">☕</span>
          <p>Giỏ hàng của bạn đang trống.<br />Hãy thêm thức uống yêu thích!</p>
        </div>
      </section>

      <!-- ── RIGHT: ĐƠN HÀNG ── -->
      <aside>
        <div class="order-summary-box">
          <div class="summary-heading">📋 Tóm tắt đơn hàng</div>
          <div class="selected-preview">
            <template v-if="selectedItems.length > 0">
              <div v-for="item in selectedItems" :key="item.id" class="preview-item">
                <div class="preview-name">{{ item.name }}<div class="preview-qty">x{{ item.quantity }}</div></div>
                <div class="preview-price">{{ formatVND(item.basePrice * item.quantity) }}</div>
              </div>
            </template>
            <p v-else class="preview-empty">Chưa chọn sản phẩm nào</p>
          </div>
          <div class="summary-rows">
            <div class="summary-row"><span>Tạm tính</span><span>{{ formatVND(selectedSubtotal) }}</span></div>
            <div class="summary-row"><span>Phí giao hàng</span><span>{{ selectedSubtotal >= 100000 ? formatVND(20000) : 'Miễn phí' }}</span></div>
            <div class="summary-row total"><span>Tổng cộng</span><span class="amount">{{ formatVND(selectedTotal) }}</span></div>
          </div>
          <button class="btn-checkout" :disabled="selectedItems.length === 0" @click="openOrderModal">
            <span>Mua hàng</span><span>→</span>
          </button>
        </div>
      </aside>
    </main>

    <!-- ══ CONFIRM XÓA ══ -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="deleteTarget" class="overlay" @click.self="cancelDelete">
          <div class="confirm-dialog">
            <div class="confirm-icon">🗑️</div>
            <div class="confirm-title">Xóa sản phẩm?</div>
            <p class="confirm-msg">Bạn có chắc muốn xóa <span class="confirm-product-name">"{{ deleteTarget.name }}"</span> khỏi giỏ hàng không?</p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="cancelDelete">Hủy bỏ</button>
              <button class="btn-confirm-delete" @click="executeDelete">Xóa ngay</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ══ ORDER MODAL ══ -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showOrderModal" class="modal-overlay" @click.self="closeOrderModal">
          <div class="modal-box">

            <!-- Header -->
            <div class="modal-header">
              <button v-if="paymentMethod === 'MOMO'" class="modal-back-btn" @click="backToPaymentSelect">←</button>
              <div v-else style="width:36px"></div>
              <div class="modal-title">
                {{ paymentMethod === 'MOMO' ? 'Thanh toán MoMo' : 'Xem lại đơn hàng' }}
              </div>
              <button class="modal-close-btn" @click="closeOrderModal">✕</button>
            </div>

            <!-- Body -->
            <div class="modal-body">

              <!-- ── MÀN HÌNH BÌNH THƯỜNG ── -->
              <template v-if="paymentMethod !== 'MOMO'">

                <div class="modal-section">
                  <div class="modal-section-label">Sản phẩm của bạn</div>
                  <div v-for="item in selectedItems" :key="item.id" class="modal-order-item">
                    <div class="moi-info">
                      <div class="moi-name">{{ item.name }}</div>
                      <div class="moi-detail">x{{ item.quantity }} • Đường {{ item.sugar }} • Đá {{ item.ice }}<template v-if="item.toppings && item.toppings.length"> • {{ item.toppings.join(', ') }}</template></div>
                    </div>
                    <div class="moi-price">{{ formatVND(item.basePrice * item.quantity) }}</div>
                  </div>
                </div>

                <div class="modal-section">
                  <div class="modal-section-label">Mã giảm giá</div>
                  <div class="coupon-wrap">
                    <input class="coupon-input" type="text" v-model="couponCode" placeholder="Nhập mã giảm giá..." @keyup.enter="applyCoupon" :disabled="couponApplied" />
                    <button class="btn-apply-coupon" @click="couponApplied ? removeCoupon() : applyCoupon()">{{ couponApplied ? 'Hủy mã' : 'Áp dụng' }}</button>
                  </div>
                  <div v-if="couponMessage" class="coupon-feedback" :class="couponApplied ? 'success' : 'error'">{{ couponMessage }}</div>
                </div>

                <div class="modal-section">
                  <div class="modal-section-label">Phương thức thanh toán</div>
                  <div class="payment-methods">
                    <!-- COD: xe máy -->
                    <div class="payment-option" :class="{ active: paymentMethod === 'COD' }" @click="paymentMethod = 'COD'">
                      <span class="payment-icon">🛵</span>
                      <span class="payment-label">COD</span>
                      <span class="payment-sub">Thanh toán khi nhận</span>
                    </div>
                    <!-- MoMo -->
                    <div class="payment-option payment-option--momo" :class="{ active: paymentMethod === 'MOMO' }" @click="openMomoFlow">
                      <img src="../IMG/logoMOMO.png" class="momo-option-logo" alt="MoMo" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />
                      <span class="momo-option-fallback" style="display:none;font-size:1.8rem">📱</span>
                      <span class="payment-label">MoMo</span>
                      <span class="payment-sub">Ví điện tử MoMo</span>
                    </div>
                  </div>
                </div>

              </template>

              <!-- ── MÀN HÌNH MOMO (thay thế toàn bộ body) ── -->
              <template v-else>

                <!-- Header MoMo – giống CounterOrder -->
                <div class="momo-header">
                  <img src="../IMG/logoMOMO.png" class="momo-logo" alt="MoMo"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
                  <div class="momo-logo-fallback" style="display:none;width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,#d63f7a,#ae2d68);align-items:center;justify-content:center;font-size:22px;flex-shrink:0">📱</div>
                  <div>
                    <p class="momo-brand">Ví MoMo</p>
                    <p class="momo-amount">{{ formatVND(grandTotal) }}</p>
                  </div>
                </div>

                <!-- Bước 1: Nhập SĐT -->
                <div v-if="momoStep === 1" class="momo-body">
                  <p class="momo-label">Số điện thoại người nhận</p>
                  <div class="momo-input-wrap" :class="{ loading: momoLoading, found: momoName, error: momoError }">
                    <span class="momo-input-prefix">🇻🇳 +84</span>
                    <input :value="momoPhone" @input="onMomoPhoneInput" type="tel" inputmode="numeric"
                      placeholder="Nhập số điện thoại..." class="momo-input" maxlength="10" />
                    <span v-if="momoLoading" class="momo-status-icon spin">⟳</span>
                    <span v-else-if="momoName" class="momo-status-icon green">✓</span>
                    <span v-else-if="momoError" class="momo-status-icon red">✕</span>
                  </div>
                  <transition name="slide-down">
                    <div v-if="momoName" class="momo-found-card">
                      <div class="momo-avatar">{{ momoName.charAt(0) }}</div>
                      <div class="momo-found-info">
                        <p class="momo-found-name">{{ momoName }}</p>
                        <p class="momo-found-phone">{{ momoPhone }}</p>
                      </div>
                      <span class="momo-verified">✓ Đã xác thực</span>
                    </div>
                  </transition>
                  <p v-if="momoError" class="momo-error-msg">{{ momoError }}</p>
                </div>

                <!-- Bước 2: Xác nhận -->
                <div v-else class="momo-body">
                  <div class="momo-processing-label">
                    <span class="momo-processing-dot"></span>
                    Giao dịch đang được xử lý
                  </div>
                  <div class="momo-confirm-card">
                    <div class="momo-confirm-row"><span class="momo-confirm-label">Người nhận</span><span class="momo-confirm-val">{{ momoName }}</span></div>
                    <div class="momo-confirm-row"><span class="momo-confirm-label">Số điện thoại</span><span class="momo-confirm-val">{{ momoPhone }}</span></div>
                    <div class="momo-confirm-row"><span class="momo-confirm-label">Số tiền</span><span class="momo-confirm-val bold pink">{{ formatVND(grandTotal) }}</span></div>
                    <div class="momo-confirm-row"><span class="momo-confirm-label">Nội dung</span><span class="momo-confirm-val">Cà Phê Nhà - Thanh toán đơn hàng</span></div>
                  </div>
                </div>

              </template>
            </div><!-- /modal-body -->

            <!-- Footer -->
            <div class="modal-footer">
              <div class="grand-total-row">
                <span class="gt-label">Tổng thanh toán</span>
                <span class="gt-amount">{{ formatVND(grandTotal) }}</span>
              </div>

              <!-- COD -->
              <template v-if="paymentMethod === 'COD'">
                <button class="btn-place-order" @click="placeOrder" :disabled="isPlacingOrder">
                  {{ isPlacingOrder ? '⏳ Đang xử lý...' : '✓ Xác nhận đặt hàng' }}
                </button>
              </template>

              <!-- MoMo bước 1 -->
              <template v-else-if="paymentMethod === 'MOMO' && momoStep === 1">
                <button class="btn-place-order btn-momo" :disabled="!momoName" :class="{ disabled: !momoName }" @click="confirmMomoReceiver">
                  Tiếp tục →
                </button>
              </template>

              <!-- MoMo bước 2 -->
              <template v-else-if="paymentMethod === 'MOMO' && momoStep === 2">
                <button class="btn-place-order btn-momo" @click="placeOrder" :disabled="isPlacingOrder">
                  {{ isPlacingOrder ? '⏳ Đang xử lý...' : 'Xác nhận thanh toán' }}
                </button>
              </template>

              <p class="modal-terms">Bằng cách nhấn xác nhận, bạn đồng ý với điều khoản dịch vụ của chúng tôi.</p>
            </div>

          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ══ SUCCESS MODAL ══ -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showSuccessModal" class="modal-overlay">
          <div class="success-modal">
            <span class="success-icon">🎉</span>
            <div class="success-title">Đặt hàng thành công!</div>
            <div class="success-order-id">Mã đơn: {{ lastOrderId }}</div>
            <p class="success-msg">Cảm ơn bạn đã tin tưởng Cà Phê Nhà! Chúng tôi sẽ xác nhận và giao hàng sớm nhất có thể ☕</p>
            <button class="btn-success-ok" @click="closeSuccessModal">Hoàn tất</button>
          </div>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<script src="../JS-USER/Cart.js"></script>
<style src="../CSS-USER/Cart.CSS"></style>