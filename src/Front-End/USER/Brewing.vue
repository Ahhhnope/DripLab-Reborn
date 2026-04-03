<!-- Brewing.vue (đã thêm popup thông báo khi “Thêm vào giỏ hàng”) -->
<script setup>
import { ref, onBeforeUnmount, watch, nextTick } from 'vue'
import { useBrewing } from '../JS-USER/Brewing.js'
 
const {
  beanOptions, baseOptions, milkOptions, toppingOptions,
  STEPS, selection, currentStep, isComplete, stepDone,
  toppingCountLabel,
  selectBean, selectBase, selectMilk, toggleTopping,
  goToStep, nextStep, prevStep, reset,
  cupLayers, animTick,
  selectedBean, selectedBase, selectedMilk,
  price, formatVnd,
  notice,
} = useBrewing()

// ─────────────────────────────────────────────────────────────
// Popup thông báo “đã thêm vào giỏ” (giống mẫu ảnh)
// ─────────────────────────────────────────────────────────────
const cartPopupOpen = ref(false)
const orderCode = ref('')
const popupBackdropEl = ref(null)

function makeOrderCode() {
  // ORD- + epoch ms (đủ giống mẫu, bạn có thể thay bằng mã backend)
  return `ORD-${Date.now()}`
}

function openCartPopup() {
  orderCode.value = makeOrderCode()
  cartPopupOpen.value = true
  document.documentElement.classList.add('no-scroll')
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
  // TODO: chỗ này bạn gắn logic “thêm vào giỏ” thật (store/pinia/localStorage/api)
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
 
            <!-- Tiêu đề -->
            <div class="cup-panel__header">
              <span class="cup-panel__eyebrow">Xưởng Thủ Công</span>
              <h1 class="cup-panel__title">Tùy Chỉnh Đồ Uống</h1>
            </div>
 
            <!-- Cốc SVG -->
            <div class="cup-stage">
 
              <!-- Hơi nước -->
              <div v-if="cupLayers.steam.enabled" class="steam" :key="'st-' + animTick">
                <span class="waft"></span>
                <span class="waft"></span>
                <span class="waft"></span>
              </div>
 
              <!-- Wrapper cốc -->
              <div class="cup-wrap" :key="'cup-' + animTick">
                <svg class="cup-svg" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs>
                    <!-- Hình clip ly thang bo đáy -->
                    <clipPath id="cupClip">
                      <path d="M 20 28 L 180 28 L 160 240 Q 158 270 100 272 Q 42 270 40 240 Z"/>
                    </clipPath>
                    <!-- Kính trong -->
                    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stop-color="#fff" stop-opacity="0.08"/>
                      <stop offset="12%"  stop-color="#fff" stop-opacity="0.32"/>
                      <stop offset="40%"  stop-color="#fff" stop-opacity="0.04"/>
                      <stop offset="75%"  stop-color="#fff" stop-opacity="0.06"/>
                      <stop offset="100%" stop-color="#fff" stop-opacity="0.22"/>
                    </linearGradient>
                    <!-- Bề mặt lỏng -->
                    <linearGradient id="surfaceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stop-color="#fff" stop-opacity="0.35"/>
                      <stop offset="50%"  stop-color="#fff" stop-opacity="0.08"/>
                      <stop offset="100%" stop-color="#fff" stop-opacity="0.20"/>
                    </linearGradient>
                    <!-- Bọt foam -->
                    <radialGradient id="foamGrad" cx="50%" cy="30%" r="60%">
                      <stop offset="0%"   stop-color="#fffcf5"/>
                      <stop offset="60%"  stop-color="#f3ead8"/>
                      <stop offset="100%" stop-color="#e8d9c0"/>
                    </radialGradient>
                    <!-- Chiều sâu 2 cạnh -->
                    <linearGradient id="depthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stop-color="#000" stop-opacity="0.13"/>
                      <stop offset="18%"  stop-color="#000" stop-opacity="0"/>
                      <stop offset="82%"  stop-color="#000" stop-opacity="0"/>
                      <stop offset="100%" stop-color="#000" stop-opacity="0.10"/>
                    </linearGradient>
                    <!-- Bóng dưới ly -->
                    <filter id="dropShadow">
                      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#3c2a21" flood-opacity="0.22"/>
                    </filter>
                    <!-- Blur bọt -->
                    <filter id="foamBlur"><feGaussianBlur stdDeviation="1.2"/></filter>
                  </defs>
 
                  <!-- Bóng mặt bàn -->
                  <ellipse cx="100" cy="286" rx="72" ry="10" fill="#3c2a21" opacity="0.16" filter="url(#dropShadow)"/>
 
                  <!-- ── LỚP LỎNG (clipped) ── -->
                  <g clip-path="url(#cupClip)">
 
                    <!-- Nền ly (trong suốt trước khi chọn) -->
                    <rect x="0" y="0" width="200" height="300"
                      :fill="cupLayers.bean.show ? 'rgba(30,12,4,0.08)' : 'rgba(220,210,200,0.10)'"
                    />
 
                    <!-- LAYER 1: Bean (đáy) -->
                    <rect
                      v-if="cupLayers.bean.show"
                      class="liq-layer"
                      x="0" y="28" width="200" height="244"
                      :style="{
                        fill: cupLayers.bean.color,
                        transformOrigin: 'center 272px',
                        transform: `scaleY(${cupLayers.bean.height / 100})`,
                        '--delay': '0ms',
                      }"
                    />
 
                    <!-- LAYER 2: Base (trên bean) -->
                    <rect
                      v-if="cupLayers.base.show"
                      class="liq-layer"
                      x="0" y="28" width="200" height="244"
                      :style="{
                        fill: cupLayers.base.color,
                        transformOrigin: `center ${272 - cupLayers.bean.height * 2.44}px`,
                        transform: `scaleY(${cupLayers.base.height / 100})`,
                        '--delay': '60ms',
                      }"
                    />
 
                    <!-- LAYER 3: Milk (trên base) -->
                    <rect
                      v-if="cupLayers.milk.show"
                      class="liq-layer"
                      x="0" y="28" width="200" height="244"
                      :style="{
                        fill: cupLayers.milk.color,
                        transformOrigin: `center ${272 - (cupLayers.bean.height + cupLayers.base.height) * 2.44}px`,
                        transform: `scaleY(${cupLayers.milk.height / 100})`,
                        '--delay': '80ms',
                      }"
                    />
 
                    <!-- Overlay chiều sâu 2 cạnh -->
                    <rect x="0" y="28" width="200" height="244" fill="url(#depthGrad)" opacity="0.75"/>
 
                    <!-- LAYER 4: Foam -->
                    <g v-if="cupLayers.foam.show" class="foam-group">
                      <ellipse
                        :cx="100"
                        :cy="272 - (cupLayers.bean.height + cupLayers.base.height + cupLayers.milk.height) * 2.44"
                        rx="72"
                        :ry="cupLayers.foam.height * 1.5"
                        fill="url(#foamGrad)"
                        opacity="0.96"
                      />
                      <!-- Bong bóng bọt nhỏ -->
                      <g opacity="0.55" filter="url(#foamBlur)">
                        <circle v-for="i in 8" :key="'fb'+i"
                          :cx="45 + i * 14"
                          :cy="272 - (cupLayers.bean.height + cupLayers.base.height + cupLayers.milk.height) * 2.44 - 2"
                          :r="1.4 + (i % 3) * 0.8"
                          fill="#fff"
                        />
                      </g>
                    </g>
 
                    <!-- Drizzle caramel -->
                    <g v-if="cupLayers.drizzle.enabled" class="drizzle">
                      <path d="M62 108 C70 123 57 133 67 150 S57 166 67 183"/>
                      <path d="M88 98  C96 113 83 123 93 140 S83 156 93 173"/>
                      <path d="M114 106 C122 121 109 131 119 148 S109 164 119 181"/>
                      <path d="M140 98  C148 113 135 123 145 140 S135 156 145 173"/>
                    </g>
 
                    <!-- Bong bóng cold brew -->
                    <g v-if="cupLayers.bubbles.enabled" class="bubbles">
                      <circle v-for="i in 14" :key="'b'+i"
                        :cx="42 + (i * 11) % 118"
                        :cy="200 + (i * 17) % 60"
                        :r="1.5 + (i % 4) * 0.7"
                        :style="{
                          '--dur': (2.2 + (i % 4) * 0.6) + 's',
                          '--delay-anim': (i * 0.22) + 's',
                        }"
                      />
                    </g>
 
                    <!-- Đá viên cold brew -->
                    <g v-if="cupLayers.bubbles.enabled" class="ice">
                      <rect x="50"  y="158" width="28" height="22" rx="4"
                        :style="{ '--dur': '3.2s', '--delay-anim': '0s' }"/>
                      <rect x="88"  y="170" width="24" height="18" rx="4"
                        :style="{ '--dur': '2.8s', '--delay-anim': '0.5s' }" opacity="0.85"/>
                      <rect x="120" y="155" width="26" height="20" rx="4"
                        :style="{ '--dur': '3.5s', '--delay-anim': '1s' }" opacity="0.75"/>
                    </g>
 
                    <!-- Đọng nước (cold brew) -->
                    <g v-if="cupLayers.bubbles.enabled" class="condensation">
                      <ellipse cx="35"  cy="140" rx="3"   ry="5"   :style="{ '--dur': '4s',   '--delay-anim': '0.3s' }"/>
                      <ellipse cx="165" cy="162" rx="2.5" ry="4"   :style="{ '--dur': '3.5s', '--delay-anim': '1.1s' }"/>
                      <ellipse cx="44"  cy="202" rx="2"   ry="3.5" :style="{ '--dur': '5s',   '--delay-anim': '0.7s' }"/>
                    </g>
 
                    <!-- Bề mặt lỏng (shimmer) -->
                    <ellipse
                      v-if="cupLayers.bean.show || cupLayers.base.show"
                      :cx="100"
                      :cy="272 - (cupLayers.bean.height + cupLayers.base.height + cupLayers.milk.height + cupLayers.foam.height) * 2.44"
                      rx="68" ry="4"
                      fill="url(#surfaceGrad)"
                      opacity="0.75"
                    />
                  </g>
                  <!-- ── END CLIP ── -->
 
                  <!-- THÂN KÍNH -->
                  <path
                    d="M 20 28 L 180 28 L 160 240 Q 158 270 100 272 Q 42 270 40 240 Z"
                    fill="url(#glassGrad)"
                    stroke="rgba(255,255,255,0.45)"
                    stroke-width="2.5"
                  />
                  <!-- Highlight trái -->
                  <path d="M 24 28 L 44 240 Q 43 258 60 266"
                    fill="none" stroke="rgba(255,255,255,0.6)"
                    stroke-width="5" stroke-linecap="round" class="glass-shimmer"/>
                  <!-- Highlight phải -->
                  <path d="M 176 28 L 156 240 Q 157 258 142 266"
                    fill="none" stroke="rgba(255,255,255,0.28)"
                    stroke-width="3" stroke-linecap="round"/>
                  <!-- Vành miệng -->
                  <rect x="18" y="22" width="164" height="12" rx="6"
                    fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
                  <rect x="22" y="24" width="156" height="4" rx="2" fill="rgba(255,255,255,0.55)"/>
                  <!-- Đáy -->
                  <ellipse cx="100" cy="270" rx="60" ry="6"
                    fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
 
                  <!-- ỐNG HÚT — chỉ xuất hiện khi hoàn thành -->
                  <g v-if="cupLayers.straw.enabled" class="straw">
                    <rect x="124" y="-16" width="10" height="210" rx="5"
                      fill="#4caf50" stroke="rgba(40,120,40,0.4)" stroke-width="1"/>
                    <rect x="124" y="-16" width="3.5" height="210" rx="1.5"
                      fill="rgba(255,255,255,0.28)"/>
                  </g>
                </svg>
              </div>
 
              <!-- Label trạng thái cốc -->
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
              <div v-if="selectedBean"  class="cup-summary__row">
                <span class="cup-summary__dot" style="background:#3d2010"></span>
                {{ selectedBean.label }}
              </div>
              <div v-if="selectedBase"  class="cup-summary__row">
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
            </div>
 
            <!-- Thông báo nhỏ -->
            <div v-if="notice" class="cup-notice">{{ notice }}</div>
 
            <!-- Nút hành động -->
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
 
          <!-- Thanh tìm kiếm -->
          <div class="search-bar">
            <input class="search-bar__input" type="text" placeholder="Tìm sản phẩm..." />
            <button class="search-bar__btn">Tìm kiếm</button>
          </div>
 
          <!-- Stepper tabs (4 ô 2x2) -->
          <div class="stepper-grid">
            <button
              v-for="(step, idx) in STEPS"
              :key="step.key"
              class="stepper-cell"
              :class="{
                'stepper-cell--active':   currentStep === idx,
                'stepper-cell--done':     stepDone[step.key] && currentStep !== idx,
                'stepper-cell--locked':   idx > currentStep && !stepDone[step.key],
              }"
              @click="goToStep(idx)"
            >
              <span class="stepper-cell__label">{{ step.label }}</span>
              <span v-if="step.key === 'topping'" class="stepper-cell__count">
                ({{ toppingCountLabel }})
              </span>
              <!-- Giá trị đã chọn -->
              <span v-if="step.key === 'bean'    && selectedBean"   class="stepper-cell__value">{{ selectedBean.label }}</span>
              <span v-if="step.key === 'base'    && selectedBase"   class="stepper-cell__value">{{ selectedBase.label }}</span>
              <span v-if="step.key === 'milk'    && selectedMilk"   class="stepper-cell__value">{{ selectedMilk.label }}</span>
              <span v-if="step.key === 'topping' && selection.toppings.size > 0" class="stepper-cell__value">
                {{ selection.toppings.size }} đã chọn
              </span>
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
                <button
                  v-for="b in beanOptions"
                  :key="b.id"
                  class="option-card"
                  :class="{ 'option-card--selected': selection.bean === b.id }"
                  @click="selectBean(b.id)"
                >
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
                <button
                  v-for="b in baseOptions"
                  :key="b.id"
                  class="option-card"
                  :class="{ 'option-card--selected': selection.base === b.id }"
                  @click="selectBase(b.id)"
                >
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
                <button
                  v-for="m in milkOptions"
                  :key="m.id"
                  class="option-card"
                  :class="{ 'option-card--selected': selection.milk === m.id }"
                  @click="selectMilk(m.id)"
                >
                  <span class="option-card__swatch"
                    :style="{ background: m.color || 'rgba(0,0,0,0.06)', border: m.color ? 'none' : '2px dashed #ccc' }"
                  ></span>
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
                <h2 class="options-section__title">Chọn Topping
                  <small class="options-section__limit">(tối đa 3 loại)</small>
                </h2>
              </div>
              <div class="options-grid options-grid--2">
                <button
                  v-for="t in toppingOptions"
                  :key="t.id"
                  class="option-card option-card--check"
                  :class="{ 'option-card--selected': selection.toppings.has(t.id) }"
                  @click="toggleTopping(t.id)"
                >
                  <span class="option-card__checkbox">
                    <svg v-if="selection.toppings.has(t.id)" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
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
                <button v-if="!isComplete" class="btn-nav btn-nav--finish" @click="addToCart">
                  Hoàn thành →
                </button>
              </div>
            </div>
 
          </div>
        </section>
 
      </div>
    </main>

    <!-- ══════════════════════════════════════════
         POPUP THÔNG BÁO “THÊM VÀO GIỎ”
         - click nền đen để đóng
         - nhấn ESC để đóng
    ══════════════════════════════════════════ -->
    <transition name="cart-pop">
      <div
        v-if="cartPopupOpen"
        ref="popupBackdropEl"
        class="cart-pop__backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="closeCartPopup"
        @keydown="onPopupKeydown"
        tabindex="-1"
      >
        <div class="cart-pop__card">
          <div class="cart-pop__icon" aria-hidden="true">
            <span class="cart-pop__icon-inner">🎉</span>
          </div>

          <h3 class="cart-pop__title">Đặt hàng thành công!</h3>

          <div class="cart-pop__order">
            Mã đơn: <b>{{ orderCode }}</b>
          </div>

          <p class="cart-pop__desc">
            Đã thêm vào giỏ hàng với tổng tiền <b>{{ formatVnd(price) }}</b>.
            Chúng tôi sẽ xác nhận và giao hàng sớm nhất có thể.
          </p>

          <button class="cart-pop__btn" @click="closeCartPopup">Hoàn tất</button>
        </div>
      </div>
    </transition>
  </div>
</template>
 
<style src="../CSS-USER/Brewing.css"></style>