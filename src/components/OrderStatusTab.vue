<template>
  <div class="card">
    <button
      v-for="t in ORDER_TABS"
      :key="t.value"
      class="tab"
      :class="{ active: modelValue === t.value }"
      @click="select(t.value)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<script setup>
import { ORDER_TABS, useOrderStatusTab } from "../Front-End/JS/OrderStatusTab";

defineProps({ modelValue: { type: String, default: "all" } });
const emit = defineEmits(["update:modelValue"]);

const { select } = useOrderStatusTab(emit);
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 14px;
  padding: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tab {
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #e6ebf2;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  transition: 0.15s ease;
}

.tab:hover {
  border-color: #cfd8e3;
  background: #f9fafb;
}

.tab.active {
  background: #1677ff;
  border-color: #1677ff;
  color: #fff;
}
</style>
