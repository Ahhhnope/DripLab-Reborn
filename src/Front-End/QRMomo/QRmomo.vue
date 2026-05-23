<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useQRMomoPayment } from './QRmomo.js'

const props = defineProps({
    visible: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    orderInfo: { type: String, default: 'Thanh toan DripLab' },
    invoiceId: { type: String, default: '' },
})
const emit = defineEmits(['close', 'paid'])

const logoMomo = new URL('../IMG/logoMOMO.png', import.meta.url).href

const {
    screen, orderId,
    mm, ss, isWarning,
    qrCells,
    simulatePaid,
    handleClose,
    resetSession,
} = useQRMomoPayment(props, emit)

const amountFmt = computed(() => props.amount.toLocaleString('vi-VN') + 'đ')

const QR_SIZE = 25
const CELL_SIZE = 8
const QR_PX = QR_SIZE * CELL_SIZE

function onKeyDown(e) {
    if (e.key === 'Enter' && props.visible && screen.value === 'qr') {
        simulatePaid()
    }
}

onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
})
</script>

<style src="./QRmomo.css"></style>

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

                        <!-- ── LEFT: Thông tin đơn hàng ── -->
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
                                <span class="mp-info-label">Mã hóa đơn</span>
                                <span class="mp-order-id-badge">{{ orderId }}</span>
                            </div>

                            <div class="mp-info-row">
                                <span class="mp-info-label">Mô tả</span>
                                <span class="mp-info-val">{{ orderInfo }}</span>
                            </div>

                            <div class="mp-info-row">
                                <span class="mp-info-label">Số tiền</span>
                                <span class="mp-amount-val">{{ amountFmt }}</span>
                            </div>

                            <div v-if="screen === 'qr'" class="mp-countdown">
                                <p class="mp-countdown-label">Đơn hàng sẽ hết hạn sau:</p>
                                <div class="mp-countdown-row">
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

                            <!-- ══ SCREEN: QR ══ -->
                            <template v-if="screen === 'qr'">
                                <p class="mp-qr-title">Quét mã QR để thanh toán</p>
                                <p class="mp-qr-sub">{{ amountFmt }}</p>

                                <div class="mp-qr-box">
                                    <span class="mp-qr-label">Quét mã QR để thanh toán</span>

                                    <div class="mp-qr-frame">
                                        <div class="mp-qr-img-wrap">
                                            <svg :width="QR_PX" :height="QR_PX" :viewBox="`0 0 ${QR_PX} ${QR_PX}`"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <rect width="100%" height="100%" fill="#fff" />
                                                <g>
                                                    <rect v-for="(cell, i) in qrCells" :key="i" :x="cell.c * CELL_SIZE"
                                                        :y="cell.r * CELL_SIZE" :width="CELL_SIZE - 0.5"
                                                        :height="CELL_SIZE - 0.5" :fill="cell.dark ? '#1a1a1a' : '#fff'"
                                                        :rx="cell.fixed ? 0 : 1" />
                                                </g>
                                            </svg>

                                            <div class="mp-qr-scan-line"></div>

                                            <div class="mp-qr-logo-center">
                                                <img :src="logoMomo" alt="MoMo" />
                                            </div>

                                            <svg class="mp-corner mp-corner--tl" viewBox="0 0 28 28" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2 14V4a2 2 0 0 1 2-2h10" stroke="#ae2070" stroke-width="3"
                                                    stroke-linecap="round" />
                                            </svg>
                                            <svg class="mp-corner mp-corner--tr" viewBox="0 0 28 28" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2 14V4a2 2 0 0 1 2-2h10" stroke="#ae2070" stroke-width="3"
                                                    stroke-linecap="round" />
                                            </svg>
                                            <svg class="mp-corner mp-corner--bl" viewBox="0 0 28 28" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2 14V4a2 2 0 0 1 2-2h10" stroke="#ae2070" stroke-width="3"
                                                    stroke-linecap="round" />
                                            </svg>
                                            <svg class="mp-corner mp-corner--br" viewBox="0 0 28 28" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2 14V4a2 2 0 0 1 2-2h10" stroke="#ae2070" stroke-width="3"
                                                    stroke-linecap="round" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div class="mp-qr-hint">
                                        
                                        <span>
                                            Sử dụng <strong>App MoMo</strong> hoặc ứng dụng camera hỗ trợ
                                            QR code để quét mã
                                        </span>
                                    </div>

                                    <!-- ── Nút giả lập — chỉ hiện hint Enter mờ ── -->
                                    <button class="mp-qr-paid-btn" @click="simulatePaid">
                                        <span class="mp-paid-btn-hint">↵ Enter</span>
                                    </button>
                                </div>
                            </template>

                            <!-- ══ SCREEN: Thành công ══ -->
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

                            <!-- ══ SCREEN: Timeout ══ -->
                            <template v-else-if="screen === 'timeout'">
                                <div class="mp-timeout">
                                    <div class="mp-timeout-ico">⏰</div>
                                    <h2 class="mp-timeout-title">Đơn hàng đã hết hạn</h2>
                                    <p class="mp-timeout-desc">
                                        Thời gian thanh toán đã kết thúc.<br />
                                        Vui lòng tạo lại đơn hàng.
                                    </p>
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