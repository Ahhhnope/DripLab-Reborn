<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="props.open"
        class="modal-backdrop"
        @click.self="close"
      >
        <div class="modal-container">

          <!-- ── HEADER ─────────────────────────────────────────── -->
          <div class="modal-header">
            <div class="modal-header__left">
              <span class="modal-order-code">#{{ props.order?.code || "-" }}</span>
              <span class="status-badge" :class="`status-badge--${props.order?.status}`">
                {{ statusText(props.order?.status) }}
              </span>
            </div>
            <button class="modal-close-btn" @click="close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- ── BODY ───────────────────────────────────────────── -->
          <div class="modal-body custom-scrollbar">

            <!-- Loading -->
            <div v-if="loading" class="modal-state">
              <svg class="spinner" viewBox="0 0 24 24" fill="none">
                <circle class="spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
                <path class="spinner__arc" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              <span>Đang tải chi tiết đơn hàng...</span>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="modal-state">
              <div class="error-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </div>
              <p class="modal-state__msg">{{ error }}</p>
              <button class="retry-btn" @click="fetchOrderDetail(props.order?.code)">Thử lại</button>
            </div>

            <!-- Content -->
            <div v-else-if="props.order" class="modal-grid">

              <!-- ── CỘT TRÁI ──────────────────────────────────── -->
              <div class="modal-col-left">

                <!-- Khách hàng -->
                <section class="info-section">
                  <div class="section-header">
                    <div class="avatar">{{ initials(props.order.customer?.name) }}</div>
                    <span class="section-title">Thông tin khách hàng</span>
                  </div>
                  <div class="info-card">
                    <div class="info-row">
                      <span class="info-label">Họ và tên</span>
                      <span class="info-value info-value--bold">{{ props.order.customer?.name || "-" }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Số điện thoại</span>
                      <a
                        v-if="props.order.customer?.phone"
                        :href="`tel:${props.order.customer.phone}`"
                        class="info-value info-value--link"
                      >{{ props.order.customer.phone }}</a>
                      <span v-else class="info-value info-value--empty">-</span>
                    </div>
                    <div class="info-row info-row--align-start">
                      <span class="info-label">Địa chỉ</span>
                      <span class="info-value">{{ props.order.customer?.address || "-" }}</span>
                    </div>
                    <div v-if="props.order.customer?.note" class="info-row info-row--align-start">
                      <span class="info-label">Ghi chú</span>
                      <span class="info-value info-value--note">"{{ props.order.customer.note }}"</span>
                    </div>
                  </div>
                </section>

                <!-- Thông tin đơn -->
                <section class="info-section">
                  <div class="section-header">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="section-icon">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span class="section-title">Thông tin đơn hàng</span>
                  </div>
                  <div class="info-card">
                    <div class="info-row">
                      <span class="info-label">Hình thức</span>
                      <span class="info-value info-value--bold">{{ props.order.shippingType || "-" }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Thời gian đặt</span>
                      <span class="info-value">{{ props.order.createdAt || "-" }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Ngày giao</span>
                      <span class="info-value">{{ props.order.deadline || "-" }}</span>
                    </div>
                  </div>
                </section>

                <!-- Chi tiết món -->
                <section class="info-section">
                  <div class="section-header section-header--between">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="section-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      <span class="section-title">Chi tiết món</span>
                    </div>
                    <span class="qty-badge">{{ props.order.qty }} món</span>
                  </div>

                  <div
                    v-for="it in (props.order.itemsDetail || [])"
                    :key="it.id"
                    class="item-row"
                  >
                    <div class="item-info">
                      <p class="item-name">{{ it.name }}</p>
                      <div v-if="it.options?.length" class="item-options">
                        <span v-for="(op, idx) in it.options" :key="idx" class="option-tag">{{ op }}</span>
                      </div>
                    </div>
                    <div class="item-qty">x{{ it.qty }}</div>
                    <div class="item-total">{{ money(it.total) }}</div>
                  </div>

                  <div v-if="!props.order.itemsDetail?.length" class="empty-items">
                    Không có món nào
                  </div>
                </section>
              </div>

              <!-- ── CỘT PHẢI ─────────────────────────────────── -->
              <div class="modal-col-right">

                <!-- Thanh toán -->
                <div class="payment-card">
                  <span class="section-title" style="display: block; margin-bottom: 14px;">Thanh toán</span>
                  <div class="payment-row">
                    <span class="payment-label">Tạm tính</span>
                    <span class="payment-value">{{ money(props.order.subtotal) }}</span>
                  </div>
                  <div class="payment-row">
                    <span class="payment-label">Phí giao hàng</span>
                    <span class="payment-value">{{ money(props.order.shippingFee ?? 0) }}</span>
                  </div>
                  <div class="payment-row payment-row--discount">
                    <span>Giảm giá</span>
                    <span>- {{ money(props.order.discount) }}</span>
                  </div>
                  <div class="payment-total">
                    <span>Tổng cộng</span>
                    <span class="payment-total__amount">{{ money(props.order.pay) }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="action-group">
                  <button
                    class="btn btn--primary"
                    :disabled="props.order.status !== 'pending'"
                    @click="emitConfirm"
                  >
                    Xác nhận đơn hàng
                  </button>
                  <button
                    class="btn btn--danger"
                    :disabled="!['pending','processing'].includes(props.order.status)"
                    @click="emitCancel"
                  >
                    Huỷ đơn
                  </button>
                  <button class="btn btn--ghost" @click="close">Đóng</button>
                </div>

              </div>
            </div>

            <div v-else class="modal-state">
              <span>Không có dữ liệu đơn hàng.</span>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useOrderTable } from "../Front-End/JS/OrderTable";
import { useOrderDetailModal } from "../Front-End/JS/OrderDetailModal";

const props = defineProps({
  open:  { type: Boolean, default: false },
  order: { type: Object,  default: null  },
});

const emit = defineEmits(["update:open", "confirm", "cancel"]);

const { money, statusText } = useOrderTable(() => {});
const { loading, error, fetchOrderDetail, close, emitConfirm, emitCancel } =
  useOrderDetailModal(props, emit, { money, statusText });

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}
</script>

<style scoped>
/* ── BACKDROP & CONTAINER ─────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  padding: 16px;
}
.modal-container {
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}

/* ── HEADER ───────────────────────────────────────── */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f1efe8;
  background: #faf9f7;
  flex-shrink: 0;
}
.modal-header__left { display: flex; align-items: center; gap: 10px; }
.modal-order-code { font-size: 16px; font-weight: 700; color: #3c2a21; letter-spacing: -0.3px; }
.modal-close-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; border: 1px solid #e7e5e0;
  background: #fff; color: #9c9589; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.modal-close-btn:hover { background: #f1efe8; color: #5c5248; }

/* ── STATUS BADGE ─────────────────────────────────── */
.status-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600; border: 1px solid transparent;
}
.status-badge--pending    { background: #faeeda; color: #854f0b; border-color: #fac775; }
.status-badge--processing { background: #dbeafe; color: #1e40af; border-color: #93c5fd; }
.status-badge--shipping   { background: #e0e7ff; color: #3730a3; border-color: #a5b4fc; }
.status-badge--delivered  { background: #dcfce7; color: #166534; border-color: #86efac; }
.status-badge--cancelled  { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }

/* ── BODY ─────────────────────────────────────────── */
.modal-body { flex: 1; overflow-y: auto; padding: 20px; }
.modal-grid { display: grid; grid-template-columns: 1fr 240px; gap: 20px; }
@media (max-width: 600px) { .modal-grid { grid-template-columns: 1fr; } }

/* ── LEFT / RIGHT ─────────────────────────────────── */
.modal-col-left  { border-right: 1px solid #f1efe8; padding-right: 20px; }
.modal-col-right { padding-left: 4px; }

/* ── SECTIONS ─────────────────────────────────────── */
.info-section { margin-bottom: 20px; }
.section-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.section-header--between { justify-content: space-between; }
.section-icon { color: #b0a99f; flex-shrink: 0; }
.section-title {
  font-size: 11px; font-weight: 700; color: #b0a99f;
  text-transform: uppercase; letter-spacing: 0.7px;
}

/* ── AVATAR ───────────────────────────────────────── */
.avatar {
  width: 26px; height: 26px; border-radius: 50%;
  background: #dbeafe; color: #1e40af;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

/* ── INFO CARD ────────────────────────────────────── */
.info-card {
  background: #faf9f7; border: 1px solid #ede9e2;
  border-radius: 12px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.info-row { display: grid; grid-template-columns: 108px 1fr; gap: 8px; align-items: center; }
.info-row--align-start { align-items: start; }
.info-label { font-size: 13px; color: #a8a098; }
.info-value { font-size: 13px; color: #3c2a21; line-height: 1.5; }
.info-value--bold  { font-weight: 600; }
.info-value--link  { color: #2563eb; text-decoration: none; }
.info-value--link:hover { text-decoration: underline; }
.info-value--empty { color: #c4bfb8; }
.info-value--note  { color: #a8a098; font-style: italic; }

/* ── QTY BADGE ────────────────────────────────────── */
.qty-badge {
  background: #f1efe8; border: 1px solid #e7e5e0;
  border-radius: 99px; font-size: 11px; font-weight: 600;
  color: #7d7469; padding: 2px 8px;
}

/* ── ITEM ROW ─────────────────────────────────────── */
.item-row {
  display: grid; grid-template-columns: 1fr 36px 80px;
  gap: 8px; align-items: start;
  padding: 12px 0; border-bottom: 1px dashed #ede9e2;
}
.item-row:last-of-type { border-bottom: none; }
.item-name  { margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #3c2a21; }
.item-options { display: flex; flex-wrap: wrap; gap: 4px; }
.option-tag {
  background: #f1efe8; border: 1px solid #e7e5e0;
  border-radius: 4px; font-size: 11px; color: #7d7469; padding: 2px 7px;
}
.item-qty   { text-align: center; font-size: 13px; color: #a8a098; font-weight: 500; padding-top: 1px; }
.item-total { text-align: right;  font-size: 13px; font-weight: 600; color: #3c2a21; padding-top: 1px; }
.empty-items { padding: 20px 0; text-align: center; font-size: 13px; color: #c4bfb8; }

/* ── PAYMENT ──────────────────────────────────────── */
.payment-card {
  background: #faf9f7; border: 1px solid #ede9e2;
  border-radius: 12px; padding: 16px; margin-bottom: 14px;
}
.payment-row { display: flex; justify-content: space-between; font-size: 13px; color: #7d7469; margin-bottom: 8px; }
.payment-row--discount { color: #b91c1c; }
.payment-total {
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid #ede9e2; padding-top: 12px; margin-top: 4px;
}
.payment-total span:first-child { font-size: 14px; font-weight: 600; color: #3c2a21; }
.payment-total__amount { font-size: 16px; font-weight: 700; color: #3c2a21; }

/* ── ACTIONS ──────────────────────────────────────── */
.action-group { display: flex; flex-direction: column; gap: 8px; }
.btn {
  width: 100%; padding: 11px; border-radius: 10px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: background 0.15s, opacity 0.15s, transform 0.1s;
  border: none;
}
.btn:active:not(:disabled) { transform: scale(0.98); }
.btn:disabled { opacity: 0.35; cursor: not-allowed; }
.btn--primary { background: #3c2a21; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #2a1d17; }
.btn--danger  { background: transparent; color: #b91c1c; border: 1px solid #fca5a5; }
.btn--danger:hover:not(:disabled)  { background: #fff1f2; }
.btn--ghost   { background: transparent; color: #9c9589; border: 1px solid #e7e5e0; }
.btn--ghost:hover { background: #faf9f7; }

/* ── STATES ───────────────────────────────────────── */
.modal-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; padding: 60px 20px;
  font-size: 13px; color: #a8a098;
}
.error-icon-wrap {
  width: 48px; height: 48px; border-radius: 50%;
  background: #fee2e2; color: #b91c1c;
  display: flex; align-items: center; justify-content: center;
}
.modal-state__msg { color: #7d7469; }
.retry-btn {
  font-size: 12px; font-weight: 600; color: #634832;
  background: none; border: none; cursor: pointer; text-decoration: underline;
}

/* ── SPINNER ──────────────────────────────────────── */
.spinner { width: 28px; height: 28px; animation: spin 0.8s linear infinite; color: #634832; }
.spinner__track { opacity: 0.2; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── SCROLLBAR ────────────────────────────────────── */
.custom-scrollbar::-webkit-scrollbar       { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e0; border-radius: 99px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

/* ── TRANSITIONS ──────────────────────────────────── */
.modal-fade-enter-active { transition: opacity 0.2s ease; }
.modal-fade-leave-active { transition: opacity 0.18s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to     { opacity: 0; }
.modal-fade-enter-active .modal-container {
  animation: slideUp 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
}
@keyframes slideUp {
  from { transform: translateY(16px) scale(0.98); opacity: 0; }
  to   { transform: translateY(0)    scale(1);    opacity: 1; }
}
</style>