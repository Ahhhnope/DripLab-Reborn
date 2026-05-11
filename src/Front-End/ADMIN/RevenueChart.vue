<template>
  <div class="revenue-chart-wrap">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const props = defineProps({
  data: { type: Object, required: true }
})

const canvas = ref(null)
let chart = null

function build() {
  if (chart) chart.destroy()
  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels: props.data.labels,
      datasets: [{
        label: 'Doanh thu (đ)',
        data: props.data.values,
        borderColor: '#6f4e37',
        backgroundColor: 'rgba(111,78,55,0.10)',
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#6f4e37',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.42,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2c1a0e',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: ctx => ' ' + ctx.parsed.y.toLocaleString('vi-VN') + ' đ'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,.05)' },
          ticks: {
            color: '#9c7b65',
            font: { size: 10 },
            callback: v => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3) + 'K' : v
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#9c7b65', font: { size: 10 } }
        }
      }
    }
  })
}

onMounted(build)
watch(() => props.data, build, { deep: true })
</script>