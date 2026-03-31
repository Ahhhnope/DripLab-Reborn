<script setup>
import { useMenuView } from '../JS-USER/MenuView.js'

const {
  sortOptions,
  activeSort,
  setSort,
  sortedProducts,
  formatVnd,
  addProduct,
} = useMenuView()
</script>

<template>
  <div class="pb-10 overflow-x-hidden">
    
    <section class="relative left-1/2 w-screen -translate-x-1/2 bg-linear-to-br from-[#2B1B14] via-[#3A241B] to-[#1E130F] py-12 md:py-16 shadow-lg">
      <div class="mx-auto max-w-6xl px-6 text-center">
        <h1 class="text-3xl font-extrabold tracking-tight text-[#FFF7ED] md:text-5xl">MENU</h1>
        <p class="mt-3 text-base text-[#F5E6D3]/90 md:text-lg">Mix chất riêng – Chill đúng gu</p>
        <div class="mx-auto mt-5 h-1 w-20 rounded-full bg-[#C08A5A]"></div>
      </div>
    </section>

    <div class="mt-10 mx-auto max-w-6xl px-4 md:px-8">
      
      <div class="flex flex-wrap items-center justify-center gap-6 text-slate-600">
        <div class="text-base md:text-lg font-medium">Sắp xếp:</div>
        <button v-for="s in sortOptions" :key="s.id" class="text-base md:text-lg transition-colors"
          :class="s.id === activeSort ? 'text-slate-900 font-bold underline underline-offset-8' : 'hover:text-slate-900'"
          @click="setSort(s.id)">
          {{ s.label }}
        </button>
      </div>

      <div class="mt-6 border-t border-slate-200"></div>

      <div class="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <article v-for="p in sortedProducts" :key="p.id" class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md">
          
          <div class="relative aspect-4/3 bg-white overflow-hidden cursor-pointer" @click="addProduct(p)">
            
            <button type="button" class="group relative block h-full w-full bg-white">
              <img :src="p.imageUrl" alt="" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-90" loading="lazy" />
              <div class="absolute inset-0 bg-black/0 transition group-hover:bg-black/5"></div>
            </button>

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

          </div>

          <div class="relative p-5">
            <div class="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">{{ p.brand }}</div>
            <div class="mt-2 text-xl font-bold text-slate-800 line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer" @click="addProduct(p)">
              {{ p.name }}
            </div>
            <div class="mt-3 text-2xl font-black text-[#E53935]">{{ formatVnd(p.price) }}</div>

            <button class="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600 hover:scale-105 active:scale-95"
              @click="addProduct(p)">
              <span class="text-3xl leading-none font-light -translate-y-0.5">+</span>
            </button>
          </div>

        </article>
      </div>
      
    </div>
  </div>
</template>