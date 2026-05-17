<template>
  <div class="cart-page">
    <main class="cart-layout">
      <!-- ── LEFT ── -->
      <section>
        <div class="cart-section-header">
          <h1 class="cart-title">Giỏ Hàng</h1>
          <!-- Thay phần cart-meta-bar -->
          <div class="cart-meta-bar">
            <span class="cart-count">{{ cartItems.length }} sản phẩm</span>
            <div class="meta-bar-actions">
              <label v-if="cartItems.length > 0" class="select-all-label">
                <input type="checkbox" class="custom-checkbox" :checked="isAllSelected"
                  :indeterminate.prop="isSomeSelected && !isAllSelected" @change="toggleSelectAll" />
                Chọn tất cả
              </label>
              <!-- ✅ Luôn hiện nút xóa khi có item trong giỏ -->
              <button v-if="cartItems.length > 0" class="btn-delete-selected" :disabled="selectedIds.length === 0"
                @click="confirmDeleteSelected">
                🗑 Xóa{{
                  selectedIds.length > 0 ? ` (${selectedIds.length})` : ""
                }}
              </button>
            </div>
          </div>
        </div>

        <transition-group name="slide" tag="div" class="cart-list">
          <div v-for="item in cartItems" :key="item.id" class="cart-card"
            :class="{ 'is-selected': isItemSelected(item) }" @click="toggleSelect(item)">
            <div class="card-radio-wrap">
              <input type="checkbox" class="custom-radio" :checked="isItemSelected(item)"
                @change="toggleSelect(item)" />
            </div>
            <div class="card-image-wrap">
              <img :src="item.image" :alt="item.name" loading="lazy" />
            </div>
            <div class="card-body">
              <h1 class="card-name">{{ item.name }}</h1>

              <!-- ✅ Bỏ icon, chỉ để chữ -->
              <div v-if="item.sizeName" class="card-tags">
                <span class="tag tag-size">Size {{ item.sizeName }}</span>
              </div>

              <div class="card-tags" v-if="item.toppings && item.toppings.length">
                <span v-for="(tp, i) in item.toppings" :key="i" class="tag tag-topping">
                  {{ tp }}
                </span>
              </div>

              <div class="card-specs">
                <span class="card-spec">Đường: <strong>{{ item.sugar }}%</strong></span>
                <span class="card-spec">Đá: <strong>{{ item.ice }}%</strong></span>
              </div>
            </div>
            <div class="card-right">
              <div class="card-price">
                {{ formatVND(item.basePrice * item.quantity) }}
              </div>
              <div class="qty-control">
                <button class="qty-btn" :disabled="item.quantity <= 1" @click.stop="decreaseQty(item)">
                  −
                </button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" @click.stop="increaseQty(item)">
                  +
                </button>
              </div>
              <button class="delete-btn" @click.stop="confirmDelete(item)">
                🗑 Xóa
              </button>
            </div>
          </div>
        </transition-group>

        <div v-if="cartItems.length === 0" class="empty-cart">
          <span class="empty-icon">☕</span>
          <p>Giỏ hàng của bạn đang trống.<br />Hãy thêm thức uống yêu thích!</p>
        </div>
      </section>

      <!-- ── RIGHT ── -->
      <aside>
        <div class="order-summary-box">
          <div class="summary-heading">Tóm tắt đơn hàng</div>
          <div class="selected-preview">
            <template v-if="selectedItems.length > 0">
              <!-- ✅ Chi tiết sản phẩm giống hình 3 -->
              <div v-for="item in selectedItems" :key="item.id" class="preview-item">
                <div class="preview-item-inner">
                  <!-- Tên + số lượng sát tên, giá đẩy phải -->
                  <div class="preview-item-header">
                    <div class="preview-name-group">
                      <span class="preview-name">{{ item.name }}</span>
                      <span class="preview-qty-badge">x{{ item.quantity }}</span>
                    </div>
                    <span class="preview-price">{{ formatVND(item.basePrice * item.quantity) }}</span>
                  </div>
                  <!-- Size -->
                  <div v-if="item.sizeName" class="preview-detail-row">
                    <span class="preview-detail-icon">≡</span>
                    <span class="preview-detail-label">Size {{ item.sizeName }}</span>
                    <span class="preview-detail-price" v-if="item.sizePrice > 0">+{{ formatVND(item.sizePrice) }}</span>
                    <span class="preview-detail-price free" v-else>+0 đ</span>
                  </div>
                  <!-- Từng topping riêng -->
                  <div v-for="(tp, i) in item.toppingDetails" :key="i" class="preview-detail-row">
                    <span class="preview-detail-icon">+</span>
                    <span class="preview-detail-label">{{ tp.name }}</span>
                    <span class="preview-detail-price" v-if="tp.price > 0">+{{ formatVND(tp.price) }}</span>
                    <span class="preview-detail-price free" v-else>+0 đ</span>
                  </div>
                  <!-- Đường / Đá -->
                  <div class="preview-badges">
                    <span class="preview-badge sugar">Đường {{ item.sugar }}%</span>
                    <span class="preview-badge ice">Đá {{ item.ice }}%</span>
                  </div>
                </div>
              </div>
            </template>
            <p v-else class="preview-empty">Chưa chọn sản phẩm nào</p>
          </div>
          <div class="summary-rows">
            <div class="summary-row">
              <span>Tạm tính</span>
              <span>{{ formatVND(selectedSubtotal) }}</span>
            </div>
            <div class="summary-row" v-if="couponApplied">
              <span class="text-success">Giảm giá</span>
              <span class="text-success">-{{ formatVND(couponDiscount) }}</span>
            </div>
            <div class="summary-row">
              <span>Phí giao hàng</span>
              <span>{{
                shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee)
              }}</span>
            </div>
            <div class="summary-row total">
              <span>Tổng cộng</span>
              <span class="amount">{{ formatVND(grandTotal) }}</span>
            </div>
          </div>
          <button class="btn-checkout" :disabled="selectedItems.length === 0" @click="openCustomerInfoModal">
            <span>Mua hàng</span><span>→</span>
          </button>
        </div>
      </aside>
    </main>

    <!-- ══ CONFIRM XÓA 1 ══ -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="deleteTarget" class="overlay" @click.self="cancelDelete">
          <div class="confirm-dialog">
            <div class="confirm-icon">🗑️</div>
            <div class="confirm-title">Xóa sản phẩm?</div>
            <p class="confirm-msg">
              Bạn có chắc muốn xóa
              <span class="confirm-product-name">"{{ deleteTarget.name }}"</span>
              không?
            </p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="cancelDelete">Hủy bỏ</button>
              <button class="btn-confirm-delete" @click="executeDelete">
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ══ CONFIRM XÓA NHIỀU ══ -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showDeleteSelected" class="overlay" @click.self="cancelDeleteSelected">
          <div class="confirm-dialog">
            <div class="confirm-icon">🗑️</div>
            <div class="confirm-title">
              Xóa {{ selectedIds.length }} sản phẩm?
            </div>
            <p class="confirm-msg">
              Bạn có chắc muốn xóa
              <span class="confirm-product-name">{{ selectedIds.length }} sản phẩm đã chọn</span>
              không?
            </p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="cancelDeleteSelected">
                Hủy bỏ
              </button>
              <button class="btn-confirm-delete" @click="executeDeleteSelected">
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ══ POPUP 1: THÔNG TIN KHÁCH HÀNG ══ -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showCustomerInfoModal" class="modal-overlay" @click.self="closeCustomerInfoModal">
          <div class="modal-box">
            <div class="modal-header">
              <div class="modal-nav-placeholder"></div>
              <div class="modal-title">THÔNG TIN GIAO HÀNG</div>
              <button class="modal-nav-btn modal-close-btn" @click="closeCustomerInfoModal">
                ✕
              </button>
            </div>

            <div class="modal-body">
              <div class="modal-section">
                <div class="modal-section-label">Thông tin người nhận</div>
                <div class="customer-info-form">
                  <div class="form-field">
                    <label>Họ và tên <span class="required">*</span></label>
                    <input v-model="customerInfoName" type="text" placeholder="Nhập họ và tên..." :class="[
                      'form-input',
                      { 'form-input--error': customerInfoErrors.name },
                    ]" />
                    <span v-if="customerInfoErrors.name" class="form-error">{{
                      customerInfoErrors.name
                    }}</span>
                  </div>

                  <div class="form-field">
                    <label>Số điện thoại <span class="required">*</span></label>
                    <input v-model="customerInfoPhone" type="tel" inputmode="numeric"
                      placeholder="Nhập số điện thoại..." maxlength="10" :class="[
                        'form-input',
                        { 'form-input--error': customerInfoErrors.phone },
                      ]" @input="onCustomerPhoneInput" />
                    <span v-if="customerInfoErrors.phone" class="form-error">{{
                      customerInfoErrors.phone
                    }}</span>
                  </div>

                  <div class="form-field">
                    <label>Địa chỉ giao hàng <span class="required">*</span></label>
                    <textarea v-model="customerInfoAddress" rows="3"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..." :class="[
                        'form-input form-textarea',
                        { 'form-input--error': customerInfoErrors.address },
                      ]">
                </textarea>
                    <span v-if="customerInfoErrors.address" class="form-error">{{ customerInfoErrors.address }}</span>
                  </div>

                  <div class="form-field">
                    <label>Ghi chú đơn hàng</label>
                    <textarea v-model="orderNote" rows="2"
                      placeholder="Ví dụ: ít đá hơn, không đường, giao trước 12h..." class="form-input form-textarea">
                </textarea>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <div class="grand-total-row">
                <span class="gt-label">Tổng thanh toán</span>
                <span class="gt-amount">{{ formatVND(grandTotal) }}</span>
              </div>
              <button class="btn-place-order" @click="submitCustomerInfo">
                Tiếp tục →
              </button>
              <p class="modal-terms">
                Vui lòng kiểm tra thông tin trước khi tiếp tục.
              </p>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ══ POPUP 2: XÁC NHẬN ĐƠN HÀNG ══ -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showOrderModal" class="modal-overlay" @click.self="closeOrderModal">
          <div class="modal-box">
            <div class="modal-header">
              <button class="modal-nav-btn" @click="backToCustomerInfo">
                ←
              </button>
              <div class="modal-title">XEM LẠI ĐƠN HÀNG</div>
              <button class="modal-nav-btn modal-close-btn" @click="closeOrderModal">
                ✕
              </button>
            </div>

            <div class="modal-body">
              <!-- Thông tin giao hàng -->
              <div class="modal-section">
                <div class="modal-section-label">Thông tin giao hàng</div>
                <div class="delivery-info-box">
                  <div class="delivery-info-row">
                    <span class="di-label">Người nhận</span>
                    <span class="di-val">{{ customerInfoName }}</span>
                  </div>
                  <div class="delivery-info-row">
                    <span class="di-label">Số điện thoại</span>
                    <span class="di-val">{{ customerInfoPhone }}</span>
                  </div>
                  <div class="delivery-info-row">
                    <span class="di-label">Địa chỉ</span>
                    <span class="di-val">{{ customerInfoAddress }}</span>
                  </div>
                  <div v-if="orderNote" class="delivery-info-row">
                    <span class="di-label">Ghi chú</span>
                    <span class="di-val di-note">{{ orderNote }}</span>
                  </div>
                </div>
              </div>

              <!-- ✅ Sản phẩm – chi tiết giống hình 3 -->
              <div class="modal-section">
                <div class="modal-section-label">Sản phẩm của bạn</div>
                <div v-for="item in selectedItems" :key="item.id" class="modal-order-item">
                  <!-- Header: tên + qty badge sát tên + giá đẩy phải -->
                  <div class="moi-header">
                    <div class="moi-name-group">
                      <div class="moi-name">{{ item.name }}</div>
                      <div class="moi-qty-badge">x{{ item.quantity }}</div>
                    </div>
                    <div class="moi-price">{{ formatVND(item.basePrice * item.quantity) }}</div>
                  </div>
                  <!-- Size -->
                  <div v-if="item.sizeName" class="moi-detail-row">
                    <span class="moi-detail-icon">≡</span>
                    <span class="moi-detail-label">Size {{ item.sizeName }}</span>
                    <span class="moi-detail-price" v-if="item.sizePrice > 0">+{{ formatVND(item.sizePrice) }}</span>
                    <span class="moi-detail-price free" v-else>+0 đ</span>
                  </div>
                  <!-- Từng topping riêng với giá -->
                  <div v-for="(tp, i) in item.toppingDetails" :key="i" class="moi-detail-row">
                    <span class="moi-detail-icon">+</span>
                    <span class="moi-detail-label">{{ tp.name }}</span>
                    <span class="moi-detail-price" v-if="tp.price > 0">+{{ formatVND(tp.price) }}</span>
                    <span class="moi-detail-price free" v-else>+0 đ</span>
                  </div>
                  <!-- Đường / Đá badges -->
                  <div class="moi-badges">
                    <span class="moi-badge sugar">Đường {{ item.sugar }}%</span>
                    <span class="moi-badge ice">Đá {{ item.ice }}%</span>
                  </div>
                </div>
              </div>

              <!-- ✅ Mã giảm giá – căn giữa -->
              <div class="modal-section">
                <div class="modal-section-label">Khuyến mãi</div>
                <div class="coupon-center-wrapper">
                  <div class="coupon-wrap-centered">
                    <select v-model="couponCode" class="coupon-select" :disabled="couponApplied">
                      <option value="">-- Chọn mã khuyến mãi --</option>
                      <option value="CAFE10">CAFE10 — Giảm 10% đơn hàng</option>
                      <option value="FREESHIP">
                        FREESHIP — Miễn phí vận chuyển
                      </option>
                    </select>
                    <button class="btn-apply-coupon" @click="couponApplied ? removeCoupon() : applyCoupon()">
                      {{ couponApplied ? "Hủy" : "Áp dụng" }}
                    </button>
                  </div>
                  <div v-if="couponMessage" class="coupon-feedback-centered" :class="couponApplied ? 'success' : 'error'">
                    {{ couponMessage }}
                  </div>
                </div>
              </div>

              <!-- Phương thức thanh toán -->
              <div class="modal-section">
                <div class="modal-section-label">Phương thức thanh toán</div>
                <div class="payment-methods">
                  <div class="payment-option" :class="{ active: paymentMethod === 'COD' }"
                    @click="paymentMethod = 'COD'">
                    <span class="payment-icon">🛵</span>
                    <span class="payment-label">COD</span>
                    <span class="payment-sub">Thanh toán khi nhận</span>
                  </div>
                  <div class="payment-option payment-option--momo" :class="{ active: paymentMethod === 'MOMO' }"
                    @click="openMomoFlow">
                    <img src="../IMG/logoMOMO.png" class="momo-option-logo" alt="MoMo"
                      onerror="this.style.display = 'none'" />
                    <span class="payment-label">MoMo</span>
                    <span class="payment-sub">Ví điện tử MoMo</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <div class="grand-total-row">
                <span class="gt-label">Tổng thanh toán</span>
                <span class="gt-amount">{{ formatVND(grandTotal) }}</span>
              </div>
              <button class="btn-place-order" @click="placeOrder" :disabled="isPlacingOrder">
                {{ isPlacingOrder ? "Đang xử lý..." : "✓ Xác nhận đặt hàng" }}
              </button>
              <p class="modal-terms">
                Bằng cách nhấn xác nhận, bạn đồng ý với điều khoản dịch vụ.
              </p>
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
            <img src="../IMG/DripLab_Logo.png" class="success-logo-big" />
            <div class="success-title">Đặt hàng thành công!</div>
            <div class="success-order-id">Mã đơn: {{ lastOrderId }}</div>
            <p class="success-msg">Cảm ơn bạn đã tin tưởng Drip Lab!</p>
            <button class="btn-success-ok" @click="closeSuccessModal">
              Hoàn tất
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ══ MOMO POPUP MỚI ══ -->
    <MomoPopup :visible="showMomoQR" :amount="grandTotal"
      :orderInfo="`Thanh toan DripLab - ${customerInfoName || 'Khach hang'}`" @close="closeMomoQR" @paid="onMomoPaid" />
  </div>
</template>

<script src="../JS-USER/Cart.js"></script>
<style src="../CSS-USER/Cart.CSS"></style>