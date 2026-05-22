<template>
  <div class="checkout-page">
    <!-- HEADER BREADCRUMB -->
    <div class="checkout-breadcrumb">
      <button class="back-btn" @click="$router.push('/cart')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Quay lại giỏ hàng
      </button>
      <div class="breadcrumb-steps">
        <span class="step active">Thông tin</span>
        <span class="step-sep">›</span>
        <span class="step" :class="{ active: currentStep === 2 }">Xác nhận</span>
      </div>
    </div>

    <div class="checkout-layout" v-if="!showSuccessModal">
      <!-- ══ LEFT COLUMN ══ -->
      <main class="checkout-main">
        <h1 class="checkout-heading">Thanh toán đơn hàng</h1>

        <!-- ── BƯỚC 1: THÔNG TIN NGƯỜI NHẬN ── -->
        <section class="checkout-section" v-if="currentStep === 1">
          <div class="section-number-title">
            <span class="section-num">1</span>
            <span class="section-title">Thông tin người nhận</span>
          </div>

          <div class="form-grid-2">
            <div class="form-field">
              <label>Họ và tên <span class="required">*</span></label>
              <input v-model="form.name" type="text" placeholder="Nhập họ và tên..."
                :class="['form-input', { 'form-input--error': errors.name }]" />
              <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
            </div>
            <div class="form-field">
              <label>Số điện thoại <span class="required">*</span></label>
              <input v-model="form.phone" type="tel" inputmode="numeric" maxlength="10"
                placeholder="Nhập số điện thoại..."
                :class="['form-input', { 'form-input--error': errors.phone }]"
                @input="onPhoneInput" />
              <span v-if="errors.phone" class="form-error">{{ errors.phone }}</span>
            </div>
          </div>
        </section>

        <!-- ── BƯỚC 1: ĐỊA CHỈ GIAO HÀNG ── -->
        <section class="checkout-section" v-if="currentStep === 1">
          <div class="section-number-title">
            <span class="section-num">2</span>
            <span class="section-title">Địa chỉ giao hàng</span>
          </div>

          <!-- Toggle: Địa chỉ tài khoản / Nhập mới -->
          <div class="address-toggle-row" v-if="savedAddress">
            <button class="addr-tab" :class="{ active: addressMode === 'saved' }"
              @click="addressMode = 'saved'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              Địa chỉ tài khoản
            </button>
            <button class="addr-tab" :class="{ active: addressMode === 'new' }"
              @click="addressMode = 'new'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Nhập địa chỉ mới
            </button>
          </div>

          <!-- Địa chỉ đã lưu -->
          <div v-if="addressMode === 'saved' && savedAddress" class="saved-address-box">
            <div class="saved-addr-badge">Mặc định</div>
            <p class="saved-addr-text">{{ savedAddress }}</p>
            <button class="btn-use-saved" @click="useSavedAddress">Sử dụng địa chỉ này</button>
          </div>

          <!-- Form nhập địa chỉ mới -->
          <div v-if="addressMode === 'new' || !savedAddress" class="address-form-grid">
            <!-- Thành phố (cố định Hà Nội) -->
            <div class="form-field">
              <label>Thành phố / Tỉnh <span class="required">*</span></label>
              <div class="input-static">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                    fill="currentColor" opacity=".25"/>
                  <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
                </svg>
                Hà Nội
              </div>
            </div>

            <!-- Quận / Huyện -->
            <div class="form-field">
              <label>Quận / Huyện <span class="required">*</span></label>
              <select v-model="form.district" class="form-select"
                :class="{ 'form-input--error': errors.district }"
                @change="onDistrictChange">
                <option value="">-- Chọn quận / huyện --</option>
                <option v-for="d in hanoiDistricts" :key="d.name" :value="d.name">
                  {{ d.name }}
                </option>
              </select>
              <span v-if="errors.district" class="form-error">{{ errors.district }}</span>
            </div>

            <!-- Phường / Xã -->
            <div class="form-field">
              <label>Phường / Xã <span class="required">*</span></label>
              <select v-model="form.ward" class="form-select"
                :class="{ 'form-input--error': errors.ward }"
                :disabled="!form.district">
                <option value="">-- Chọn phường / xã --</option>
                <option v-for="w in currentWards" :key="w" :value="w">{{ w }}</option>
              </select>
              <span v-if="errors.ward" class="form-error">{{ errors.ward }}</span>
            </div>

            <!-- Số nhà, tên đường -->
            <div class="form-field form-field--full">
              <label>Số nhà, tên đường <span class="required">*</span></label>
              <input v-model="form.street" type="text"
                placeholder="VD: 123 Phố Huế, Ngõ 45 Kim Mã..."
                :class="['form-input', { 'form-input--error': errors.street }]" />
              <span v-if="errors.street" class="form-error">{{ errors.street }}</span>
            </div>

            <!-- Nút dùng GPS nếu có -->
            <div class="form-field form-field--full" v-if="gpsText">
              <button type="button" class="btn-gps" @click="useGpsAddress">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Dùng vị trí GPS hiện tại
              </button>
            </div>
          </div>

          <span v-if="errors.address" class="form-error form-error--block">{{ errors.address }}</span>
        </section>

        <!-- ── BƯỚC 1: GHI CHÚ ── -->
        <section class="checkout-section" v-if="currentStep === 1">
          <div class="form-field">
            <label>Ghi chú đơn hàng <span class="optional">(Tùy chọn)</span></label>
            <textarea v-model="form.note" rows="3"
              placeholder="Ví dụ: giao trước 12h, ít đá hơn..."
              class="form-input form-textarea"></textarea>
          </div>
        </section>

        <!-- ── BƯỚC 1: PHƯƠNG THỨC THANH TOÁN ── -->
        <section class="checkout-section" v-if="currentStep === 1">
          <div class="section-number-title">
            <span class="section-num">3</span>
            <span class="section-title">Phương thức thanh toán</span>
          </div>

          <div class="payment-list">
            <label class="payment-radio" :class="{ active: form.payment === 'COD' }">
              <input type="radio" v-model="form.payment" value="COD" />
              <span class="payment-radio-icon">🛵</span>
              <div class="payment-radio-text">
                <span class="p-name">Thanh toán khi nhận hàng (COD)</span>
              </div>
            </label>
            <label class="payment-radio" :class="{ active: form.payment === 'MOMO' }">
              <input type="radio" v-model="form.payment" value="MOMO" />
              <span class="payment-radio-icon">
                <img src="../IMG/logoMOMO.png" class="momo-logo-sm" alt="MoMo"
                  onerror="this.style.display='none'" />
              </span>
              <div class="payment-radio-text">
                <span class="p-name">Ví MoMo</span>
              </div>
            </label>
          </div>
        </section>

        <!-- CTA bước 1 -->
        <div class="checkout-cta" v-if="currentStep === 1">
          <button class="btn-next" @click="goToStep2">
            Xem lại đơn hàng →
          </button>
        </div>

        <!-- ══ BƯỚC 2: XÁC NHẬN ══ -->
        <section class="checkout-section" v-if="currentStep === 2">
          <div class="section-number-title">
            <span class="section-num">1</span>
            <span class="section-title">Thông tin giao hàng</span>
          </div>
          <div class="confirm-info-box">
            <div class="ci-row"><span class="ci-label">Người nhận</span><span class="ci-val">{{ form.name }}</span></div>
            <div class="ci-row"><span class="ci-label">Điện thoại</span><span class="ci-val">{{ form.phone }}</span></div>
            <div class="ci-row"><span class="ci-label">Địa chỉ</span><span class="ci-val">{{ computedFullAddress }}</span></div>
            <div class="ci-row" v-if="form.note"><span class="ci-label">Ghi chú</span><span class="ci-val ci-note">{{ form.note }}</span></div>
            <div class="ci-row"><span class="ci-label">Thanh toán</span>
              <span class="ci-val">{{ form.payment === 'COD' ? 'Tiền mặt khi nhận hàng' : 'Ví MoMo' }}</span>
            </div>
          </div>
          <button class="btn-edit" @click="currentStep = 1">✏ Chỉnh sửa</button>
        </section>

        <!-- CTA bước 2 -->
        <div class="checkout-cta" v-if="currentStep === 2">
          <button class="btn-back-step" @click="currentStep = 1">← Quay lại</button>
        </div>
      </main>

      <!-- ══ RIGHT COLUMN – ORDER SUMMARY ══ -->
      <aside class="checkout-aside">
        <div class="summary-box">
          <div class="summary-title">Đơn hàng ({{ selectedItems.length }} sản phẩm)</div>

          <!-- Danh sách sản phẩm -->
          <div class="summary-items">
            <div v-for="item in selectedItems" :key="item.id" class="summary-item">
              <!-- Ảnh + tên -->
              <div class="si-img-wrap">
                <img :src="item.image" :alt="item.name" />
                <span class="si-qty-dot">{{ item.quantity }}</span>
              </div>
              <div class="si-info">
                <div class="si-name-row">
                  <span class="si-name">{{ item.name }}</span>
                  <span class="si-total-inline">{{ formatVND(item.basePrice * item.quantity) }}</span>
                </div>
                <!-- Tags -->
                <div class="si-tags" v-if="item.sizeName || item.toppingDetails.length">
                  <span v-if="item.sizeName" class="si-tag">Size {{ item.sizeName }}</span>
                  <span v-for="(tp, i) in item.toppingDetails" :key="i" class="si-tag">{{ tp.name }}</span>
                </div>
                <!-- Giá chi tiết từng phần -->
                <div class="si-price-breakdown">
                  <div class="si-pb-row">
                    <span>Giá gốc</span>
                    <span>{{ formatVND(item.drinkBasePrice) }}</span>
                  </div>
                  <div class="si-pb-row" v-if="item.sizePrice > 0">
                    <span>Size {{ item.sizeName }}</span>
                    <span>+{{ formatVND(item.sizePrice) }}</span>
                  </div>
                  <div class="si-pb-row" v-if="item.beanPrice > 0">
                    <span>{{ item.beanName }}</span>
                    <span>+{{ formatVND(item.beanPrice) }}</span>
                  </div>
                  <div class="si-pb-row" v-if="item.milkPrice > 0">
                    <span>{{ item.milkName }}</span>
                    <span>+{{ formatVND(item.milkPrice) }}</span>
                  </div>
                  <!-- Từng topping riêng lẻ -->
                  <div class="si-pb-row" v-for="(tp, i) in item.toppingDetails" :key="'tp-'+i">
                    <span>{{ tp.name }}</span>
                    <span v-if="tp.price > 0">+{{ formatVND(tp.price) }}</span>
                    <span v-else class="si-pb-free">+0 đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="summary-divider"></div>

          <!-- Mã khuyến mãi -->
          <div class="coupon-section">
            <div class="coupon-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
              </svg>
              Khuyến mãi
            </div>
            <div class="coupon-row">
              <select v-model="couponCode" class="coupon-select" :disabled="couponApplied">
                <option value="">-- Chọn mã giảm giá --</option>
                <option v-for="p in savedPromo" :key="p.id" :value="p.code">
                  {{ p.code }} – {{ p.category === 'PHẦN TRĂM' ? p.value + '%' : (+p.value).toLocaleString('vi-VN') + 'đ' }}
                </option>
              </select>
              <button class="btn-apply-coupon"
                @click="couponApplied ? removeCoupon() : applyCoupon()">
                {{ couponApplied ? 'Hủy' : 'Áp dụng' }}
              </button>
            </div>
            <div v-if="couponMessage" class="coupon-feedback"
              :class="couponApplied ? 'success' : 'error'">
              {{ couponMessage }}
            </div>
            <!-- Chip mã đã áp dụng -->
            <div v-if="couponApplied" class="coupon-applied-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
                  stroke="currentColor" stroke-width="2"/>
                <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
              </svg>
              {{ couponCode }} – Giảm {{ formatVND(couponDiscount) }}
            </div>
          </div>

          <div class="summary-divider"></div>

          <!-- Tổng tiền -->
          <div class="summary-totals">
            <div class="st-row">
              <span>Tạm tính</span>
              <span>{{ formatVND(selectedSubtotal) }}</span>
            </div>
            <div class="st-row" v-if="couponApplied">
              <span class="st-discount">Voucher giảm</span>
              <span class="st-discount">-{{ formatVND(couponDiscount) }}</span>
            </div>
            <div class="st-row">
              <span>Phí vận chuyển</span>
              <span>{{ shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee) }}</span>
            </div>
            <div class="st-row st-total">
              <span>Tổng thanh toán</span>
              <span class="st-total-amount">{{ formatVND(grandTotal) }}</span>
            </div>
          </div>

          <!-- CTA trong aside (mobile ẩn, desktop hiện) -->
          <button v-if="currentStep === 1" class="btn-aside-next" @click="goToStep2">
            Tiếp tục →
          </button>
          <button v-if="currentStep === 2" class="btn-aside-next" @click="placeOrder"
            :disabled="isPlacingOrder">
            {{ isPlacingOrder ? 'Đang xử lý...' : '✓ Đặt hàng ngay' }}
          </button>
          <p class="summary-terms">Bằng cách đặt hàng, bạn đồng ý với điều khoản dịch vụ.</p>
        </div>
      </aside>
    </div>

    <!-- ══ SUCCESS ══ -->
    <transition name="fade">
      <div v-if="showSuccessModal" class="success-page">
        <div class="success-card">
          <img src="../IMG/DripLab_Logo.png" class="success-logo" alt="DripLab" />
          <div class="success-checkmark">✓</div>
          <div class="success-title">Đặt hàng thành công!</div>
          <div class="success-order-id">Mã đơn: <strong>{{ lastOrderId }}</strong></div>
          <p class="success-msg">Cảm ơn bạn đã tin tưởng Drip Lab!<br/>Đơn hàng của bạn đang được xử lý.</p>
          <button class="btn-success-ok" @click="closeSuccess">Về trang Menu</button>
        </div>
      </div>
    </transition>

    <!-- MoMo Popup -->
    <MomoPopup :visible="showMomoQR" :amount="grandTotal"
      :orderInfo="`Thanh toan DripLab - ${form.name || 'Khach hang'}`"
      @close="closeMomoQR" @paid="onMomoPaid" />
  </div>
</template>

<script src="../JS-USER/Checkout.JS"></script>
<style src="../CSS-USER/Checkout.CSS"></style>