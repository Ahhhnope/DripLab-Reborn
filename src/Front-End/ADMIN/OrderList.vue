<template>
  <div class="page">
    <div class="page-title">Đơn hàng</div>

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
import { ref } from "vue";
import OrderStatusTab from "../../components/OrderStatusTab.vue";
import OrderFilter from "../../components/OrderFilter.vue";
import OrderTable from "../../components/OrderTable.vue";
import OrderDetailModal from "../../components/OrderDetailModal.vue";
import { useOrderList } from "../JS/OrderList";

const { activeTab, items, applyFilter } = useOrderList();

const detailOpen = ref(false);
const selectedOrder = ref(null);

function onView(row) {
  selectedOrder.value = row;   // lấy luôn data mẫu trong OrderList.js
  detailOpen.value = true;
}

function onConfirm(row) { console.log("confirm", row); }
function onCancel(row) { console.log("cancel", row); }
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