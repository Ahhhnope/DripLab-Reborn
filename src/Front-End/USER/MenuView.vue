<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { useMenuView } from '../JS-USER/MenuView.js'

const gridTopEl = ref(null)
const isCatOpen = ref(false)

const {
  categories,
  activeCategoryId,
  pageTitle,
  setCategory,

  sortOptions,
  activeSort,
  setSort,

  sortedProducts,
  formatVnd,
  addProduct,
  openFromImage,
} = useMenuView()

function activeCategoryLabel() {
  return categories.find((c) => c.id === activeCategoryId.value)?.label || 'Danh mục'
}

// ✅ scroll chuẩn lên đầu khu vực menu
async function scrollToTopOfGrid() {
  await nextTick()
  const top = gridTopEl.value?.offsetTop || 0

  window.scrollTo({
    top: top - 20,
    behavior: 'smooth',
  })
}

async function onPickCategory(id) {
  setCategory(id)
  isCatOpen.value = false
  await scrollToTopOfGrid()
}

async function onChangeSort(id) {
  setSort(id)
  await scrollToTopOfGrid()
}

// click outside để đóng dropdown
function onDocClick(e) {
  const el = e.target.closest?.('[data-cat-dropdown]')
  if (!el) isCatOpen.value = false
}

document.addEventListener('click', onDocClick)
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div class="pb-10 overflow-x-hidden">
    <div class="mt-6 mx-auto max-w-6xl px-4 md:px-8">
      <!-- Breadcrumb -->
      <div class="text-sm text-slate-400">
        Trang chủ / <span class="text-slate-700">{{ pageTitle }}</span>
      </div>

      <!-- Title -->
      <h2 class="mt-4 text-4xl md:text-5xl font-light tracking-tight text-slate-900">
        {{ pageTitle }}
      </h2>

      <!-- Row: Danh mục + Sắp xếp -->
      <div class="mt-6 flex flex-wrap items-center gap-6 text-slate-600">
        <!-- Danh mục -->
        <div class="flex items-center gap-3" data-cat-dropdown>
          <div class="text-base md:text-lg font-medium">Danh mục:</div>

          <div class="relative">
            <button
              class="inline-flex items-center justify-between gap-3 min-w-47.5
                     rounded-xl border border-slate-200 bg-white px-3 py-2
                     text-sm font-semibold text-slate-900 shadow-sm
                     hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
              @click.stop="isCatOpen = !isCatOpen"
            >
              <span>{{ activeCategoryLabel() }}</span>
              <span class="text-slate-400" :class="isCatOpen ? 'rotate-180' : ''">⌄</span>
            </button>

            <div
              v-if="isCatOpen"
              class="absolute left-0 z-50 mt-2 w-full overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5"
            >
              <button
                v-for="c in categories"
                :key="c.id"
                class="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                @click="onPickCategory(c.id)"
              >
                <span :class="c.id === activeCategoryId ? 'font-semibold text-slate-900' : 'text-slate-700'">
                  {{ c.label }}
                </span>
                <span v-if="c.id === activeCategoryId" class="text-emerald-600 font-bold">✓</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sắp xếp -->
        <div class="flex flex-wrap items-center gap-4">
          <div class="text-base md:text-lg font-medium">Sắp xếp:</div>
          <button
            v-for="s in sortOptions"
            :key="s.id"
            class="text-base md:text-lg transition-colors"
            :class="s.id === activeSort ? 'text-slate-900 font-bold underline underline-offset-8' : 'hover:text-slate-900'"
            @click="onChangeSort(s.id)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- ✅ mốc scroll mới -->
      <div ref="gridTopEl" class="mt-6 border-t border-slate-200"></div>

      <!-- Grid sản phẩm -->
      <div class="grid grid-cols-1 gap-8 pt-8 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="p in sortedProducts"
          :key="p.id"
          class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md"
        >
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
            >
              <span class="text-3xl leading-none font-light -translate-y-0.5">+</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>