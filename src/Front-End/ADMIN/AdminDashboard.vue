<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
import DashboardChart from './DashboardChart.vue';

const stats = ref(null);
const error = ref(null); // Add this

onMounted(async () => {
    try {
        const res = await api.get('/admin/stats/dashboard-stats');
        console.log("API Response:", res.data); // Look for this in F12 Console!
        stats.value = res.data;
    } catch (err) {
        console.error("API Error:", err);
        error.value = "Không thể tải dữ liệu từ máy chủ.";
    }
});
</script>

<template>
  <div v-if="stats" class="admin-dashboard p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      <div class="bg-stone-900 text-white p-6 rounded-xl border border-stone-800">
        <p class="text-stone-400 text-sm uppercase font-bold mb-2">Tổng tiền</p>
        <h2 class="text-3xl font-bold">{{ stats.totalRevenue?.toLocaleString('vi-VN') }} <span class="text-lg">₫</span></h2>
      </div>

      <div class="bg-stone-900 text-white p-6 rounded-xl border border-stone-800">
        <p class="text-stone-400 text-sm uppercase font-bold mb-2">Tổng đơn hàng</p>
        <h2 class="text-4xl font-bold">{{ stats.totalOrders }}</h2>
      </div>

      <div class="bg-stone-900 text-white p-6 rounded-xl border border-stone-800">
        <p class="text-stone-400 text-sm uppercase font-bold mb-2">Khách hàng</p>
        <h2 class="text-4xl font-bold">{{ stats.totalCustomers }}</h2>
      </div>
      
    </div>

    <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
       <h3 class="text-lg font-bold mb-4 text-stone-800">Biểu đồ doanh thu</h3>
       <div class="h-[400px]">
        <DashboardChart v-if="stats.chartData" :apiData="stats.chartData" />
       </div>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 100%; /* Important to fill the [400px] parent */
  width: 100%;
}
</style>