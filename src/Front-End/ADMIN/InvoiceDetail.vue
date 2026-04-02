<template>
  <teleport to="body">
    <transition name="fade">
      <div
        class="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden">

          <!-- Header -->
          <div class="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-3">
            <div class="flex items-baseline gap-3">
              <div class="text-lg font-black text-[#3C2A21]">
                {{ invoice.invoice_id }}
              </div>
              <span :class="['rounded-full px-3 py-1 text-xs font-semibold', statusClass]">
                {{ invoice.status || 'Đã hủy' }}
              </span>
            </div>
            <button
              class="rounded-lg p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors"
              @click="$emit('close')"
            >✕</button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto custom-scrollbar">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">

              <!-- LEFT -->
              <div class="lg:col-span-8 space-y-6">

                <!-- Thông tin chung -->
                <div class="rounded-xl border border-stone-100 bg-stone-50/50 p-5">
                  <div class="grid grid-cols-12 gap-2">
                    <div class="col-span-4 text-sm text-stone-400">Mã đơn hàng</div>
                    <div class="col-span-8 text-sm font-bold text-[#3C2A21]">{{ invoice.order_id }}</div>

                    <div class="col-span-4 text-sm text-stone-400">Thời gian đặt</div>
                    <div class="col-span-8 text-sm font-medium">{{ invoice.created_at }}</div>

                    <div class="col-span-4 text-sm text-stone-400">Thanh toán</div>
                    <div class="col-span-8 text-sm font-medium">{{ invoice.payment_method }}</div>

                    <div class="col-span-4 text-sm text-stone-400">Hình thức nhận</div>
                    <div class="col-span-8 text-sm font-medium">
                      <span :class="['rounded-full px-2 py-0.5 text-xs font-semibold', invoice.receive_type === 'Online' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700']">
                        {{ invoice.receive_type }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Chi tiết món -->
                <div class="space-y-4">
                  <h4 class="font-bold text-stone-800 border-b pb-2">Chi tiết món</h4>
                  <div
                    v-for="(item, i) in invoice.items" :key="i"
                    class="grid grid-cols-12 gap-4 items-start border-b border-dashed border-stone-100 pb-4 last:border-0"
                  >
                    <div class="col-span-8">
                      <div class="font-bold text-stone-800">{{ item.qty }}x {{ item.name }}</div>
                      <!-- ✅ Sugar & Ice tags -->
                      <div v-if="item.sugar != null || item.ice != null" class="mt-2 flex flex-wrap gap-1">
                        <span v-if="item.sugar != null"
                          class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style="background: rgba(251,191,36,0.12); color: #d97706; border: 1px solid rgba(251,191,36,0.25)">
                          🍬 Đường: {{ item.sugar }}%
                        </span>
                        <span v-if="item.ice != null"
                          class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style="background: rgba(59,130,246,0.08); color: #2563eb; border: 1px solid rgba(59,130,246,0.15)">
                          🧊 Đá: {{ item.ice }}%
                        </span>
                      </div>
                    </div>
                    <div class="col-span-1 text-center font-bold text-stone-400">x{{ item.qty }}</div>
                    <div class="col-span-3 text-right font-bold text-[#3C2A21]">—</div>
                  </div>
                </div>

              </div>

              <!-- RIGHT -->
              <div class="lg:col-span-4 space-y-4">
                <div class="rounded-xl bg-[#FAF7F2] p-5 space-y-3">
                  <div class="flex justify-between text-sm">
                    <span class="text-stone-500">Tổng gốc</span>
                    <span class="font-bold">{{ invoice.original_price.toLocaleString('vi-VN') }} đ</span>
                  </div>
                  <div class="flex justify-between text-sm text-red-500">
                    <span>Giảm giá</span>
                    <span class="font-bold">- {{ invoice.discount.toLocaleString('vi-VN') }} đ</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-stone-500">Phí ship</span>
                    <span class="font-bold">{{ invoice.shipping.toLocaleString('vi-VN') }} đ</span>
                  </div>
                  <div class="pt-3 border-t border-stone-200 flex justify-between">
                    <span class="font-bold">Thành tiền</span>
                    <span class="text-lg font-black text-[#634832]">
                      {{ invoice.final_price.toLocaleString('vi-VN') }} đ
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ invoice: Object })
defineEmits(['close'])

const statusClass = computed(() => {
  const s = props.invoice.status || 'Đã hủy'
  if (s === 'Đã giao')   return 'bg-green-100 text-green-700'
  if (s === 'Đang giao') return 'bg-blue-100 text-blue-700'
  if (s === 'Đã hủy')    return 'bg-red-100 text-red-600'
  return 'bg-orange-100 text-orange-700'
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
</style>