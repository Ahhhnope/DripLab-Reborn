<script setup>
import { ref, nextTick, watch } from 'vue'
import { useMenuView } from '../JS-USER/MenuView.js'

const gridTopEl = ref(null)

const {
  categories,
  activeSubId,
  activeTitle,

  isCatOpen,
  toggleCatMenu,
  closeCatMenu,

  selectSub,

  filteredProducts,
  formatVnd,
  addProduct,
  openFromImage,
} = useMenuView()

// khóa scroll nền khi dropdown mở
watch(
  () => isCatOpen.value,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : ''
  },
)

async function onSelectSub(id) {
  selectSub(id)
  await nextTick()
  gridTopEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Icon inline SVG
function iconSvg(key) {
  switch (key) {
    case 'coffee':
      return `
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 10h2a2 2 0 0 1 0 4h-2"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 4c1 1 .5 2 0 3M11 4c1 1 .5 2 0 3"/>
        </svg>`
    case 'tea':
      return `
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 9h10v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11h2a2 2 0 0 1 0 4h-2"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 6h4"/>
        </svg>`
    case 'coldbrew':
      return `
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 4h10l-1 16H8L7 4z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 9h6"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 2h4"/>
        </svg>`
    case 'all':
    default:
      return `
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>`
  }
}
</script>

<template>
  <div class="relative pb-10 overflow-x-hidden">
    <!-- ✅ Toàn bộ trang sẽ bị mờ/xám khi dropdown mở -->
    <div
      :class="
        isCatOpen
          ? 'blur-sm brightness-90 transition duration-300' 
      : 'transition duration-300'
      "
    >
      <!-- HERO -->
      <section
        class="relative left-1/2 w-screen -translate-x-1/2 bg-linear-to-br from-[#2B1B14] via-[#3A241B] to-[#1E130F] py-12 md:py-16 shadow-lg"
      >
        <div class="mx-auto max-w-6xl px-6 text-center">
          <h1 class="text-3xl font-extrabold tracking-tight text-[#FFF7ED] md:text-5xl">
            MENU
          </h1>
          <p class="mt-3 text-base text-[#F5E6D3]/90 md:text-lg">
            Mix chất riêng – Chill đúng gu
          </p>
          <div class="mx-auto mt-5 h-1 w-20 rounded-full bg-[#C08A5A]"></div>
        </div>

        <!-- Nút danh mục (bên trái, ngang slogan) -->
        <div class="absolute left-6 top-1/2 -translate-y-1/2 md:left-10">
          <button
            class="inline-flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3 text-sm font-bold text-[#B91C1C] shadow-lg ring-1 ring-black/5 hover:bg-white"
            @click="toggleCatMenu"
          >
            <span class="text-lg leading-none">≡</span>
            Danh mục sản phẩm
          </button>
        </div>
      </section>

      <!-- CONTENT -->
      <div class="mt-8 mx-auto max-w-6xl px-4 md:px-8">
        <div class="text-sm text-slate-400">
          Trang chủ / <span class="text-slate-700">{{ activeTitle }}</span>
        </div>

        <h2 class="mt-3 text-4xl md:text-5xl font-light tracking-tight text-slate-900">
          {{ activeTitle }}
        </h2>

        <div class="mt-4 text-sm font-semibold text-slate-700">
          {{ filteredProducts.length }} sản phẩm
        </div>

        <div ref="gridTopEl"></div>

        <div class="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="p in filteredProducts"
            :key="p.id"
            class="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm hover:shadow-md transition"
          >
            <!-- IMAGE: hover thu nhỏ -->
            <button
              type="button"
              class="group relative block w-full overflow-hidden bg-white"
              @click="openFromImage(p)"
            >
              <div class="aspect-4/3 bg-white">
                <img
                  :src="p.imageUrl"
                  alt=""
                  class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-90"
                  loading="lazy"
                />
              </div>

              <div
                v-if="p.isHot"
                class="pointer-events-none absolute top-5 -right-10 z-10 w-40 rotate-45 bg-red-600 py-1.5 text-center text-xs font-extrabold tracking-wider text-white shadow-md"
              >
                BÁN CHẠY!
              </div>
              <div
                v-else-if="p.isNew"
                class="pointer-events-none absolute top-5 -right-10 z-10 w-40 rotate-45 bg-red-600 py-1.5 text-center text-xs font-extrabold tracking-wider text-white shadow-md"
              >
                GIÁ MỚI
              </div>
            </button>

            <!-- INFO -->
            <div class="relative p-5">
              <div class="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
                {{ p.brand }}
              </div>

              <div
                class="mt-2 text-xl font-bold text-slate-800 line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer"
                @click="addProduct(p)"
              >
                {{ p.name }}
              </div>

              <div class="mt-3 text-2xl font-black text-[#E53935]">
                {{ formatVnd(p.price) }}
              </div>

              <button
                class="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-red-700 text-white shadow-lg shadow-black/20 transition hover:bg-red-800 hover:scale-105 active:scale-95"
                @click="addProduct(p)"
                aria-label="Thêm"
                title="Thêm"
              >
                <span class="text-3xl leading-none font-light -translate-y-0.5">+</span>
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- ✅ Overlay click-outside + Dropdown panel (KHÔNG bị mờ) -->
    <div v-if="isCatOpen">
      <div class="fixed inset-0 z-40" @click="closeCatMenu"></div>

      <!-- dropdown panel -->
      <div class="absolute left-6 top-55 z-50 md:left-10">
        <div class="dropdown-panel w-80 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <div class="flex items-center justify-between border-b px-4 py-3">
            <div class="text-sm font-semibold text-slate-700">Chọn danh mục</div>
            <button
              class="grid h-8 w-8 place-items-center rounded-full bg-slate-100 hover:bg-slate-200"
              @click="closeCatMenu"
              aria-label="Đóng"
              title="Đóng"
            >
              ✕
            </button>
          </div>

          <div class="max-h-95 overflow-auto p-2">
            <div v-for="c in categories" :key="c.id" class="py-2">
              <div class="flex items-center gap-2 px-3 pb-1 text-sm font-bold text-slate-800">
                <span class="text-slate-700" v-html="iconSvg(c.iconKey)"></span>
                <span>{{ c.label }}</span>
              </div>

              <button
                v-for="sub in c.children"
                :key="sub.id"
                class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50"
                @click="onSelectSub(sub.id)"
              >
                <span :class="activeSubId === sub.id ? 'font-semibold text-slate-900' : 'text-slate-700'">
                  {{ sub.label }}
                </span>
                <span v-if="activeSubId === sub.id" class="text-emerald-600 font-bold">✓</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style src="../CSS-USER/MenuView.css"></style>
