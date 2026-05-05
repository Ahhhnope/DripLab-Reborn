<template>
  <div class="page">
    <div class="page-title">Quản Lý Đơn Hàng</div>

    <OrderStatusTab v-model="activeTab" />
    <OrderFilter @apply="applyFilter" />
    <OrderTable :items="pagedItems" @view="onView" />

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex justify-center">
      <div class="flex items-center gap-2">
        <button
          class="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          :disabled="page === 1"
          @click="page--"
        >‹</button>

        <button
          v-for="p in pages"
          :key="p"
          class="flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold"
          :class="p === page
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          @click="page = p"
        >{{ p }}</button>

        <button
          class="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          :disabled="page === totalPages"
          @click="page++"
        >›</button>
      </div>
    </div>

    <OrderDetailModal
      v-model:open="detailOpen"
      :order="selectedOrder"
      @confirm="onConfirm"
      @cancel="onCancel"
      @set-status="onSetStatus"
    />

    
<Teleport to="body">
  <Transition name="notify-pop">
    <div
      v-if="notifyModal.show"
      class="notify-backdrop"
      @click.self="notifyModal.show = false"
    >
      <div class="notify-card">
        <div class="notify-icon">
          <div class="notify-icon__inner">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
        </div>
        <h3 class="notify-title">{{ notifyModal.title }}</h3>
        <p class="notify-desc">{{ notifyModal.message }}</p>
        <button class="notify-btn" @click="notifyModal.show = false">ĐÓNG</button>
      </div>
    </div>
  </Transition>
</Teleport>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from "vue";
import OrderStatusTab from "../../components/OrderStatusTab.vue";
import OrderFilter from "../../components/OrderFilter.vue";
import OrderTable from "../../components/OrderTable.vue";
import OrderDetailModal from "../../components/OrderDetailModal.vue";
import { useOrderList } from "../JS/OrderList";
import { notifyInvoiceUpdate } from "../../utils/bus";
import api from "../../api/axios";

const {
  activeTab,
  applyFilter,
  loadOrders,
  page,
  pageSize,
  totalPages,
  pagedItems,
} = useOrderList();

const detailOpen = ref(false);
const selectedOrder = ref(null);

// ✅ Notify modal state
const notifyModal = reactive({
  show: false,
  title: "",
  message: "",
});

function showNotify(title, message) {
  notifyModal.title = title;
  notifyModal.message = message;
  notifyModal.show = true;
}

function onView(row) {
  selectedOrder.value = row;
  detailOpen.value = true;
}

function toVietnameseStatus(s) {
  const map = {
    pending: "Chờ xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang vận chuyển",
    delivered: "Đã giao",
    cancelled: "Đã huỷ",
    delivery_failed: "Giao hàng không thành công",
  };
  return map[s] ?? s;
}

async function patchOrder(updated) {
  const finalStatuses = ["delivered", "delivery_failed", "cancelled"];

  if (selectedOrder.value && finalStatuses.includes(selectedOrder.value.status)) {
    // ✅ Dùng modal đẹp thay alert()
    showNotify(
      "Không thể cập nhật",
      "Không thể thay đổi trạng thái của đơn hàng đã hoàn tất hoặc đã hủy!"
    );
    return;
  }

  try {
    const vStatus = toVietnameseStatus(updated.status);

    await api.patch(`/orders/update/${updated.id}`, {
      status: vStatus,
      note: updated.note,
      paymentMethod: updated.shippingType,
    });

    if (vStatus === "Đã giao") notifyInvoiceUpdate();

    await loadOrders();

    if (selectedOrder.value && selectedOrder.value.id === updated.id) {
      selectedOrder.value = { ...selectedOrder.value, status: updated.status };
    }
  } catch (e) {
    console.error("Update error:", e);
    // ✅ Cả lỗi API cũng dùng modal
    showNotify("Lỗi", "Lỗi khi cập nhật đơn hàng!");
  }
}

function onConfirm(row) {
  onSetStatus({ id: row.id, status: "processing" });
}

function onCancel(row) {
  onSetStatus({ id: row.id, status: "cancelled" });
}

function onSetStatus({ id, status }) {
  patchOrder({ id, status });
}

const pages = computed(() => {
  const total = totalPages.value;
  const current = page.value;
  const windowSize = 5;

  if (total <= windowSize) return Array.from({ length: total }, (_, i) => i + 1);

  let start = Math.max(1, current - 2);
  let end = start + windowSize - 1;

  if (end > total) {
    end = total;
    start = end - windowSize + 1;
  }

  const out = [];
  for (let p = start; p <= end; p++) out.push(p);
  return out;
});
</script>

<style scoped>
.page-title {
  text-align: left;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

/* ── NOTIFY BACKDROP ──────────────────────────────── */
.notify-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(60, 42, 33, 0.42);
  backdrop-filter: blur(6px);
  padding: 18px;
}

/* ── NOTIFY CARD ──────────────────────────────────── */
.notify-card {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 28px;
  padding: 34px 28px 26px;
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.25);
  text-align: center;
}

/* ── ICON ─────────────────────────────────────────── */
.notify-icon {
  width: 66px;
  height: 66px;
  border-radius: 999px;
  background: #fee2e2;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
}

.notify-icon__inner {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  background: #ffffff;
  display: grid;
  place-items: center;
  color: #b91c1c;
  box-shadow: 0 12px 26px rgba(185, 28, 28, 0.15);
}

/* ── TEXT ─────────────────────────────────────────── */
.notify-title {
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.5px;
  color: #3c2a21;
  text-transform: uppercase;
}

.notify-desc {
  margin: 12px 0 26px;
  font-size: 15px;
  line-height: 1.6;
  color: #64748b;
}

/* ── NÚT ĐÓNG ─────────────────────────────────────── */
.notify-btn {
  width: 100%;
  padding: 14px 18px;
  border: none;
  border-radius: 18px;
  background: #3c2a21;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(60, 42, 33, 0.25);
  transition: filter 0.15s, transform 0.08s;
}

.notify-btn:hover {
  filter: brightness(1.1);
}

.notify-btn:active {
  transform: scale(0.98);
}

/* ── TRANSITION ───────────────────────────────────── */
.notify-pop-enter-active {
  transition: opacity 160ms ease;
}
.notify-pop-leave-active {
  transition: opacity 160ms ease;
}
.notify-pop-enter-from,
.notify-pop-leave-to {
  opacity: 0;
}
.notify-pop-enter-active .notify-card {
  animation: notifyPop 180ms cubic-bezier(0.2, 0.9, 0.2, 1);
}

@keyframes notifyPop {
  from {
    transform: translateY(10px) scale(0.97);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>