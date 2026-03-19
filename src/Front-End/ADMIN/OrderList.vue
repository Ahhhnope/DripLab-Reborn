<template>
  <div class="page">
    <div class="page-title">Đơn hàng</div>

    <OrderStatusTab v-model="activeTab" />
    <OrderFilter @apply="applyFilter" />
    <OrderTable :items="items" @view="onView" @confirm="onConfirm" @cancel="onCancel" />
  </div>
</template>

<script setup>
import OrderStatusTab from "../../components/OrderStatusTab.vue";
import OrderFilter from "../../components/OrderFilter.vue";
import OrderTable from "../../components/OrderTable.vue";
import { useOrderList } from "../JS/OrderList";

const { activeTab, items, applyFilter } = useOrderList();

function onView(row) { console.log("view", row); }
function onConfirm(row) { console.log("confirm", row); }
function onCancel(row) { console.log("cancel", row); }
</script>
