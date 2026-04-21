<!-- Brewing.vue -->
<script setup>
import { ref, onBeforeUnmount, watch, nextTick } from 'vue'
import { useBrewing } from '../JS-USER/Brewing.js'
import dripLabLogo from '../IMG/dripLab_Logo_Footer.png'
import driplabLogo2 from '../IMG/DripLab_Logo.png'

const {
  beanOptions, baseOptions, milkOptions, toppingOptions,
  sizeOptions, iceOptions, sugarOptions,
  STEPS, selection, currentStep, isComplete, stepDone,
  toppingCountLabel,
  selectBean, selectBase, selectMilk, toggleTopping, confirmTopping,
  selectSize, incQty, decQty,
  goToStep, nextStep, prevStep, reset,
  cupLayers, animTick,
  selectedBean, selectedBase, selectedMilk, selectedSize,
  price, formatVnd,
  notice,
  logoUrl,
} = useBrewing()

// ─── Popup thông báo "đã thêm vào giỏ" ───────────────────────
const cartPopupOpen = ref(false)
const popupBackdropEl = ref(null)

function openCartPopup() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  setTimeout(() => {
    cartPopupOpen.value = true
    document.documentElement.classList.add('no-scroll')
  }, 500)
}

watch(cartPopupOpen, async (v) => {
  if (v) {
    await nextTick()
    popupBackdropEl.value?.focus?.()
  }
})

function closeCartPopup() {
  cartPopupOpen.value = false
  document.documentElement.classList.remove('no-scroll')
}

function addToCart() {
  openCartPopup()
}

function onPopupKeydown(e) {
  if (e.key === 'Escape') closeCartPopup()
}

onBeforeUnmount(() => {
  document.documentElement.classList.remove('no-scroll')
})
</script>

