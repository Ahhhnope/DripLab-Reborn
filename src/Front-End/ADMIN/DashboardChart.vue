<template>
  <div class="chart-box">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  CategoryScale, // Needed for X-axis (Dates)
  LinearScale,   // Needed for Y-axis (Money)
  PointElement,
  LineController, // Needed to handle Line logic
  Filler          // Needed if you use 'fill: true'
} from 'chart.js'
import { computed } from 'vue'

ChartJS.register(
  Title, Tooltip, Legend, 
  LineElement, PointElement, LineController, 
  CategoryScale, LinearScale, Filler
)

const props = defineProps(['apiData'])

const chartData = computed(() => ({
  labels: props.apiData?.labels || [],
  datasets: [
    {
      label: 'Doanh thu (VNĐ)',
      backgroundColor: 'rgba(66, 184, 131, 0.2)',
      borderColor: '#42b883',
      pointBackgroundColor: '#42b883',
      data: props.apiData?.datasets || [],
      tension: 0.4,
      fill: true
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#888'
      }
    },
    x: {
      ticks: {
        color: '#888'
      }
    }
  }
}
</script>