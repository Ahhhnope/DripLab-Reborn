<template>
  <div class="thong-ke-wrapper">

    <!-- ── HEADER ─────────────────────────────────────────── -->
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

    <!-- ── SUMMARY CARDS ──────────────────────────────────── -->
    <div class="tk-cards">
      <div
        v-for="card in summaryCards" :key="card.type"
        class="tk-card" :class="'tk-card--' + card.type"
      >
        <div class="tk-card-header">
          <span class="tk-card-period">{{ card.period }}</span>
          <span class="tk-card-trend" :class="card.trendUp ? 'up' : 'down'">
            {{ card.trendUp ? '↑' : '↓' }} {{ card.trend }}
          </span>
        </div>
        <div class="tk-card-value">{{ card.value }}</div>
        <div class="tk-card-meta">
          <span>🛍 {{ card.products }} sản phẩm</span>
          <span>📦 {{ card.orders }} đơn</span>
        </div>
        <div class="tk-card-status">
          <span class="status-done">✓ {{ card.done }}</span>
          <span class="status-cancel">✗ {{ card.cancel }}</span>
          <span class="status-process">⟳ {{ card.process }}</span>
        </div>
      </div>
    </div>

    <!-- ── FILTER BAR ─────────────────────────────────────── -->
    <div class="tk-filter-bar">
      <div class="tk-filter-left">
        <span class="tk-filter-label">Bộ Lọc</span>
        <div class="tk-filter-tabs">
          <button
            v-for="tab in filterTabs" :key="tab.key"
            class="tk-tab" :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >{{ tab.label }}</button>
          <!-- <button class="tk-tab tk-tab--custom">Tuỳ chỉnh</button> -->
        </div>
      </div>
      <!-- <div class="tk-filter-actions">
        <button class="tk-btn-outline">✉ Gửi Báo Cáo</button>
        <button class="tk-btn-solid">⬇ Xuất Excel</button>
      </div> -->
    </div>

    <!-- ── STATS STRIP ────────────────────────────────────── -->
    <div class="tk-stats-row">
      <div v-for="stat in statsRow" :key="stat.label" class="tk-stat-item">
        <div class="tk-stat-label">{{ stat.label }}</div>
        <div class="tk-stat-value" :class="stat.color">{{ stat.value }}</div>
      </div>
    </div>

    <!-- ── ROW 1: Doanh thu + Trạng thái đơn ─────────────── -->
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
        <DonutChart
          :segments="orderStatusSegments"
          :total="115"
          center-label="Tổng đơn"
        />
      </div>
    </div>

    <!-- ── ROW 2: Top sản phẩm + Tăng trưởng ────────────── -->
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

<script setup>
import { ref } from 'vue'

// ── Import data ───────────────────────────────────────────
// ⚠ Đặt thongke.js cùng thư mục với AdminDashboard.vue (trong ADMIN/)
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

// ── Import child components ───────────────────────────────
// ⚠ Tên file phải khớp chính xác chữ hoa/thường với tên thực trên ổ đĩa
import RevenueChart     from './RevenueChart.vue'
import DonutChart       from './Donutchart.vue'      // file: DonutChart.vue
import LowStockTable    from './Lowstocktable.vue'   // file: LowStockTable.vue
import TopProductsTable from './Topproductstable.vue'
import GrowthChart      from './Growthchart.vue'     // file: GrowthChart.vue

// ── Local state ───────────────────────────────────────────
const activeTab = ref('today')
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap');

/* ── Variables ────────────────────────────────────────────── */
.thong-ke-wrapper {
  --coffee-dark:   #2c1a0e;
  --coffee-mid:    #6f4e37;
  --coffee-light:  #a07850;
  --coffee-cream:  #f5ede3;
  --coffee-milk:   #fdf6ee;
  --green:         #27ae60;
  --orange:        #f39c12;
  --red:           #e74c3c;
  --blue:          #3b82f6;
  --border:        #e8d5c4;
  --shadow:        0 2px 8px rgba(111,78,55,.10);
  --shadow-md:     0 4px 20px rgba(111,78,55,.14);
  --r:             16px;

  font-family: 'Be Vietnam Pro', sans-serif;
  background: #faf4ee;
  min-height: 100vh;
  padding: 28px 32px 48px;
  color: var(--coffee-dark);
}

