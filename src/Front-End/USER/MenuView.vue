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
  // Pagination
  currentPage,
  totalPages,
  visiblePages,
  goToPage,
  // Search
  searchQuery,
  searchResults,
  previewResults,
  hasMoreResults,
  extraResultCount,
  isSearchOpen,
  isExpandedSearch,
  closeSearch,
  clearSearch,
  expandSearch,
  collapseSearch,
  formatVnd,
  addProduct,
  openFromImage,
  showClosedModal,  // ✅ thêm vào đây
  loading,
} = useMenuView()

function activeCategoryLabel() {
  return categories.find((c) => c.id === activeCategoryId.value)?.label || 'Danh mục'
}

async function scrollToTopOfGrid() {
  await nextTick()
  const top = gridTopEl.value?.offsetTop || 0
  window.scrollTo({ top: top - 20, behavior: 'smooth' })
}

async function onPickCategory(id) {
  setCategory(id)
  isCatOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onChangeSort(id) {
  setSort(id)
}

async function onChangePage(n) {
  goToPage(n)
  await scrollToTopOfGrid()
}

function onDocClick(e) {
  const catEl = e.target.closest?.('[data-cat-dropdown]')
  if (!catEl) isCatOpen.value = false

  const searchEl = e.target.closest?.('[data-search-box]')
  if (!searchEl) {
    closeSearch()
    collapseSearch()
  }
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

      <!-- ── Wrapper căn chỉnh 2 hàng ── -->
      <div class="mt-4 flex flex-col gap-5" style="width: fit-content; min-width: min(100%, 600px)">

        <!-- Hàng 1: Danh mục + Search -->
        <div class="flex items-center gap-4 w-full">

          <!-- Danh mục dropdown -->
          <div class="relative shrink-0" data-cat-dropdown>
            <button class="inline-flex items-center justify-between gap-3 min-w-44
                     rounded-xl border border-slate-200 bg-white px-3 py-2
                     text-sm font-semibold text-slate-900 shadow-sm
                     hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
              @click.stop="isCatOpen = !isCatOpen">
              <span>{{ activeCategoryLabel() }}</span>
              <span class="text-slate-400 transition-transform duration-200"
                :class="isCatOpen ? 'rotate-180' : ''">⌄</span>
            </button>

            <div v-if="isCatOpen"
              class="dropdown-panel absolute left-0 z-50 mt-2 w-full overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5">
              <button v-for="c in categories" :key="c.id"
                class="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                @click="onPickCategory(c.id)">
                <span :class="c.id === activeCategoryId ? 'font-semibold text-slate-900' : 'text-slate-700'">
                  {{ c.label }}
                </span>
                <span v-if="c.id === activeCategoryId" class="text-emerald-600 font-bold">✓</span>
              </button>
            </div>
          </div>

          <!-- ── Search Box ── -->
          <div class="relative flex-1 min-w-0" data-search-box>
            <div class="relative flex items-center">
              <span class="absolute left-3 text-slate-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </span>

              <input v-model="searchQuery" type="text" placeholder="Xin chào, bạn cần gì hôm nay?" class="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800
                       placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300
                       transition search-input" @focus="searchQuery.length && (isSearchOpen = true)" />

              <button v-if="searchQuery" class="absolute right-2.5 text-slate-400 hover:text-slate-600 transition"
                @click.stop="clearSearch(); collapseSearch()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Search Dropdown Panel -->
            <div v-if="isSearchOpen && searchResults.length"
              class="search-dropdown absolute left-0 right-0 z-50 mt-2 rounded-2xl bg-white shadow-2xl ring-1 ring-black/6 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Kết quả cho
                  <span class="text-red-600 font-bold">"{{ searchQuery }}"</span>
                </span>
                <span class="text-xs text-slate-400">{{ searchResults.length }} sản phẩm</span>
              </div>

              <div class="px-4 pt-2 pb-1">
                <span class="text-xs text-slate-400 font-medium">Hiển thị kết quả theo:</span>
                <span class="ml-2 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">Sản
                  phẩm</span>
              </div>

              <!-- Preview items (luôn hiện) -->
              <ul>
                <li v-for="p in previewResults" :key="p.id"
                  class="search-result-item flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                  @click="openFromImage(p); clearSearch()">
                  <div class="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                    <img :src="p.imageUrl || '/placeholder.png'" :alt="p.name" class="h-full w-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-slate-800 truncate">{{ p.name }}</p>
                  </div>
                  <div class="text-sm font-black text-red-600 shrink-0">
                    {{ formatVnd(p.price) }}
                  </div>
                </li>
              </ul>

              <!-- Extra items (chỉ hiện khi đã expand) -->
              <ul v-if="isExpandedSearch">
                <li v-for="p in searchResults.slice(previewResults.length)" :key="p.id"
                  class="search-result-item flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                  @click="openFromImage(p); clearSearch()">
                  <div class="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                    <img :src="p.imageUrl || '/placeholder.png'" :alt="p.name" class="h-full w-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-slate-800 truncate">{{ p.name }}</p>
                  </div>
                  <div class="text-sm font-black text-red-600 shrink-0">
                    {{ formatVnd(p.price) }}
                  </div>
                </li>
              </ul>

              <!-- Nút Xem thêm / Thu gọn -->
              <div v-if="hasMoreResults" class="px-4 py-2.5 border-t border-slate-100 text-center text-xs cursor-pointer
                       hover:bg-slate-50 transition-colors select-none"
                @click.stop="isExpandedSearch ? collapseSearch() : expandSearch()">
                <template v-if="!isExpandedSearch">
                  <span class="text-slate-500">Xem thêm</span>
                  <span class="font-bold text-red-600 mx-1">{{ extraResultCount }}</span>
                  <span class="text-slate-500">sản phẩm</span>
                  <span class="ml-1 text-red-600 font-bold">↓</span>
                </template>
                <template v-else>
                  <span class="text-slate-500">Thu gọn</span>
                  <span class="ml-1 text-slate-400 font-bold">↑</span>
                </template>
              </div>
            </div>

            <!-- No results -->
            <div v-else-if="isSearchOpen && searchQuery && !searchResults.length"
              class="search-dropdown absolute left-0 right-0 z-50 mt-2 rounded-2xl bg-white shadow-2xl ring-1 ring-black/6 px-4 py-6 text-center">
              <p class="text-sm text-slate-400">Không tìm thấy sản phẩm nào 😢</p>
            </div>
          </div>
        </div>

        <!-- Hàng 2: Sắp xếp -->
        <div class="flex flex-wrap items-center gap-4 text-slate-600">
          <div class="text-base md:text-lg font-medium">Sắp xếp:</div>
          <button v-for="s in sortOptions" :key="s.id" class="text-base md:text-lg transition-colors"
            :class="s.id === activeSort ? 'text-slate-900 font-bold underline underline-offset-8' : 'hover:text-slate-900'"
            @click="onChangeSort(s.id)">
            {{ s.label }}
          </button>
        </div>

      </div>

      <!-- Scroll anchor -->
      <div ref="gridTopEl" class="mt-6 border-t border-slate-200"></div>

      <!-- Product Grid -->
      <div class="grid grid-cols-1 gap-8 pt-8 md:grid-cols-2 lg:grid-cols-3">
        <div v-if="loading" class="col-span-full text-center py-20 text-slate-400 font-medium">
          Đang pha cà phê... ☕
        </div>

        <article v-else v-for="p in sortedProducts" :key="p.id"
          class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md">
          <button type="button" class="group relative block w-full overflow-hidden bg-white" @click="openFromImage(p)">
            <div class="aspect-4/3 bg-white">
              <img :src="p.imageUrl || '/placeholder.png'" alt=""
                class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                loading="lazy" />
            </div>

            <div v-if="p.isBestSeller" class="pointer-events-none absolute top-3 left-3 z-10
                     flex items-center gap-1 rounded-full
                     bg-amber-400 px-2.5 py-1
                     text-[11px] font-extrabold tracking-wide text-amber-900 shadow-md">
              ★ BEST SELLER
            </div>

            <div v-if="p.isNew" class="pointer-events-none absolute top-3 right-3 z-10
                     flex items-center gap-1 rounded-full
                     px-2.5 py-1
                     text-[11px] font-extrabold tracking-wide bg-emerald-500 shadow-md">
              ★ MÓN MỚI
            </div>
          </button>

          <div class="relative p-5">
            <div class="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
              {{ p.brand }}
            </div>
            <div
              class="mt-2 text-xl font-bold text-slate-800 line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer"
              @click="addProduct(p)">
              {{ p.name }}
            </div>
            <div class="mt-3 text-2xl font-black text-[#E53935]">
              {{ formatVnd(p.price) }}
            </div>
            <button
              class="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-red-700 text-white shadow-lg shadow-black/20 transition hover:bg-red-800 hover:scale-105 active:scale-95"
              @click="addProduct(p)">
              <span class="text-3xl leading-none font-light -translate-y-0.5">+</span>
            </button>
          </div>
        </article>
      </div>

      <!-- ── Pagination ── -->
      <div v-if="totalPages > 1" class="mt-12 flex items-center justify-center gap-1.5">
        <button class="pagination-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white
                 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          :disabled="currentPage === 1" @click="onChangePage(currentPage - 1)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Trước
        </button>

        <template v-for="(pg, i) in visiblePages" :key="i">
          <span v-if="pg === null" class="px-1.5 text-slate-400 select-none">…</span>
          <button v-else class="pagination-btn h-9 w-9 rounded-xl text-sm font-semibold border transition" :class="pg === currentPage
            ? 'bg-red-700 border-red-700 text-white shadow-md shadow-red-700/20'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'" @click="onChangePage(pg)">
            {{ pg }}
          </button>
        </template>

        <button class="pagination-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white
                 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          :disabled="currentPage === totalPages" @click="onChangePage(currentPage + 1)">
          Sau
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <!-- ✅ END pagination div -->

    </div>
  </div>

  <!-- ✅ Closed Store Modal — đặt ngoài tất cả, không bị ẩn bởi v-if nào -->
  <Teleport to="body">
    <Transition name="cs-modal">
      <div v-if="showClosedModal" class="modal-overlay" @click.self="showClosedModal = false">
        <div class="modal-box" role="dialog" aria-modal="true">
          <div class="modal-icon-wrap">
            <div class="modal-icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#E24B4A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3l18 18M10.5 10.677A2 2 0 0 0 9 12.5V19h6v-6.5a2 2 0 0 0-.677-1.508" />
                <path d="M6.33 6H4l1 6h1M20 6h-4.67M16 12h1l1-6h-2.33" />
                <path d="M9 19v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1" />
              </svg>
            </div>
            <span class="modal-badge">ĐÓNG CỬA</span>
          </div>
          <h2 class="modal-title">Quán đang đóng cửa</h2>
          <p class="modal-desc">
            Rất tiếc! Quán chưa mở cửa vào lúc này.<br>
            Bạn có thể đặt hàng trong giờ phục vụ nhé.
          </p>
          <div class="modal-hours">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Giờ mở cửa: <strong>08:00 – 22:00</strong>
          </div>
          <button class="modal-btn" @click="showClosedModal = false">Đã hiểu</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-dropdown {
  transform-origin: top left;
  animation: dropdownIn 160ms ease-out;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-panel {
  transform-origin: top left;
  animation: dropdownIn 160ms ease-out;
}

.search-result-item {
  transition: background 120ms ease;
}

.pagination-btn {
  transition: transform 80ms ease, background 120ms ease;
}

.pagination-btn:not(:disabled):active {
  transform: scale(0.93);
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.25);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-box {
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

.modal-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.modal-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #FCEBEB;
  display: grid;
  place-items: center;
  border: 1px solid rgba(226, 75, 74, 0.2);
}

.modal-badge {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  background: #E24B4A;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 2px solid #fff;
  white-space: nowrap;
}

.modal-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: #111;
}

.modal-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.55;
}

.modal-hours {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 13px;
  color: #555;
  margin-bottom: 20px;
}

.modal-hours strong {
  color: #111;
  font-weight: 700;
}

.modal-btn {
  width: 100%;
  padding: 12px;
  background: #E24B4A;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 150ms;
}

.modal-btn:hover { background: #c93a39; }
</style>