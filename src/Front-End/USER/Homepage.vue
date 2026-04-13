<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import imgBg from '../IMG/Banner1.png'
import imgBanner from '../IMG/Banner2.png'
import imgShop from '../IMG/Banner3.png'

const autoPlayMs = 4500

const slides = [
  { img: imgBg },
  { img: imgBanner },
  { img: imgShop },
]

const sliderIndex = ref(0)
const isPlaying = ref(true)
let timer = null

const startTimer = () => {
  clearInterval(timer)
  timer = setInterval(() => {
    sliderIndex.value = (sliderIndex.value + 1) % slides.length
  }, autoPlayMs)
}

const nextSlide = () => { sliderIndex.value = (sliderIndex.value + 1) % slides.length; startTimer() }
const prevSlide = () => { sliderIndex.value = (sliderIndex.value - 1 + slides.length) % slides.length; startTimer() }
const goToSlide = (i) => { sliderIndex.value = i; startTimer() }
const pauseSlider = () => { isPlaying.value = false; clearInterval(timer) }
const resumeSlider = () => { isPlaying.value = true; startTimer() }

onMounted(() => startTimer())
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="page-wrapper">

    <!-- SLIDER -->
    <section class="w-full slider-top section-gap">
      <div class="slider-wrapper" @mouseenter="pauseSlider" @mouseleave="resumeSlider">
        <div class="slider-track" :style="{ transform: `translateX(-${sliderIndex * 100}%)` }">
          <RouterLink v-for="(slide, i) in slides" :key="i" to="/menu" class="slide"
            :style="{ backgroundImage: `url('${slide.img}')` }">
            <div v-if="slide.caption" class="slide-caption">
              <h2 class="slide-caption-title">{{ slide.caption }}</h2>
              <span class="slide-caption-cta">Khám phá ngay →</span>
            </div>
          </RouterLink>
        </div>

        <button class="slider-btn slider-btn-left" @click="prevSlide">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <button class="slider-btn slider-btn-right" @click="nextSlide">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>

        <div class="slider-dots">
          <button v-for="(_, i) in slides" :key="i" class="dot" :class="{ active: i === sliderIndex }"
            @click="goToSlide(i)" :aria-label="`Slide ${i + 1}`"></button>
        </div>

        <div class="slider-progress">
          <div class="slider-progress-bar" :style="{ animationDuration: autoPlayMs + 'ms' }"
            :key="sliderIndex + '-' + isPlaying"></div>
        </div>
      </div>
    </section>

    <main class="flex-1">

      <!-- ENJOY -->
      <section class="enjoy-section section-gap">
        <h2 class="enjoy-title">Thưởng thức tại Drip Lab</h2>
        <p class="enjoy-subtitle">
          Khám phá những thức uống mới mẻ, đặc sắc, sáng tạo chỉ có tại Drip Lab. Hãy để chúng tôi mang đến cho bạn trải
          nghiệm cà phê độc đáo và khó quên!
        </p>
      </section>

      <!-- BENTO -->
      <section class="bento-section special-gap">
        <RouterLink class="bento-card group" to="/menu">
          <img src="../IMG/cfntea.jpg" alt="Coffee & Tea" />
          <div class="bento-overlay">
            <h3 class="bento-title">Cà phê &amp; Trà</h3>
            <div class="bento-overlay-2">
              <p class="bento-sub">Thưởng thức menu đồ uống đặc sắc của Drip Lab</p>
            </div>
          </div>
        </RouterLink>

        <RouterLink class="bento-card group" to="/brewing">
          <img src="../IMG/CustomCoffee.png" alt="Custom Coffee" />
          <div class="bento-overlay">
            <h3 class="bento-title">Tự pha chế</h3>
            <div class="bento-overlay-2">
              <p class="bento-sub">Tự "cook" đồ uống của bạn!</p>
            </div>
          </div>
        </RouterLink>
      </section>

      <!-- STORE -->
      <section class="split-section section-gap">
        <img class="split-img" src="../IMG/coffeeShop.jpg" alt="Coffee Shop" />
        <div class="split-content">
          <h3 class="split-title">Khám phá quán xá <br /> xung quanh!!</h3>
          <RouterLink to="/stores">
            <button class="section-btn">Xem ngay</button>
          </RouterLink>
        </div>
      </section>

      <!-- NEWS -->
      <section class="split-section split-reverse section-gap">
        <img class="split-img" src="../IMG/Couppp.png" alt="News" />
        <div class="split-content">
          <h2 class="split-title">Khuyến mãi tại Drip Lab</h2>
          <RouterLink to="/Voucher">
            <button class="section-btn">Xem ngay</button>
          </RouterLink>
        </div>
      </section>

    </main>

  </div>
</template>

<style src="../CSS-USER/HomePage.CSS"></style>
