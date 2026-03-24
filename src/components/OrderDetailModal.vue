<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="props.open"
        class="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
        @click.self="close"
      >
        <div class="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden">
          
          <div class="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-3">
            <div class="flex items-baseline gap-3">
              <div class="text-lg font-black text-[#3C2A21]">
                #{{ order?.code || "-" }}
              </div>
              <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                {{ statusText(order?.status) }}
              </span>
            </div>
            <button class="rounded-lg p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors" @click="close">
              ✕
            </button>
          </div>

          <div class="p-6 overflow-y-auto custom-scrollbar">
            <div v-if="!order" class="py-12 text-center text-stone-400">
              Đang tải dữ liệu...
            </div>

            <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div class="lg:col-span-8 space-y-6">
                <div class="rounded-xl border border-stone-100 bg-stone-50/50 p-5 space-y-4">
                   <div class="grid grid-cols-12 gap-2">
                      <div class="col-span-4 text-sm text-stone-400">Khách hàng</div>
                      <div class="col-span-8 text-sm font-bold text-[#3C2A21]">{{ order.customer?.name }}</div>
                      
                      <div class="col-span-4 text-sm text-stone-400">Hình thức</div>
                      <div class="col-span-8 text-sm font-medium">{{ order.shippingType }}</div>
                      
                      <div class="col-span-4 text-sm text-stone-400">Thời gian đặt</div>
                      <div class="col-span-8 text-sm font-medium">{{ order.createdAt }}</div>
                   </div>
                </div>

                <div class="space-y-4">
                  <h4 class="font-bold text-stone-800 border-b pb-2">Chi tiết món</h4>
                  <div
                    v-for="it in (order.itemsDetail || [])"
                    :key="it.id"
                    class="grid grid-cols-12 gap-4 items-center border-b border-dashed border-stone-100 pb-4 last:border-0"
                  >
                    <div class="col-span-7">
                      <div class="font-bold text-stone-800">{{ it.name }}</div>
                      <div v-if="it.options?.length" class="mt-1 flex flex-wrap gap-1">
                        <span v-for="(op, idx) in it.options" :key="idx" class="text-[11px] bg-stone-100 px-2 py-0.5 rounded text-stone-500">
                          {{ op }}
                        </span>
                      </div>
                    </div>
                    <div class="col-span-2 text-center font-bold text-stone-400">x{{ it.qty }}</div>
                    <div class="col-span-3 text-right font-bold text-[#3C2A21]">{{ money(it.total) }}</div>
                  </div>
                </div>
              </div>

              <div class="lg:col-span-4 space-y-4">
                <div class="rounded-xl bg-[#FAF7F2] p-5 space-y-3">
                  <div class="flex justify-between text-sm">
                    <span class="text-stone-500">Tạm tính</span>
                    <span class="font-bold">{{ money(order.subtotal) }}</span>
                  </div>
                  <div class="flex justify-between text-sm text-red-500">
                    <span>Giảm giá</span>
                    <span class="font-bold">- {{ money(order.discount) }}</span>
                  </div>
                  <div class="pt-3 border-t border-stone-200 flex justify-between">
                    <span class="font-bold">Tổng cộng</span>
                    <span class="text-lg font-black text-[#634832]">{{ money(order.pay) }}</span>
                  </div>
                </div>

                <div class="flex flex-col gap-2 pt-4">
                  <button
                    class="w-full rounded-xl bg-[#634832] py-3 text-sm font-bold text-white hover:bg-[#3C2A21] transition-all disabled:opacity-30 shadow-md shadow-stone-200"
                    :disabled="order.status !== 'pending'"
                    @click="emit('confirm', order)"
                  >
                    Xác nhận đơn hàng
                  </button>
                  <button
                    class="w-full rounded-xl border border-red-200 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-30"
                    :disabled="!['pending','processing'].includes(order.status)"
                    @click="emit('cancel', order)"
                  >
                    Hủy đơn
                  </button>
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
import { useOrderTable } from "../Front-End/JS/OrderTable";

const props = defineProps({
  open: { type: Boolean, default: false },
  order: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "confirm", "cancel"]);

// Sử dụng lại logic money và status từ table
const { money, statusText } = useOrderTable(() => {});

function close() {
  emit("update:open", false);
}
</script>

<style scoped>
/* Hiệu ứng mờ dần khi hiện modal */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
</style>