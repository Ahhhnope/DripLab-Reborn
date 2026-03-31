import { ref, onMounted, onUnmounted } from 'vue'

// ── Import ảnh trực tiếp (Vite xử lý đúng) ───────────────────────────────────
import imgBg     from '../IMG/anh-1.jpg'
import imgBanner from '../IMG/anh-1.jpg'
import imgShop   from '../IMG/anh-1.jpg'

export default {
  name: 'HomePageView',

  setup() {
    const autoPlayMs = 4500

    const slides = [
      { img: imgBg},
      { img: imgBanner},
      { img: imgShop},
    ]

    const sliderIndex = ref(0)
    const isPlaying   = ref(true)
    let   timer       = null

    const startTimer = () => {
      clearInterval(timer)
      timer = setInterval(() => {
        sliderIndex.value = (sliderIndex.value + 1) % slides.length
      }, autoPlayMs)
    }

    const nextSlide    = () => { sliderIndex.value = (sliderIndex.value + 1) % slides.length; startTimer() }
    const prevSlide    = () => { sliderIndex.value = (sliderIndex.value - 1 + slides.length) % slides.length; startTimer() }
    const goToSlide    = (i) => { sliderIndex.value = i; startTimer() }
    const pauseSlider  = () => { isPlaying.value = false; clearInterval(timer) }
    const resumeSlider = () => { isPlaying.value = true;  startTimer() }

    onMounted(() => startTimer())
    onUnmounted(() => clearInterval(timer))

    return {
      slides, sliderIndex, isPlaying, autoPlayMs,
      nextSlide, prevSlide, goToSlide, pauseSlider, resumeSlider,
    }
  },
}