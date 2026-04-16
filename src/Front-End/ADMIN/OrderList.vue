<template>
  <div class="page">
    <div class="page-title">Quản Lý Đơn Hàng</div>

    <OrderStatusTab v-model="activeTab" />
    <OrderFilter @apply="applyFilter" />
    <OrderTable :items="items"
      @view="onView" 
      @edit-saved="handleEditSaved"
      @delete-confirmed="handleDeleteConfirmed"
      @confirm="onConfirm"
      @cancel="onCancel" />

    <OrderDetailModal
      v-model:open="detailOpen"
      :order="selectedOrder"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup>
// import { ref } from "vue";
// import OrderStatusTab from "../../components/OrderStatusTab.vue";
// import OrderFilter from "../../components/OrderFilter.vue";
// import OrderTable from "../../components/OrderTable.vue";
// import OrderDetailModal from "../../components/OrderDetailModal.vue";
// import { useOrderList } from "../JS/OrderList";

// const { activeTab, items, applyFilter } = useOrderList();

// const detailOpen = ref(false);
// const selectedOrder = ref(null);

// function onView(row) {
//   selectedOrder.value = row;   // lấy luôn data mẫu trong OrderList.js
//   detailOpen.value = true;
// }

// function onConfirm(row) { console.log("confirm", row); }
// function onCancel(row) { console.log("cancel", row); }

import { ref } from "vue";
import OrderStatusTab from "../../components/OrderStatusTab.vue";
import OrderFilter from "../../components/OrderFilter.vue";
import OrderTable from "../../components/OrderTable.vue";
import OrderDetailModal from "../../components/OrderDetailModal.vue";
import { useOrderList } from "../JS/OrderList";
import { notifyInvoiceUpdate } from "../../utils/bus";
import api from "../../api/axios";

const { activeTab, filter, allItems, items, applyFilter, loadOrders, mapStatus } = useOrderList();

const detailOpen = ref(false);
const selectedOrder = ref(null);

function onView(row) {
  selectedOrder.value = row;
  detailOpen.value = true;
}

function toVietnameseStatus(s) {
  const map = {
    'pending':    'Chờ xác nhận',
    'processing': 'Đang xử lý',
    'shipping':   'Đang vận chuyển',
    'delivered':  'Đã giao',
    'cancelled':  'Đã huỷ',
  };
  return map[s] ?? s;
}


async function handleEditSaved(updated) {
  // 1. Optimistic Update (Update local UI immediately)
  const idx = allItems.value.findIndex(o => o.id === updated.id);
  if (idx !== -1) allItems.value[idx] = { ...allItems.value[idx], ...updated };

  try {
    const vStatus = toVietnameseStatus(updated.status);
    
    // 2. Patch the order
    await api.patch(`/orders/update/${updated.id}/`, {
      status: vStatus,
      note: updated.note,
      paymentMethod: updated.shippingType
    });

    // 3. If it was delivered, tell the Invoice Table to reload
    if (vStatus === 'Đã giao') {
      notifyInvoiceUpdate();
    }

    await loadOrders(); // Refresh order list data from server
  } catch (e) {
    console.error("Update error:", e);
  }
}

async function handleDeleteConfirmed(row) {
  try {
    await api.delete(`/orders/remove/${row.id}`);
    allItems.value = allItems.value.filter(o => o.id !== row.id);
  } catch (e) {
    console.error("Delete failed:", e);
    alert("Lỗi: Không thể xóa đơn hàng này (Đã tồn tại hóa đơn).");
  }
}

async function createInvoiceFromOrder(order) {
  try {
    await api.post('/invoices/add', {
      orderId:        order.id,
      paymentMethod:  order.shippingType || 'COD',
      receiveType:    'Online',
      finalPrice:     order.pay,
      customerId:     order.customer?.id || null,
    });
  } catch (e) {
    // Nếu hóa đơn đã tồn tại (409) thì bỏ qua
    if (e.response?.status !== 409) {
      console.error('Lỗi tạo hóa đơn:', e);
    }
  }
}

// const emit = defineEmits(['status-updated']);

// const updateStatus = async (orderId, newStatus) => {
//   try {
//     await api.put(`/orders/${orderId}/status`, { status: newStatus });
    
//     // 1. Update local order UI
//     fetchOrders(); 
    
//     // 2. Tell the parent to reload invoices
//     emit('status-updated');
    
//   } catch (error) {
//     console.error("Failed to update status", error);
//   }
// };

function onConfirm(row) { handleEditSaved({ ...row, status: 'processing' }); }
function onCancel(row)  { handleEditSaved({ ...row, status: 'cancelled' }); }
</script>

<style scoped>
.page-title {
  text-align: left;      /* Căn giữa chữ */
  font-size: 28px;         /* Làm chữ to ra (bạn có thể thay đổi số này) */
  font-weight: bold;       /* In đậm chữ cho giống tiêu đề */
  margin-bottom: 20px;     /* Tạo khoảng cách với phần bộ lọc phía dưới */
  color: #333;             /* Màu chữ (tuỳ chọn) */
}
</style>