<template>
  <div class="brewing-page">
    <main class="mx-auto max-w-6xl px-4 py-8">
      <div class="brew-layout">

        <!-- ══════════════════════════════════════════
             TRÁI: Cốc xem trước
        ══════════════════════════════════════════ -->
        <aside class="cup-panel">
          <div class="cup-panel__inner">

            <div class="cup-panel__header">
              <span class="cup-panel__eyebrow">Xưởng Thủ Công</span>
              <h1 class="cup-panel__title">Tùy Chỉnh Đồ Uống</h1>
            </div>

            <!-- Cốc SVG -->
            <div class="cup-stage">
              <div v-if="cupLayers.steam.enabled" class="steam" :key="'st-' + animTick">
                <span class="waft"></span>
                <span class="waft"></span>
                <span class="waft"></span>
              </div>

              <div class="cup-wrap" :key="'cup-' + animTick">
                <svg class="cup-svg" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs>
                    <clipPath id="cupClip">
                      <path d="M 20 28 L 180 28 L 160 240 Q 158 270 100 272 Q 42 270 40 240 Z" />
                    </clipPath>
                    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#fff" stop-opacity="0.08" />
                      <stop offset="12%" stop-color="#fff" stop-opacity="0.32" />
                      <stop offset="40%" stop-color="#fff" stop-opacity="0.04" />
                      <stop offset="75%" stop-color="#fff" stop-opacity="0.06" />
                      <stop offset="100%" stop-color="#fff" stop-opacity="0.22" />
                    </linearGradient>
                    <linearGradient id="surfaceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   :stop-color="cupLayers.bean.color || '#3d2010'" stop-opacity="0.22" />
                      <stop offset="40%"  :stop-color="cupLayers.bean.color || '#3d2010'" stop-opacity="0.06" />
                      <stop offset="70%"  stop-color="#fff" stop-opacity="0.10" />
                      <stop offset="100%" :stop-color="cupLayers.bean.color || '#3d2010'" stop-opacity="0.14" />
                    </linearGradient>
                    <radialGradient id="foamGrad" cx="50%" cy="30%" r="60%">
                      <stop offset="0%"   :stop-color="cupLayers.milk.show ? '#fffcf5' : '#e8e0d8'" />
                      <stop offset="60%"  :stop-color="cupLayers.milk.show ? '#f3ead8' : '#d4ccc4'" />
                      <stop offset="100%" :stop-color="cupLayers.milk.show ? '#e8d9c0' : '#c4bdb6'" />
                    </radialGradient>
                    <linearGradient id="depthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#000" stop-opacity="0.13" />
                      <stop offset="18%" stop-color="#000" stop-opacity="0" />
                      <stop offset="82%" stop-color="#000" stop-opacity="0" />
                      <stop offset="100%" stop-color="#000" stop-opacity="0.10" />
                    </linearGradient>
                    <filter id="dropShadow">
                      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#3c2a21" flood-opacity="0.22" />
                    </filter>
                    <filter id="foamBlur">
                      <feGaussianBlur stdDeviation="1.2" />
                    </filter>
                  </defs>

                  <ellipse cx="100" cy="286" rx="72" ry="10" fill="#3c2a21" opacity="0.16" filter="url(#dropShadow)" />

                  <g clip-path="url(#cupClip)">
                    <rect x="0" y="0" width="200" height="300"
                      :fill="cupLayers.bean.show ? 'rgba(30,12,4,0.08)' : 'rgba(220,210,200,0.10)'" />

                    <g class="layers-split" :style="{ opacity: cupLayers.mixed.enabled ? 0 : 1 }">
                      <rect v-if="cupLayers.bean.show" class="liq-layer" x="0" :y="272 - cupLayers.bean.height * 2.44"
                        width="200" :height="cupLayers.bean.height * 2.44"
                        :style="{ fill: cupLayers.bean.color, '--delay': '0ms' }" />
                      <rect v-if="cupLayers.milk.show" class="liq-layer" x="0"
                        :y="272 - (cupLayers.bean.height + cupLayers.milk.height) * 2.44" width="200"
                        :height="cupLayers.milk.height * 2.44"
                        :style="{ fill: cupLayers.milk.color, '--delay': '80ms' }" />
                    </g>

                    <g class="layers-mixed" :style="{ opacity: cupLayers.mixed.enabled ? 1 : 0 }">
                      <rect v-if="cupLayers.bean.show || cupLayers.base.show" class="liq-layer" x="0"
                        :y="272 - cupLayers.mixed.height * 2.44" width="200" :height="cupLayers.mixed.height * 2.44"
                        :style="{ fill: cupLayers.mixed.color, '--delay': '0ms' }" />
                    </g>

                    <rect x="0" y="28" width="200" height="244" fill="url(#depthGrad)" opacity="0.75" />

                    <g v-if="cupLayers.foam.show" class="foam-group">
                      <ellipse :cx="100"
                        :cy="272 - (cupLayers.bean.height + (cupLayers.milk.show ? cupLayers.milk.height : 0)) * 2.44"
                        rx="72" :ry="cupLayers.foam.height * 1.5" fill="url(#foamGrad)" opacity="0.96" />
                      <g opacity="0.55" filter="url(#foamBlur)">
                        <circle v-for="i in 8" :key="'fb' + i" :cx="45 + i * 14"
                          :cy="272 - (cupLayers.bean.height + (cupLayers.milk.show ? cupLayers.milk.height : 0)) * 2.44 - 2"
                          :r="1.4 + (i % 3) * 0.8" fill="#fff" />
                      </g>
                      <g v-if="cupLayers.toppingsFx" class="topping-fx" :key="'fx-' + cupLayers.toppingsFx.fxKey">
                        <g v-if="cupLayers.toppingsFx.dustEnabled" class="fx-dust">
                          <circle v-for="i in 18" :key="'d' + i" :cx="40 + (i * 9) % 120"
                            :cy="(272 - (cupLayers.bean.height + cupLayers.milk.height + cupLayers.foam.height) * 2.44) - 18 - (i % 6) * 4"
                            :r="0.9 + (i % 3) * 0.6" :fill="cupLayers.toppingsFx.dustColor"
                            :style="{ '--delay-anim': (i * 0.03) + 's' }" />
                        </g>
                      </g>
                    </g>

                    <g v-if="cupLayers.drizzle.enabled" class="drizzle">
                      <path d="M62 108 C70 123 57 133 67 150 S57 166 67 183" />
                      <path d="M88 98  C96 113 83 123 93 140 S83 156 93 173" />
                      <path d="M114 106 C122 121 109 131 119 148 S109 164 119 181" />
                      <path d="M140 98  C148 113 135 123 145 140 S135 156 145 173" />
                    </g>

                    <g v-if="cupLayers.bubbles.enabled" class="bubbles">
                      <circle v-for="i in 14" :key="'b' + i" :cx="42 + (i * 11) % 118" :cy="200 + (i * 17) % 60"
                        :r="1.5 + (i % 4) * 0.7" :style="{ '--dur': (2.2 + (i % 4) * 0.6) + 's', '--delay-anim': (i * 0.22) + 's' }" />
                    </g>

                    <g v-if="cupLayers.bubbles.enabled" class="ice">
                      <rect x="50" y="158" width="28" height="22" rx="4" :style="{ '--dur': '3.2s', '--delay-anim': '0s' }" />
                      <rect x="88" y="170" width="24" height="18" rx="4" :style="{ '--dur': '2.8s', '--delay-anim': '0.5s' }" opacity="0.85" />
                      <rect x="120" y="155" width="26" height="20" rx="4" :style="{ '--dur': '3.5s', '--delay-anim': '1s' }" opacity="0.75" />
                    </g>

                    <g v-if="cupLayers.bubbles.enabled" class="condensation">
                      <ellipse cx="35" cy="140" rx="3" ry="5" :style="{ '--dur': '4s', '--delay-anim': '0.3s' }" />
                      <ellipse cx="165" cy="162" rx="2.5" ry="4" :style="{ '--dur': '3.5s', '--delay-anim': '1.1s' }" />
                      <ellipse cx="44" cy="202" rx="2" ry="3.5" :style="{ '--dur': '5s', '--delay-anim': '0.7s' }" />
                    </g>

                    <ellipse
                      v-if="cupLayers.bean.show && !cupLayers.mixed.enabled"
                      :cx="100"
                      :cy="272 - (cupLayers.bean.height + (cupLayers.milk.show ? cupLayers.milk.height : 0)) * 2.44"
                      rx="66" ry="2.5" fill="url(#surfaceGrad)" opacity="0.45" />
                  </g>

                  <path d="M 20 28 L 180 28 L 160 240 Q 158 270 100 272 Q 42 270 40 240 Z" fill="url(#glassGrad)"
                    stroke="rgba(255,255,255,0.45)" stroke-width="2.5" />
                  <path d="M 24 28 L 44 240 Q 43 258 60 266" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="5"
                    stroke-linecap="round" class="glass-shimmer" />
                  <path d="M 176 28 L 156 240 Q 157 258 142 266" fill="none" stroke="rgba(255,255,255,0.28)"
                    stroke-width="3" stroke-linecap="round" />
                  <rect x="18" y="22" width="164" height="12" rx="6" fill="rgba(255,255,255,0.18)"
                    stroke="rgba(255,255,255,0.5)" stroke-width="1.5" />
                  <rect x="22" y="24" width="156" height="4" rx="2" fill="rgba(255,255,255,0.55)" />
                  <ellipse cx="100" cy="270" rx="60" ry="6" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)"
                    stroke-width="1.5" />

                  <g v-if="cupLayers.logo && cupLayers.logo.enabled" class="cup-logo">
                    <image :href="dripLabLogo" :xlink:href="dripLabLogo" x="56" y="118" width="88" height="56"
                      preserveAspectRatio="xMidYMid meet" opacity="0.92" />
                  </g>

                  <g v-if="cupLayers.straw.enabled" class="straw">
                    <path d="M 150 220 L 150 38 Q 152 14 174 4" fill="none" stroke="#4caf50"
                      stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M 147 220 L 147 38 Q 149 14 171 4" fill="none" stroke="rgba(255,255,255,0.28)"
                      stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                  </g>
                </svg>
              </div>

              <div class="cup-status">
                <template v-if="!cupLayers.bean.show">
                  <span class="cup-status__empty">Cốc đang trống</span>
                </template>
                <template v-else-if="isComplete">
                  <span class="cup-status__done">✓ Hoàn thành!</span>
                </template>
                <template v-else>
                  <span class="cup-status__filling">Đang pha chế...</span>
                </template>
              </div>
            </div>

            <!-- Giá tiền -->
            <div class="cup-price">
              <span class="cup-price__label">Tổng tiền</span>
              <span class="cup-price__value">{{ formatVnd(price) }}</span>
            </div>

            <!-- Tóm tắt lựa chọn -->
            <div class="cup-summary">
              <div v-if="selectedBean" class="cup-summary__row">
                <span class="cup-summary__dot" style="background:#3d2010"></span>
                {{ selectedBean.label }}
              </div>
              <div v-if="selectedBase" class="cup-summary__row">
                <span class="cup-summary__dot" style="background:#2b1b14"></span>
                {{ selectedBase.label }}
              </div>
              <div v-if="selectedMilk && selection.milk !== 'none'" class="cup-summary__row">
                <span class="cup-summary__dot" style="background:#c8a87a"></span>
                {{ selectedMilk.label }}
              </div>
              <div v-if="selection.toppings.size > 0" class="cup-summary__row">
                <span class="cup-summary__dot" style="background:#c6a562"></span>
                {{ selection.toppings.size }} topping
              </div>
              <div v-if="selectedSize" class="cup-summary__row">
                <span class="cup-summary__dot" style="background:#4caf50"></span>
                Size {{ selectedSize.label }}
              </div>
              <div v-if="currentStep >= 5" class="cup-summary__row">
                <span class="cup-summary__dot" style="background:#29b6f6"></span>
                Đá {{ selection.ice }}
              </div>
              <div v-if="currentStep >= 5" class="cup-summary__row">
                <span class="cup-summary__dot" style="background:#f06292"></span>
                Đường {{ selection.sugar }}
              </div>
              <div v-if="currentStep >= 5" class="cup-summary__row">
                <span class="cup-summary__dot" style="background:#ff9800"></span>
                Số lượng: {{ selection.quantity }} ly
              </div>
            </div>

            <div v-if="notice" class="cup-notice">{{ notice }}</div>

            <div v-if="isComplete" class="cup-actions">
              <button class="btn-cart" @click="addToCart">Thêm vào giỏ hàng</button>
              <button class="btn-reset" @click="reset">Làm lại</button>
            </div>
          </div>
        </aside>

        <!-- ══════════════════════════════════════════
             PHẢI: Bảng lựa chọn theo bước
        ══════════════════════════════════════════ -->
        <section class="step-panel">

          <!-- Stepper tabs (3×2) -->
          <div class="stepper-grid">
            <button v-for="(step, idx) in STEPS" :key="step.key" class="stepper-cell" :class="{
              'stepper-cell--active': currentStep === idx,
              'stepper-cell--done':   stepDone[step.key] && currentStep !== idx,
              'stepper-cell--locked': idx > currentStep,
            }" @click="goToStep(idx)">
              <span class="stepper-cell__num">{{ String(idx + 1).padStart(2, '0') }}</span>
              <span class="stepper-cell__label">{{ step.label }}</span>
              <span v-if="step.key === 'topping'" class="stepper-cell__count">({{ toppingCountLabel }})</span>
              <span v-if="step.key === 'bean'    && selectedBean"  class="stepper-cell__value">{{ selectedBean.label }}</span>
              <span v-if="step.key === 'base'    && selectedBase"  class="stepper-cell__value">{{ selectedBase.label }}</span>
              <span v-if="step.key === 'milk'    && selectedMilk"  class="stepper-cell__value">{{ selectedMilk.label }}</span>
              <span v-if="step.key === 'topping' && selection.toppings.size > 0" class="stepper-cell__value">{{ selection.toppings.size }} đã chọn</span>
              <span v-if="step.key === 'size'    && selectedSize"  class="stepper-cell__value">Size {{ selectedSize.label }}</span>
              <span v-if="step.key === 'confirm' && currentStep >= 5" class="stepper-cell__value">Đá {{ selection.ice }} · Đường {{ selection.sugar }} · {{ selection.quantity }} ly</span>
            </button>
          </div>

          <!-- Panel nội dung theo bước -->
          <div class="options-panel">

            <!-- ── BƯỚC 0: Chọn hạt cà phê ── -->
            <div v-if="currentStep === 0" class="options-section">
              <div class="options-section__head">
                <span class="options-step-num">01</span>
                <h2 class="options-section__title">Chọn hạt cà phê</h2>
              </div>
              <div class="options-grid options-grid--2">
                <button v-for="b in beanOptions" :key="b.id" class="option-card"
                  :class="{ 'option-card--selected': selection.bean === b.id }" @click="selectBean(b.id)">
                  <span class="option-card__swatch" :style="{ background: b.color }"></span>
                  <span class="option-card__name">{{ b.label }}</span>
                  <span class="option-card__sub">{{ b.sub }}</span>
                  <span class="option-card__price">+{{ formatVnd(b.priceDelta) }}</span>
                </button>
              </div>
            </div>

            <!-- ── BƯỚC 1: Chọn base ── -->
            <div v-if="currentStep === 1" class="options-section">
              <div class="options-section__head">
                <span class="options-step-num">02</span>
                <h2 class="options-section__title">Chọn Base</h2>
              </div>
              <div class="options-grid options-grid--3">
                <button v-for="b in baseOptions" :key="b.id" class="option-card"
                  :class="{ 'option-card--selected': selection.base === b.id }" @click="selectBase(b.id)">
                  <span class="option-card__swatch" :style="{ background: b.color }"></span>
                  <span class="option-card__name">{{ b.label }}</span>
                  <span class="option-card__sub">{{ b.sub }}</span>
                  <span class="option-card__price">+{{ formatVnd(b.priceDelta) }}</span>
                </button>
              </div>
              <div class="options-nav">
                <button class="btn-nav btn-nav--back" @click="prevStep">← Quay lại</button>
              </div>
            </div>

            <!-- ── BƯỚC 2: Chọn sữa ── -->
            <div v-if="currentStep === 2" class="options-section">
              <div class="options-section__head">
                <span class="options-step-num">03</span>
                <h2 class="options-section__title">Chọn Sữa</h2>
              </div>
              <div class="options-grid options-grid--2">
                <button v-for="m in milkOptions" :key="m.id" class="option-card"
                  :class="{ 'option-card--selected': selection.milk === m.id }" @click="selectMilk(m.id)">
                  <span class="option-card__swatch"
                    :style="{ background: m.color || 'rgba(0,0,0,0.06)', border: m.color ? 'none' : '2px dashed #ccc' }"></span>
                  <span class="option-card__name">{{ m.label }}</span>
                  <span class="option-card__sub">{{ m.sub }}</span>
                  <span class="option-card__price">{{ m.priceDelta ? '+' + formatVnd(m.priceDelta) : 'Miễn phí' }}</span>
                </button>
              </div>
              <div class="options-nav">
                <button class="btn-nav btn-nav--back" @click="prevStep">← Quay lại</button>
              </div>
            </div>

            <!-- ── BƯỚC 3: Chọn Topping ── -->
            <div v-if="currentStep === 3" class="options-section">
              <div class="options-section__head">
                <span class="options-step-num">04</span>
                <h2 class="options-section__title">
                  Chọn Topping
                  <small class="options-section__limit">(tối đa 3 loại)</small>
                </h2>
              </div>
              <div class="options-grid options-grid--2">
                <button v-for="t in toppingOptions" :key="t.id" class="option-card option-card--check"
                  :class="{ 'option-card--selected': selection.toppings.has(t.id) }" @click="toggleTopping(t.id)">
                  <span class="option-card__checkbox">
                    <svg v-if="selection.toppings.has(t.id)" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </span>
                  <span class="option-card__swatch" :style="{ background: t.color }"></span>
                  <span class="option-card__name">{{ t.label }}</span>
                  <span class="option-card__sub">{{ t.sub }}</span>
                  <span class="option-card__price">+{{ formatVnd(t.priceDelta) }}</span>
                </button>
              </div>
              <div class="options-nav">
                <button class="btn-nav btn-nav--back" @click="prevStep">← Quay lại</button>
                <button class="btn-nav btn-nav--finish" @click="confirmTopping">
                  Tiếp theo →
                </button>
              </div>
            </div>

            <!-- ── BƯỚC 4: Chọn Size ── -->
            <div v-if="currentStep === 4" class="options-section">
              <div class="options-section__head">
                <span class="options-step-num">05</span>
                <h2 class="options-section__title">Chọn Size</h2>
              </div>
              <div class="options-grid options-grid--3">
                <button v-for="s in sizeOptions" :key="s.id" class="option-card option-card--size"
                  :class="{ 'option-card--selected': selection.size === s.id }" @click="selectSize(s.id)">
                  <span class="option-card__size-badge">{{ s.label }}</span>
                  <span class="option-card__name">{{ s.sub }}</span>
                  <span class="option-card__price">{{ s.priceDelta ? '+' + formatVnd(s.priceDelta) : 'Gốc' }}</span>
                </button>
              </div>
              <div class="options-nav">
                <button class="btn-nav btn-nav--back" @click="prevStep">← Quay lại</button>
              </div>
            </div>

            <!-- ── BƯỚC 5: Mức đá, đường, số lượng ── -->
            <div v-if="currentStep === 5" class="options-section">
              <div class="options-section__head">
                <span class="options-step-num">06</span>
                <h2 class="options-section__title">Xác nhận</h2>
              </div>

              <!-- Mức đá -->
              <div class="level-group">
                <div class="level-group__header">
                  <span class="level-group__label">Mức đá</span>
                  <span class="level-group__limit">Tối đa 01</span>
                </div>
                <div class="level-pills">
                  <button v-for="opt in iceOptions" :key="opt" class="level-pill"
                    :class="{ 'level-pill--active': selection.ice === opt }"
                    @click="selection.ice = opt">{{ opt }}</button>
                </div>
              </div>

              <!-- Mức đường -->
              <div class="level-group">
                <div class="level-group__header">
                  <span class="level-group__label">Mức đường</span>
                  <span class="level-group__limit">Tối đa 01</span>
                </div>
                <div class="level-pills">
                  <button v-for="opt in sugarOptions" :key="opt" class="level-pill"
                    :class="{ 'level-pill--active': selection.sugar === opt }"
                    @click="selection.sugar = opt">{{ opt }}</button>
                </div>
              </div>

              <!-- Số lượng -->
              <div class="level-group">
                <div class="level-group__header">
                  <span class="level-group__label">Số lượng</span>
                </div>
                <div class="qty-row">
                  <button class="qty-btn" @click="decQty">−</button>
                  <span class="qty-value">{{ selection.quantity }}</span>
                  <button class="qty-btn" @click="incQty">+</button>
                </div>
              </div>

              <div class="options-nav">
                <button class="btn-nav btn-nav--back" @click="prevStep">← Quay lại</button>
                <button class="btn-nav btn-nav--finish" @click="addToCart">
                  Thêm vào giỏ →
                </button>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>

    <!-- POPUP THÔNG BÁO -->
    <transition name="cart-pop">
      <div v-if="cartPopupOpen" ref="popupBackdropEl" class="cart-pop__backdrop" role="dialog" aria-modal="true"
        @click.self="closeCartPopup" @keydown="onPopupKeydown" tabindex="-1">
        <div class="cart-pop__card">
          <img :src="driplabLogo2" class="cart-pop__logo" alt="Drip Lab" />
          <h3 class="cart-pop__title">Thêm vào giỏ hàng thành công!</h3>
          <p class="cart-pop__desc">
            Cảm ơn bạn đã tin tưởng Drip Lab! Chúng tôi sẽ xác nhận và giao hàng sớm nhất có thể.
          </p>
          <button class="cart-pop__btn" @click="closeCartPopup">Hoàn tất</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style src="../CSS-USER/Brewing.css"></style>