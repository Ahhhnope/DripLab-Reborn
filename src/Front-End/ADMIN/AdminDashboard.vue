<template>
  <div class="thong-ke-wrapper">

    <div class="tk-header">
      <div class="tk-header-left">
        <span class="tk-icon"></span>
        <div>
          <h1 class="tk-title">Thống Kê</h1>
          <p class="tk-subtitle">Báo cáo kinh doanh thời gian thực</p>
        </div>
      </div>
      <div class="tk-header-right">
        <span class="tk-live-dot"></span>
        <span>Đang cập nhật</span>
      </div>
    </div>

    <div class="tk-cards">
      <div v-for="card in summaryCards" :key="card.type" class="tk-card" :class="'tk-card--' + card.type">
        <div class="tk-card-header">
          <span class="tk-card-period">{{ card.period }}</span>
          <span class="tk-card-trend" :class="card.trendUp ? 'up' : 'down'">
            {{ card.trendUp ? '↑' : '↓' }} {{ card.trend }}
          </span>
        </div>
        <div class="tk-card-value">{{ card.value }}</div>
        <div class="tk-card-meta">
          <span>{{ card.products }} sản phẩm</span>
          <span>{{ card.orders }} đơn</span>
        </div>
        <div class="tk-card-status">
          <span class="status-done">{{ card.done }}</span>
          <span class="status-cancel">{{ card.cancel }}</span>
          <span class="status-process">{{ card.process }}</span>
        </div>
      </div>
    </div>

    <div class="tk-filter-bar">
      <div class="tk-filter-left">
        <span class="tk-filter-label">Bộ Lọc</span>
        <div class="tk-filter-tabs">
          <button v-for="tab in filterTabs" :key="tab.key" class="tk-tab" :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key">{{ tab.label }}</button>
          <button class="tk-tab tk-tab--custom">Tuỳ chỉnh</button>
        </div>
      </div>
    </div>

    <div class="tk-stats-row">
      <div v-for="stat in statsRow" :key="stat.label" class="tk-stat-item">
        <div class="tk-stat-label">{{ stat.label }}</div>
        <div class="tk-stat-value" :class="stat.color">{{ stat.value }}</div>
      </div>
    </div>

    <div class="tk-charts-row">
      <div class="tk-chart-box">
        <div class="tk-chart-title">
          <span>📈 Biểu Đồ Doanh Thu</span>
          <span class="tk-chart-hint">Tháng này</span>
        </div>
        <RevenueChart :data="revenueData" />
      </div>
      <div class="tk-chart-box">
        <div class="tk-chart-title"><span>🍩 Phân Bổ Trạng Thái</span></div>
        <DonutChart :segments="orderStatusSegments" :total="orderStatusTotal" center-label="Tổng đơn" />
      </div>
    </div>

    <div class="tk-charts-row">
      <div class="tk-chart-box">
        <div class="tk-chart-title"><span>🏆 Top Sản Phẩm Bán Chạy</span></div>
        <TopProductsTable :items="topProducts" />
      </div>
      <div class="tk-chart-box">
        <div class="tk-chart-title"><span>📊 Tốc Độ Tăng Trưởng (%)</span></div>
        <GrowthChart :data="growthData" />
      </div>
    </div>

  </div>
</template>

<!-- <script setup>
import { ref } from 'vue'

import {
  filterTabs,
  summaryCards,
  statsRow,
  revenueData,
  orderStatusSegments,
  lowStockItems,
  sizeSegments,
  topProducts,
  growthData
} from '../JS/thongke.js'

import RevenueChart from './RevenueChart.vue'
import DonutChart from './Donutchart.vue'
import LowStockTable from './Lowstocktable.vue'
import TopProductsTable from './Topproductstable.vue'
import GrowthChart from './Growthchart.vue'

const activeTab = ref('today')
</script> -->

<script setup>
import { useThongKe } from '../JS/thongke.js'

import RevenueChart     from './RevenueChart.vue'
import DonutChart       from './Donutchart.vue'
import LowStockTable    from './Lowstocktable.vue'
import TopProductsTable from './Topproductstable.vue'
import GrowthChart      from './Growthchart.vue'

const {
  activeTab, loading, filterTabs,
  summaryCards, statsRow,
  revenueData, orderStatusSegments, orderStatusTotal,
  topProducts, growthData,
} = useThongKe()
</script>

<style src="../CSS/ThongKe.css" scoped></style>