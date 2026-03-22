<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4"
      @click.self="close"
    >
      <div class="w-full max-w-5xl rounded-xl border border-slate-200 bg-white shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div class="flex items-baseline gap-3">
            <div class="text-lg font-black text-blue-600">
              {{ order?.code || "-" }}
            </div>

            <span class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {{ statusText(order?.status) }}
            </span>
          </div>

          <button class="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100" @click="close">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-4">
          <div v-if="!order" class="py-8 text-center text-slate-600">
            Không có dữ liệu đơn hàng
          </div>

          <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <!-- Left -->
            <div class="lg:col-span-8 rounded-xl border border-slate-200 p-4">
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <div class="sm:col-span-4 text-sm text-slate-500">Khách hàng</div>
                <div class="sm:col-span-8 text-sm font-semibold">
                  {{ order.customer?.name || "-" }}
                </div>

                <div class="sm:col-span-4 text-sm text-slate-500">Hình thức giao hàng</div>
                <div class="sm:col-span-8 text-sm font-semibold">
                  {{ order.shippingType || "-" }}
                </div>

                <div class="sm:col-span-4 text-sm text-slate-500">Thời gian đặt</div>
                <div class="sm:col-span-8 text-sm font-semibold">
                  {{ order.createdAt || "-" }}
                </div>
              </div>

              <div class="my-4 h-px bg-slate-200"></div>

              <!-- Items -->
              <div class="space-y-3">
                <div
                  v-for="it in (order.itemsDetail || [])"
                  :key="it.id"
                  class="grid grid-cols-12 gap-3 border-b border-dashed border-slate-200 pb-3 last:border-b-0 last:pb-0"
                >
                  <div class="col-span-12 sm:col-span-7">
                    <div class="font-bold text-slate-800">{{ it.name }}</div>

                    <div v-if="it.options?.length" class="mt-1 space-y-0.5 text-sm text-slate-500">
                      <div v-for="(op, idx) in it.options" :key="idx">• {{ op }}</div>
                    </div>
                  </div>

                  <div class="col-span-6 sm:col-span-2 text-center font-bold">
                    x{{ it.qty }}
                  </div>

                  <div class="col-span-6 sm:col-span-3 text-right font-extrabold">
                    {{ money(it.total) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Right -->
            <div class="lg:col-span-4 rounded-xl border border-slate-200 p-4">
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <div class="text-slate-600">Tổng tiền</div>
                  <div class="font-extrabold">{{ money(order.subtotal ?? order.pay) }}</div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="text-slate-600">Khuyến mãi</div>
                  <div class="font-extrabold">- {{ money(order.discount ?? 0) }}</div>
                </div>

                <div class="flex items-center justify-between pt-2 text-base">
                  <div class="font-bold text-slate-800">Khách hàng phải trả</div>
                  <div class="font-black text-blue-600">{{ money(order.pay) }}</div>
                </div>
              </div>

              <div class="my-4 h-px bg-slate-200"></div>

              <div class="flex justify-end gap-2">
                <button
                  class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="order.status !== 'pending'"
                  @click="emit('confirm', order)"
                >
                  Xác nhận
                </button>

                <button
                  class="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!['pending','processing'].includes(order.status)"
                  @click="emit('cancel', order)"
                >
                  Huỷ
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup>
import { useOrderTable } from "../Front-End/JS/OrderTable";

const props = defineProps({
  open: { type: Boolean, default: false },
  order: { type: Object, default: null },
});
const emit = defineEmits(["update:open", "confirm", "cancel"]);

const { money, statusText } = useOrderTable(() => {});

function close() {
  emit("update:open", false);
}
</script>
