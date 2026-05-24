<script setup>
import { computed } from 'vue'
import { useMomoPayment, BANK_LIST } from './MoMo.js'

const props = defineProps({
    visible: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    orderInfo: { type: String, default: 'Thanh toan DripLab' },
    orderId: { type: String, default: '' },
})
const emit = defineEmits(['close', 'paid'])

const logoMomo = new URL('../IMG/logoMOMO.png', import.meta.url).href

const {
    screen, orderId,
    hh, mm, ss, isWarning,
    cardNumber, cardExpiry, cardHolder, cardPhone,
    cardNumDisplay, cardVisualNum,
    errors, submitting,
    onNumberInput, onExpiryInput, onHolderInput, onPhoneInput,
    submitPayment, goToAtm, backToMethod, handleClose, resetSession,
    CARD_BG_IMG,
} = useMomoPayment(props, emit)

const amountFmt = computed(() => props.amount.toLocaleString('vi-VN') + 'đ')
</script>

<style src="./MoMo.css"></style>

<template>
    <teleport to="body">
        <transition name="fade">
            <div v-if="visible" class="momo-overlay" @click.self="handleClose">
                <div class="momo-portal">

                    <!-- ════ TOP BAR ════ -->
                    <div class="mp-topbar">
                        <img :src="logoMomo" alt="MoMo" class="mp-topbar-logo" />
                        <p class="mp-topbar-title">Cổng thanh toán MoMo</p>
                    </div>

                    <!-- ════ BODY ════ -->
                    <div class="mp-body">

                        <!-- ── LEFT ── -->
                        <div class="mp-left">
                            <p class="mp-section-title">Thông tin đơn hàng</p>

                            <div class="mp-info-row">
                                <span class="mp-info-label">Nhà cung cấp</span>
                                <div class="mp-provider">
                                    <img :src="logoMomo" alt="MoMo" class="mp-provider-logo" />
                                    <span class="mp-provider-name">MoMo Payment</span>
                                </div>
                            </div>

                            <div class="mp-info-row">
                                <span class="mp-info-label">Mã đơn hàng</span>
                                <span class="mp-info-val">{{ orderId }}</span>
                            </div>

                            <div class="mp-info-row">
                                <span class="mp-info-label">Mô tả</span>
                                <span class="mp-info-val">{{ orderInfo }}</span>
                            </div>

                            <div class="mp-info-row">
                                <span class="mp-info-label">Số tiền</span>
                                <span class="mp-amount-val">{{ amountFmt }}</span>
                            </div>

                            <div v-if="screen !== 'success' && screen !== 'timeout'" class="mp-countdown">
                                <p class="mp-countdown-label">Đơn hàng sẽ hết hạn sau:</p>
                                <div class="mp-countdown-row">
                                    <div class="mp-cd-unit">
                                        <span class="mp-cd-num" :class="{ warn: isWarning }">{{ hh }}</span>
                                        <span class="mp-cd-lbl">Giờ</span>
                                    </div>
                                    <span class="mp-cd-sep">:</span>
                                    <div class="mp-cd-unit">
                                        <span class="mp-cd-num" :class="{ warn: isWarning }">{{ mm }}</span>
                                        <span class="mp-cd-lbl">Phút</span>
                                    </div>
                                    <span class="mp-cd-sep">:</span>
                                    <div class="mp-cd-unit">
                                        <span class="mp-cd-num" :class="{ warn: isWarning }">{{ ss }}</span>
                                        <span class="mp-cd-lbl">Giây</span>
                                    </div>
                                </div>
                            </div>

                            <p class="mp-help">
                                Gặp khó khăn khi thanh toán?
                                <a href="#" @click.prevent>Xem Hướng dẫn</a>
                            </p>
                            <button class="mp-back-link" @click="handleClose">Quay về</button>
                        </div>

                        <!-- ── RIGHT ── -->
                        <div class="mp-right">

                            <!-- ══ SCREEN 1: Chọn phương thức ══ -->
                            <template v-if="screen === 'method'">
                                <p class="mp-method-title">Phương thức thanh toán</p>

                                <div class="mp-info-banner">
                                    <span class="mp-info-banner-icon">ℹ️</span>
                                    <span>Bạn đang sử dụng giải pháp thanh toán được xây dựng và cung cấp bởi
                                        MoMo</span>
                                </div>

                                <div class="mp-methods">
                                    <div class="mp-method-item mp-disabled">
                                        <img :src="logoMomo" alt="MoMo" class="mp-method-logo-img" />
                                        <span class="mp-method-name">Thanh toán bằng Ví MoMo</span>
                                        <div class="mp-radio"></div>
                                    </div>
                                    <div class="mp-method-item mp-active">
                                        <div class="mp-method-ico mp-ico-atm">ATM</div>
                                        <span class="mp-method-name">Thanh toán bằng thẻ ATM</span>
                                        <div class="mp-radio checked"></div>
                                    </div>
                                    <div class="mp-method-item mp-disabled">
                                        <div class="mp-method-ico mp-ico-visa">VISA</div>
                                        <span class="mp-method-name">Thanh toán bằng VISA/Master/JCB</span>
                                        <div class="mp-radio"></div>
                                    </div>
                                </div>

                                <button class="mp-continue-btn" @click="goToAtm">Tiếp tục</button>
                            </template>

                            <!-- ══ SCREEN 2: Nhập thẻ ATM ══ -->
                            <template v-else-if="screen === 'atm'">
                                <!-- Tiêu đề căn giữa -->
                                <p class="mp-atm-header-title">Nhập thông tin thẻ để thanh toán</p>

                                <!-- ── Thẻ dùng THENGANHANG.png làm nền ── -->
                                <div class="mp-card-wrapper">
                                    <div class="mp-card" :style="{ backgroundImage: `url(${CARD_BG_IMG})` }">
                                        <!-- Số thẻ đầy đủ -->
                                        <div class="mp-card-num">{{ cardVisualNum }}</div>
                                        <div class="mp-card-bottom-row">
                                            <!-- Chỉ hiện giá trị tên, không hiện label (label đã trong ảnh) -->
                                            <div class="mp-card-holder">{{ cardHolder || '' }}</div>
                                            <!-- Chỉ hiện giá trị ngày, không hiện label -->
                                            <div class="mp-card-expiry-val">{{ cardExpiry || 'MM/YY' }}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Form — 4 ô bằng nhau -->
                                <div class="mp-form">
                                    <div class="mp-form-row">
                                        <div class="mp-field">
                                            <label>Số thẻ</label>
                                            <input :value="cardNumDisplay" @input="onNumberInput" type="text"
                                                inputmode="numeric" placeholder="Nhập số thẻ" maxlength="23"
                                                :class="{ err: errors.number }" />
                                            <span v-if="errors.number" class="mp-field-err">{{ errors.number }}</span>
                                        </div>
                                        <div class="mp-field">
                                            <label>Ngày phát hành</label>
                                            <input :value="cardExpiry" @input="onExpiryInput" type="text"
                                                placeholder="MM/YY" maxlength="5" :class="{ err: errors.expiry }" />
                                            <span v-if="errors.expiry" class="mp-field-err">{{ errors.expiry }}</span>
                                        </div>
                                    </div>
                                    <div class="mp-form-row">
                                        <div class="mp-field">
                                            <label>Tên chủ thẻ</label>
                                            <input :value="cardHolder" @input="onHolderInput" type="text"
                                                placeholder="Nhập tên chủ thẻ" style="text-transform:uppercase"
                                                :class="{ err: errors.holder }" />
                                            <span v-if="errors.holder" class="mp-field-err">{{ errors.holder }}</span>
                                        </div>
                                        <div class="mp-field">
                                            <label>Số điện thoại <span class="mp-optional-lbl">(tuỳ chọn)</span></label>
                                            <input :value="cardPhone" @input="onPhoneInput" type="text"
                                                inputmode="numeric" placeholder="Nhập SĐT" maxlength="10" />
                                        </div>
                                    </div>
                                </div>

                                <button class="mp-pay-btn" @click="submitPayment" :disabled="submitting">
                                    🔒 {{ submitting ? 'Đang xử lý...' : 'Thanh Toán' }}
                                </button>

                                <p class="mp-banks-title">Ngân hàng chấp nhận thanh toán</p>
                                <div class="mp-banks-grid">
                                    <div v-for="bank in BANK_LIST" :key="bank.code" class="mp-bank" :title="bank.name">
                                        <img :src="bank.img" :alt="bank.name" class="mp-bank-img" />
                                        <span class="mp-bank-name">{{ bank.name }}</span>
                                    </div>
                                </div>

                                <div class="mp-atm-back">
                                    <button class="mp-back-link" @click="backToMethod">← Chọn phương thức khác</button>
                                </div>
                            </template>

                            <!-- ══ SCREEN 3: Thành công ══ -->
                            <template v-else-if="screen === 'success'">
                                <div class="mp-success">
                                    <div class="mp-success-ico">✅</div>
                                    <h2 class="mp-success-title">Thanh toán thành công</h2>
                                    <p class="mp-success-sub">Giao dịch đã được xác nhận</p>
                                    <div class="mp-success-box">
                                        <p class="mp-success-prov">MoMo Payment</p>
                                        <p class="mp-success-amt">{{ amountFmt }}</p>
                                    </div>
                                    <div class="mp-success-redirect">
                                        <div class="mp-success-spin"></div>
                                        <span>MoMo sẽ tự động đưa bạn về lại trang của Nhà cung cấp</span>
                                    </div>
                                    <button class="mp-success-back" @click="handleClose">Quay về</button>
                                </div>
                            </template>

                            <!-- ══ SCREEN 4: Timeout ══ -->
                            <template v-else-if="screen === 'timeout'">
                                <div class="mp-timeout">
                                    <div class="mp-timeout-ico">⏰</div>
                                    <h2 class="mp-timeout-title">Đơn hàng đã hết hạn</h2>
                                    <p class="mp-timeout-desc">Thời gian thanh toán đã kết thúc.<br />Vui lòng tạo lại
                                        đơn hàng.</p>
                                    <button class="mp-timeout-btn" @click="resetSession">Thử lại</button>
                                </div>
                            </template>

                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>