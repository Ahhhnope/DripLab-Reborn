<template>
  <div class="donut-wrap">
    <div class="donut-svg-wrap">
      <svg viewBox="0 0 120 120" width="180" height="180">
        <circle cx="60" cy="60" r="46" fill="none" stroke="#f5ede3" stroke-width="20" />
        <circle
          v-for="(seg, i) in computed"
          :key="i"
          cx="60" cy="60" r="46"
          fill="none"
          :stroke="seg.color"
          stroke-width="20"
          :stroke-dasharray="seg.dash"
          :stroke-dashoffset="seg.offset"
          style="transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dasharray .6s ease;"
        />
      </svg>
      <div class="donut-center-label">
        <span class="donut-center-value">{{ total }}</span>
        <span class="donut-center-text">{{ centerLabel }}</span>
      </div>
    </div>

    <div class="donut-legend">
      <div v-for="seg in segments" :key="seg.label" class="donut-legend-item">
        <div class="donut-legend-left">
          <span class="donut-dot" :style="{ background: seg.color }"></span>
          <span class="donut-legend-name">{{ seg.label }}</span>
        </div>
        <span class="donut-legend-pct">{{ seg.value }} ({{ seg.pct }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed as vComputed } from 'vue'

const props = defineProps({
  segments:    { type: Array,  required: true },
  total:       { type: Number, required: true },
  centerLabel: { type: String, default: 'Tổng' }
})

const CIRC = 2 * Math.PI * 46 // ≈ 289.03

const computed = vComputed(() => {
  let offset = 0
  return props.segments.map(seg => {
    const dash = (seg.pct / 100) * CIRC
    const result = { ...seg, dash: `${dash} ${CIRC - dash}`, offset: -offset }
    offset += dash
    return result
  })
})
</script>