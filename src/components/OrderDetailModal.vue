<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="props.open" class="modal-backdrop" @click.self="close">
        <div class="modal-container">
          <!-- HEADER -->
          <div class="modal-header">
            <div class="modal-header__left">
              <span class="modal-order-code">#{{ localOrder?.id || "-" }}</span>
              <span class="status-badge" :class="`status-badge--${localOrder?.status}`">
                {{ statusText(localOrder?.status) }}
              </span>
            </div>
            <button class="modal-close-btn" @click="close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- BODY -->
          <div class="modal-body custom-scrollbar">
            <!-- Loading -->
            <div v-if="loading" class="modal-state">
              <svg class="spinner" viewBox="0 0 24 24" fill="none">
                <circle class="spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
                <path class="spinner__arc" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Đang tải chi tiết đơn hàng...</span>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="modal-state">
              <div class="error-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <p class="modal-state__msg">{{ error }}</p>
              <button class="retry-btn" @click="fetchOrderDetail(props.order?.code)">Thử lại</button>
            </div>

            <!-- Content -->
            <div v-else-if="localOrder" class="modal-content">
              <!-- TIMELINE TRẠNG THÁI -->
              <div class="status-timeline">
                <div class="status-timeline__title">Trạng thái đơn hàng hiện tại</div>

                <div class="status-steps">
                  <!-- Thanh ngang nối tất cả các trạng thái -->
                  <div class="status-timeline__connector" :style="{ '--progress': progressWidth }"></div>

                  <template v-for="(st, idx) in visibleSteps" :key="st.key">
                    <button type="button" class="status-step" :class="stepClass(st, idx)" @click="openConfirmStatus(st)"
                      :title="st.label">
                      <span class="status-step__circle" aria-hidden="true">
                        <svg v-if="st.icon === 'doc'" class="status-step__icon" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14 2v6h6" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 17h6" />
                        </svg>
                        <svg v-else-if="st.icon === 'gear'" class="status-step__icon" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <svg v-else-if="st.icon === 'truck'" class="status-step__icon" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 7h11v10H3z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4l3 3v4h-7z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M7 19a2 2 0 110-4 2 2 0 010 4z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M17 19a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                        <svg v-else-if="st.icon === 'home'" class="status-step__icon" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 11l9-8 9 8" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 10v10h14V10" />
                        </svg>
                        <svg v-else-if="st.icon === 'x'" class="status-step__icon" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        <svg v-else-if="st.icon === 'ban'" class="status-step__icon" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </span>
                      <span class="status-step__label">{{ st.label }}</span>
                    </button>
                  </template>
                </div>

                <div class="status-timeline__hint">Nhấn vào trạng thái để cập nhật (sẽ hỏi xác nhận).</div>
              </div>

              <!-- BANNER LÝ DO HUỶ ĐƠN -->
              <div v-if="localOrder.status === 'cancelled' && localOrder.cancelReason" class="cancel-reason-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  class="cancel-reason-banner__icon">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>
                  <strong>Đơn hàng đã bị huỷ</strong> — {{ localOrder.cancelReason }}
                </span>
              </div>

              <div class="modal-grid">
                <!-- CỘT TRÁI -->
                <div class="modal-col-left">

                  <!-- Thông tin khách hàng -->
                  <section class="info-section">
                    <div class="section-header">
                      <div class="avatar">{{ initials(localOrder.user?.fullName) }}</div>
                      <span class="section-title">Thông tin khách hàng</span>
                    </div>
                    <div class="info-card">
                      <div class="info-row">
                        <span class="info-label">Họ và tên</span>
                        <span class="info-value info-value--bold">{{ localOrder.user?.fullName || "-" }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Số điện thoại</span>
                        <a v-if="localOrder.user?.phone" :href="`tel:${localOrder.user.phone}`"
                          class="info-value info-value--link">{{
                            localOrder.user.phone }}</a>
                        <span v-else class="info-value info-value--empty">-</span>
                      </div>
                      <div class="info-row info-row--align-start">
                        <span class="info-label">Địa chỉ</span>
                        <span class="info-value">{{ localOrder.user?.address || "-" }}</span>
                      </div>
                    </div>
                  </section>

                  <!-- Thông tin đơn hàng -->
                  <section class="info-section">
                    <div class="section-header">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        class="section-icon">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="section-title">Thông tin đơn hàng</span>
                    </div>
                    <div class="info-card">
                      <div class="info-row">
                        <span class="info-label">Hình thức</span>
                        <span class="info-value info-value--bold">{{ localOrder.shippingType || "-" }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Thời gian đặt</span>
                        <span class="info-value">{{ localOrder.createdAt || "-" }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Ngày giao</span>
                        <span class="info-value">{{ localOrder.deadline || "-" }}</span>
                      </div>
                    </div>
                  </section>

                  <!-- Ghi chú khách hàng -->
                  <section class="info-section">
                    <div class="section-header">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        class="section-icon">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span class="section-title">Ghi chú</span>
                    </div>
                    <div class="info-card">
                      <p v-if="localOrder.note" class="note-text">{{ localOrder.note }}</p>
                      <p v-else class="note-text info-value--empty">Không có ghi chú</p>
                    </div>
                  </section>

                  <!-- Chi tiết món -->
                  <section class="info-section">
                    <div class="section-header section-header--between">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2" class="section-icon">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span class="section-title">Chi tiết món</span>
                      </div>
                      <span class="qty-badge">{{ localOrder.qty }} món</span>
                    </div>

                    <div v-for="it in localOrder.itemsDetail || []" :key="it.id" class="item-row">
                      <div class="item-info">
                        <p class="item-name">{{ it.name }}</p>

                        <!-- Custom coffee info -->
                        <div v-if="it.isCustom" class="item-options item-options--custom">
                          <span v-if="it.beanName" class="option-tag option-tag--custom">{{ it.beanName }}</span>
                          <span v-if="it.baseName" class="option-tag option-tag--custom">{{ it.baseName }}</span>
                          <span v-if="it.milkName" class="option-tag option-tag--custom">{{ it.milkName }}</span>
                        </div>

                        <!-- Size có upsize (kèm giá) -->
                        <div class="item-options item-options--priced">
                          <div v-if="it.sizeName" class="option-line">
                            <span class="option-tag">Size {{ it.sizeName }}</span>
                            <span v-if="it.sizeExtra > 0" class="option-price">+{{ money(it.sizeExtra) }}</span>
                          </div>

                          <!-- Toppings kèm giá -->
                          <div v-for="(tp, idx) in it.toppings || []" :key="'tp-' + idx" class="option-line">
                            <span class="option-tag">+ {{ tp.name }}</span>
                            <span class="option-price">+{{ money(tp.price) }}</span>
                          </div>
                        </div>

                        <!-- Đá / Đường -->
                        <div v-if="it.ice != null || it.sugar != null" class="item-options item-options--specs">
                          <span v-if="it.sugar != null" class="option-tag option-tag--sugar">Đường {{ it.sugar
                          }}%</span>
                          <span v-if="it.ice != null" class="option-tag option-tag--ice">Đá {{ it.ice }}%</span>
                        </div>
                      </div>

                      <div class="item-qty">x{{ it.qty }}</div>

                      <div class="item-total">
                        <!-- Tổng tiền sau topping × qty -->
                        <span class="item-total__final">{{ money(it.total) }}</span>
                        <!-- Đơn giá gốc × qty (nhỏ, mờ) -->
                        <span class="item-total__unit">{{ money(it.basePrice) }} × {{ it.qty }}</span>
                      </div>
                    </div>
                  </section>
                </div>

                <!-- CỘT PHẢI -->
                <div class="modal-col-right">
                  <div class="payment-card">
                    <span class="section-title" style="display: block; margin-bottom: 14px;">Thanh toán</span>
                    <div class="payment-row">
                      <span class="payment-label">Tạm tính</span>
                      <span class="payment-value">{{ money(localOrder.subtotal) }}</span>
                    </div>
                    <div class="payment-row">
                      <span class="payment-label">Phí giao hàng</span>
                      <span class="payment-value">{{ money(localOrder.shippingFee ?? 0) }}</span>
                    </div>
                    <div class="payment-row payment-row--discount">
                      <span>Giảm giá</span>
                      <span v-if="localOrder.promoCode">({{ localOrder.promoCode }})</span>
                      <span>- {{ money(localOrder.discount) }}</span>
                    </div>
                    <div class="payment-total">
                      <span>Tổng cộng</span>
                      <span class="payment-total__amount">{{ money(localOrder.pay) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirm Modal -->
        <Transition name="confirm-pop">
          <div v-if="confirmOpen" class="confirm-backdrop" @click.self="closeConfirm">
            <div class="confirm-card">
              <div class="confirm-icon">
                <span class="confirm-icon__inner" :class="{ 'confirm-icon__inner--danger': requiresReason }">
                  <svg v-if="requiresReason" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  <template v-else>✦</template>
                </span>
              </div>
              <h3 class="confirm-title">{{ confirmTitle }}</h3>
              <p class="confirm-desc">{{ confirmDesc }}</p>

              <!-- Combo box lý do: chỉ hiện khi cancelled / delivery_failed -->
              <div v-if="requiresReason" class="confirm-reason">
                <label class="confirm-reason__label">
                  Lý do <span class="confirm-reason__required">*</span>
                </label>

                <select v-model="cancelReason" class="confirm-reason__select">
                  <option value="" disabled>-- Chọn lý do --</option>
                  <option v-for="opt in reasonOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>

                <p class="confirm-reason__hint">Lý do sẽ được lưu vào ghi chú của khách hàng.</p>
              </div>

              <div class="confirm-actions">
                <button class="confirm-btn confirm-btn--ghost" @click="closeConfirm">Huỷ</button>
                <button class="confirm-btn confirm-btn--primary" :disabled="requiresReason && !cancelReason.trim()"
                  @click="confirmProceed">{{ confirmPrimaryText }}</button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useOrderTable } from "../Front-End/JS/OrderTable";
import { useOrderDetailModal } from "../Front-End/JS/OrderDetailModal";

const props = defineProps({
  open: { type: Boolean, default: false },
  order: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "confirm", "cancel", "set-status"]);

const { money, statusText } = useOrderTable(() => { });
const { loading, error, fetchOrderDetail, close, emitConfirm, emitCancel, requestChangeStatus, statusSteps, getVisibleSteps } = useOrderDetailModal(props, emit, { money, statusText });

// ✅ Local copy của order — cập nhật ngay khi đổi trạng thái, không chờ props
const localOrder = ref(props.order ? { ...props.order } : null);


// ✅ Sync khi props.order thay đổi từ bên ngoài (loadOrders xong)
watch(() => props.order, (newOrder) => {
  if (newOrder) localOrder.value = { ...newOrder };
}, { deep: true, immediate: true });

// ── Confirm modal state ────────────────────────────
const confirmOpen = ref(false);
const confirmTitle = ref("Vui lòng xác nhận");
const confirmDesc = ref("");
const confirmPrimaryText = ref("Tiếp tục");
const pendingStatus = ref(null);
const cancelReason = ref("");

// Các trạng thái bắt buộc chọn lý do
const REASON_REQUIRED_STATUSES = ["cancelled", "delivery_failed"];

// Danh sách lý do theo từng trạng thái
const REASON_OPTIONS = {
  cancelled: [
    "Khách hàng tự huỷ đơn",
    "Khách hàng đặt nhầm / đặt trùng",
    "Hết nguyên liệu, không thể thực hiện",
    "Khách hàng không phản hồi khi xác nhận",
    "Đơn hàng nằm ngoài khu vực giao",
    "Cửa hàng tạm ngừng hoạt động",
  ],
  delivery_failed: [
    "Khách hàng không có mặt tại địa chỉ",
    "Địa chỉ giao hàng không chính xác",
    "Khách hàng không nghe máy khi liên hệ",
    "Khách hàng từ chối nhận hàng",
    "Sự cố giao thông / thời tiết",
    "Shipper gặp sự cố trên đường giao",
  ],
};

const requiresReason = computed(() =>
  REASON_REQUIRED_STATUSES.includes(pendingStatus.value)
);

const reasonOptions = computed(
  () => REASON_OPTIONS[pendingStatus.value] ?? []
);

const STATUS_ORDER = ["pending", "processing", "shipping", "delivered"];

const SHIPPING_TERMINALS = ["delivered", "delivery_failed"];

function openConfirmStatus(st) {
  if (!st) return;

  const currentStatus = localOrder.value?.status;
  const targetKey = st.key;

  if (targetKey !== "cancelled") {
    const curIdx = STATUS_ORDER.indexOf(currentStatus);
    const tgtIdx = STATUS_ORDER.indexOf(targetKey);

    if (currentStatus === "shipping" && targetKey === "delivery_failed") {
      // Hợp lệ, cho qua
    } else if (curIdx === -1 || tgtIdx === -1 || tgtIdx !== curIdx + 1) {
      confirmTitle.value = "Không thể chuyển trạng thái";
      confirmDesc.value =
        tgtIdx !== -1 && tgtIdx < curIdx
          ? "Không thể quay lại trạng thái đã qua."
          : `Chỉ được chuyển tuần tự. Bước tiếp theo hợp lệ là "${visibleSteps.value.find((s) => s.key === STATUS_ORDER[curIdx + 1])?.label ?? "—"
          }".`;
      confirmPrimaryText.value = "Đã hiểu";
      pendingStatus.value = null;
      cancelReason.value = "";
      confirmOpen.value = true;
      return;
    }
  }

  pendingStatus.value = targetKey;
  cancelReason.value = "";
  confirmTitle.value = "Vui lòng xác nhận";
  confirmDesc.value = `Bạn có chắc chắn muốn chuyển sang "${st.label}" không?`;
  confirmPrimaryText.value = "Tiếp tục";
  confirmOpen.value = true;
}

function closeConfirm() {
  confirmOpen.value = false;
  pendingStatus.value = null;
  cancelReason.value = "";
}

function confirmProceed() {
  if (!pendingStatus.value) return closeConfirm();
  if (requiresReason.value && !cancelReason.value.trim()) return;

  // ✅ Cập nhật localOrder ngay lập tức — timeline đổi ngay không chờ server
  localOrder.value = {
    ...localOrder.value,
    status: pendingStatus.value,
    ...(pendingStatus.value === 'delivery_failed' && { failReason: cancelReason.value.trim() }),
    ...(pendingStatus.value === 'cancelled' && { cancelReason: cancelReason.value.trim() }),
  };

  requestChangeStatus(pendingStatus.value, cancelReason.value.trim() || null);
  closeConfirm();
}

// ── Computed ───────────────────────────────────────
const visibleSteps = computed(() => getVisibleSteps(localOrder.value?.status));

const currentStatusIndex = computed(() => {
  const s = localOrder.value?.status;
  return visibleSteps.value.findIndex((x) => x.key === s);
});

const progressWidth = computed(() => {
  const cur = currentStatusIndex.value;
  const total = visibleSteps.value.length;
  if (cur < 0) return "0%";
  if (total <= 1) return "0%";
  return `${(cur / (total - 1)) * 100}%`;
});

function stepClass(st, idx) {
  const cur = currentStatusIndex.value;
  return {
    "is-current": idx === cur,
    "is-done": cur >= 0 && idx < cur,
    "is-todo": cur < 0 || idx > cur,
  };
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}
</script>

<style src="../Front-End/CSS/OrderDetailModal.css" scoped></style>