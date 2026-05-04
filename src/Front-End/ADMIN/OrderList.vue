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
          aria-label="Trang trước"
        >
          ‹
        </button>

        <button
          v-for="p in pages"
          :key="p"
          class="flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold"
          :class="p === page
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          @click="page = p"
        >
          {{ p }}
        </button>

        <button
          class="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          :disabled="page === totalPages"
          @click="page++"
          aria-label="Trang sau"
        >
          ›
        </button>
      </div>
    </div>

    <OrderDetailModal
      v-model:open="detailOpen"
      :order="selectedOrder"
      @confirm="onConfirm"
      @cancel="onCancel"
      @set-status="onSetStatus"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
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

  // pagination from composable
  page,
  pageSize,
  totalPages,
  pagedItems,
} = useOrderList();

const detailOpen = ref(false);
const selectedOrder = ref(null);

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
      alert("Không thể thay đổi trạng thái của đơn hàng đã hoàn tất hoặc đã hủy!");
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
    alert("Lỗi khi cập nhật đơn hàng!");
  }
}

// Nút xác nhận/huỷ vẫn giữ trong modal chi tiết
function onConfirm(row) {
  onSetStatus({ id: row.id, status: "processing" });
}

function onCancel(row) {
  onSetStatus({ id: row.id, status: "cancelled" });
}

function onSetStatus({id, status}) {
  patchOrder({ id, status });

  // detailOpen.value = false;
}

// pages hiển thị đẹp: tối đa 5 trang, có trượt theo page hiện tại
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
</style>
