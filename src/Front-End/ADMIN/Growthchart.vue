<template>
  <div>
    <div class="growth-chart-wrap">
      <canvas ref="canvas"></canvas>
    </div>
    <div class="growth-legend">
      <div v-for="s in data.series" :key="s.label" class="growth-legend-item">
        <span class="growth-legend-line" :style="{ background: s.color }"></span>
        {{ s.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Tooltip
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip)

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
      datasets: props.data.series.map(s => ({
        label: s.label,
        data: s.values,
        borderColor: s.color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: s.color,
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        tension: 0.38
      }))
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
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`
          }
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(0,0,0,.05)' },
          ticks: {
            color: '#9c7b65',
            font: { size: 10 },
            callback: v => v + '%'
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