<script setup>
import { useAdminMenu } from "../JS/FrameInterface.JS";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  DocumentTextIcon,
  TicketIcon,
  NewspaperIcon,
  UserCircleIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

const { menuGroups, activeIndex, openMenu, openSub, logout, clickMenu, clickSub, clickSubChild } = useAdminMenu();
</script>

<template>
  <div class="flex w-screen h-screen overflow-hidden bg-[#FAF7F2] font-sans text-stone-700">

    <aside class="w-64 h-full flex flex-col shrink-0 bg-white border-r border-stone-200 shadow-sm">

      <div class="flex items-center px-6 py-6 bg-white border-b border-stone-100">
        <div class="p-1.5 bg-[#3C2A21] rounded-lg shadow-md">
          <img src="../IMG/DripLab_Logo.png" class="w-8 h-8 object-contain brightness-0 invert" alt="logo" />
        </div>
        <span class="ml-3 font-bold text-[#3C2A21] text-lg tracking-tight">Drip Lab</span>
      </div>

      <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-7 custom-scrollbar">
        <div v-for="group in menuGroups" :key="group.title" class="space-y-2">
          <h3 class="px-3 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em]">
            {{ group.title }}
          </h3>

          <ul class="space-y-0.5">
            <li v-for="item in group.items" :key="item.id">
              <button @click="clickMenu(item)" :class="[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200',
                activeIndex === item.id
                  ? 'bg-[#F5EBE0] text-[#634832]'
                  : 'text-stone-500 hover:bg-[#FAF7F2] hover:text-[#634832]'
              ]">
                <component :is="item.icon"
                  :class="['w-5 h-5 opacity-80', activeIndex === item.id ? 'text-[#634832]' : 'text-stone-400']" />
                <span class="flex-1 text-left">{{ item.label }}</span>
                <component v-if="item.children" :is="openMenu === item.id ? ChevronUpIcon : ChevronDownIcon"
                  class="w-3.5 h-3.5 opacity-50" />
              </button>

              <transition name="expand">
                <ul v-if="item.children && openMenu === item.id"
                  class="mt-1 ml-4 border-l border-stone-200 space-y-0.5">
                  <li v-for="child in item.children" :key="child.id">
                    <button @click="clickSub(child)" :class="[
                      'w-full flex items-center justify-between px-6 py-2 text-[13px] transition-all',
                      activeIndex === child.id ? 'text-[#634832] font-semibold' : 'text-stone-500 hover:text-stone-800'
                    ]">
                      <span>{{ child.label }}</span>
                      <component v-if="child.subChildren" :is="openSub === child.id ? ChevronUpIcon : ChevronDownIcon"
                        class="w-3 h-3" />
                    </button>

                    <transition name="expand">
                      <ul v-if="child.subChildren && openSub === child.id" class="ml-6 space-y-1 my-1">
                        <li v-for="sub in child.subChildren" :key="sub.id">
                          <button @click="clickSubChild(sub)" :class="[
                            'w-full text-left py-1.5 text-[12px] transition-all',
                            activeIndex === sub.id ? 'text-[#8B5E3C] font-medium' : 'text-stone-400 hover:text-stone-600'
                          ]">
                            • {{ sub.label }}
                          </button>
                        </li>
                      </ul>
                    </transition>
                  </li>
                </ul>
              </transition>
            </li>
          </ul>
        </div>
      </nav>

      <div class="p-4 border-t border-stone-100 bg-[#FAF7F2]/50 flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-full bg-[#3C2A21] flex items-center justify-center text-[#F5EBE0] text-xs font-bold shadow-sm">
          A
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-bold text-[#3C2A21] truncate">Quản Trị Viên</p>
          <p class="text-[10px] text-stone-500 truncate font-medium">Nguyễn Huy Bình</p>
        </div>
        <button @click="logout" class="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
          <ArrowLeftOnRectangleIcon class="w-5 h-5" />
        </button>
      </div>
    </aside>

    <main class="flex-1 h-full overflow-y-auto p-8">
      <div class="bg-white rounded-2xl shadow-sm border border-stone-200/60 min-h-full p-6">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease-in-out;
  max-height: 500px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 10px;
}
</style>