/* ── Header ──────────────────────────────────────────────── */
.tk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.tk-header-left { display: flex; align-items: center; gap: 14px; }
.tk-icon { font-size: 2rem; filter: drop-shadow(0 2px 4px rgba(111,78,55,.3)); }
.tk-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--coffee-dark);
}
.tk-subtitle { font-size: .78rem; color: #9c7b65; margin: 2px 0 0; }
.tk-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: .78rem;
  color: #4a3728;
  box-shadow: var(--shadow);
}
.tk-live-dot {
  width: 8px; height: 8px;
  background: var(--green);
  border-radius: 50%;
  animation: pulse 1.6s infinite;
}
@keyframes pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.5; transform:scale(1.35); }
}

/* ── Summary Cards ───────────────────────────────────────── */
.tk-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.tk-card {
  background: white;
  border-radius: var(--r);
  padding: 20px 22px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  transition: transform .2s, box-shadow .2s;
}
.tk-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: var(--r) var(--r) 0 0;
}
.tk-card--today::before  { background: var(--coffee-mid); }
.tk-card--week::before   { background: var(--blue); }
.tk-card--month::before  { background: var(--orange); }
.tk-card--year::before   { background: var(--green); }
.tk-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.tk-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tk-card-period { font-size: .72rem; font-weight: 600; color: #9c7b65; text-transform: uppercase; letter-spacing: .06em; }
.tk-card-trend  { font-size: .72rem; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
.tk-card-trend.up   { background: #e8f8f0; color: var(--green); }
.tk-card-trend.down { background: #fef0f0; color: var(--red); }
.tk-card-value {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--coffee-dark);
  margin-bottom: 8px;
}
.tk-card-meta   { display: flex; gap: 12px; font-size: .72rem; color: #9c7b65; margin-bottom: 6px; }
.tk-card-status { display: flex; gap: 10px; font-size: .7rem; font-weight: 600; }
.status-done    { color: var(--green); }
.status-cancel  { color: var(--red); }
.status-process { color: var(--orange); }

/* ── Filter Bar ──────────────────────────────────────────── */
.tk-filter-bar {
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  box-shadow: var(--shadow);
  flex-wrap: wrap;
  gap: 12px;
}
.tk-filter-left  { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.tk-filter-label { font-size: .72rem; font-weight: 600; color: #9c7b65; text-transform: uppercase; letter-spacing: .06em; }
.tk-filter-tabs  { display: flex; gap: 6px; flex-wrap: wrap; }
.tk-tab {
  padding: 7px 16px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: transparent;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: .78rem;
  font-weight: 500;
  color: #4a3728;
  cursor: pointer;
  transition: all .18s;
}
.tk-tab:hover  { border-color: var(--coffee-light); color: var(--coffee-mid); }
.tk-tab.active { background: var(--coffee-dark); border-color: var(--coffee-dark); color: white; }
.tk-tab--custom { border-style: dashed; color: #9c7b65; }
.tk-filter-actions { display: flex; gap: 10px; }
.tk-btn-outline, .tk-btn-solid {
  padding: 8px 16px;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: .78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s;
}
.tk-btn-outline { border: 1.5px solid var(--coffee-mid); background: transparent; color: var(--coffee-mid); }
.tk-btn-outline:hover { background: var(--coffee-cream); }
.tk-btn-solid   { border: none; background: var(--coffee-mid); color: white; }
.tk-btn-solid:hover   { background: var(--coffee-dark); }

/* ── Stats Strip ─────────────────────────────────────────── */
.tk-stats-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
}
.tk-stat-item {
  padding: 14px 12px;
  border-right: 1px solid var(--border);
  text-align: center;
  transition: background .18s;
}
.tk-stat-item:last-child { border-right: none; }
.tk-stat-item:hover { background: var(--coffee-milk); }
.tk-stat-label { font-size: .65rem; font-weight: 600; color: #9c7b65; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; white-space: nowrap; }
.tk-stat-value { font-size: .9rem; font-weight: 700; color: var(--coffee-dark); white-space: nowrap; }
.color-green   { color: var(--green) !important; }
.color-orange  { color: var(--orange) !important; }
.color-red     { color: var(--red) !important; }
.color-blue    { color: var(--blue) !important; }
.color-primary { color: var(--coffee-mid) !important; }

/* ── Chart Layout ────────────────────────────────────────── */
.tk-charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
.tk-chart-box {
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 20px 22px;
  box-shadow: var(--shadow);
  min-height: 300px;
}
.tk-chart-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: .85rem;
  font-weight: 700;
  color: var(--coffee-dark);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--coffee-cream);
}
.tk-chart-title--warning { color: var(--red); }
.tk-chart-hint  { font-size: .72rem; font-weight: 400; color: #9c7b65; }
.tk-badge-warning {
  font-size: .7rem;
  padding: 3px 10px;
  border-radius: 20px;
  background: #fff0f0;
  color: var(--red);
  font-weight: 600;
  border: 1px solid #f9c7c7;
}

/* ── Revenue / Growth canvas ─────────────────────────────── */
.revenue-chart-wrap,
.growth-chart-wrap { height: 240px; position: relative; }
.growth-legend { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 10px; }
.growth-legend-item { display: flex; align-items: center; gap: 6px; font-size: .72rem; color: #4a3728; }
.growth-legend-line { width: 18px; height: 3px; border-radius: 2px; }

/* ── Donut ───────────────────────────────────────────────── */
.donut-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.donut-svg-wrap { position: relative; width: 180px; height: 180px; }
.donut-center-label {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.donut-center-value {
  display: block;
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: var(--coffee-dark);
}
.donut-center-text  { display: block; font-size: .68rem; color: #9c7b65; margin-top: 2px; }
.donut-legend       { display: flex; flex-direction: column; gap: 7px; width: 100%; }
.donut-legend-item  { display: flex; align-items: center; justify-content: space-between; font-size: .75rem; }
.donut-legend-left  { display: flex; align-items: center; gap: 8px; }
.donut-dot          { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.donut-legend-name  { color: #4a3728; font-weight: 500; }
.donut-legend-pct   { color: #9c7b65; font-size: .7rem; }

/* ── Tables ──────────────────────────────────────────────── */
.low-stock-table,
.top-products-table { width: 100%; border-collapse: collapse; font-size: .78rem; }
.low-stock-table th,
.top-products-table th {
  text-align: left;
  font-size: .68rem;
  font-weight: 600;
  color: #9c7b65;
  text-transform: uppercase;
  letter-spacing: .05em;
  padding: 0 10px 10px;
  border-bottom: 1.5px solid var(--coffee-cream);
}
.low-stock-table td,
.top-products-table td {
  padding: 9px 10px;
  border-bottom: 1px solid var(--coffee-cream);
  color: #4a3728;
  vertical-align: middle;
}
.low-stock-table tr:last-child td,
.top-products-table tr:last-child td { border-bottom: none; }
.low-stock-table tr:hover td,
.top-products-table tr:hover td { background: var(--coffee-milk); }
.size-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 20px;
  border-radius: 5px;
  background: var(--coffee-cream);
  color: var(--coffee-mid);
  font-size: .68rem; font-weight: 700;
}
.stock-zero  { color: var(--red);    font-weight: 700; }
.stock-low   { color: var(--orange); font-weight: 700; }
.stock-ok    { color: var(--green);  font-weight: 600; }
.rank-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px;
  border-radius: 8px; font-size: .75rem; font-weight: 700;
}
.rank-gold   { background: #fff8e1; color: #f59e0b; border: 1.5px solid #fcd34d; }
.rank-silver { background: #f3f4f6; color: #9ca3af; border: 1.5px solid #d1d5db; }
.rank-bronze { background: #fff3e0; color: #d97706; border: 1.5px solid #fcd3a0; }
.rank-plain  { background: var(--coffee-cream); color: #9c7b65; border: 1.5px solid var(--border); }
.product-name  { font-weight: 600; color: var(--coffee-dark); }
.product-size  { font-size: .68rem; color: #9c7b65; }
.product-price { color: var(--red); font-weight: 600; }
.sold-badge {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 3px 10px; border-radius: 20px;
  background: #e8f8f0; color: var(--green);
  font-weight: 700; font-size: .75rem;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1200px) {
  .tk-cards      { grid-template-columns: repeat(2, 1fr); }
  .tk-stats-row  { grid-template-columns: repeat(4, 1fr); }
  .tk-charts-row { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .thong-ke-wrapper { padding: 16px; }
  .tk-cards      { grid-template-columns: 1fr 1fr; }
  .tk-stats-row  { grid-template-columns: repeat(2, 1fr); }
  .tk-filter-bar { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 480px) {
  .tk-cards { grid-template-columns: 1fr; }
}
</style>