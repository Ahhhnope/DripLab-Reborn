<template>
  <div class="order-table-wrapper rounded-xl border border-slate-200 bg-white">
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead class="bg-slate-50">
          <tr class="text-left text-xs uppercase tracking-wide text-slate-500">
            <th class="border-b border-slate-200 px-3 py-2 font-semibold">Mã đơn</th>
            <th class="border-b border-slate-200 px-3 py-2 font-semibold">Người đặt</th>
            <th class="border-b border-slate-200 px-3 py-2 font-semibold">Thanh toán</th>
            <th class="border-b border-slate-200 px-3 py-2 font-semibold">Trạng thái</th>
            <th class="border-b border-slate-200 px-3 py-2 text-center font-semibold">Số món</th>
            <th class="border-b border-slate-200 px-3 py-2 text-right font-semibold">Phải trả</th>
            <th class="border-b border-slate-200 px-3 py-2 font-semibold">Ngày đặt</th>
            <th class="border-b border-slate-200 px-3 py-2 text-center font-semibold">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="r in items" :key="r.code" class="text-sm hover:bg-slate-50 transition-colors">
            <td class="border-b border-slate-100 px-3 py-2">
              <span class="font-extrabold text-blue-600">{{ r.code }}</span>
            </td>

            <td class="border-b border-slate-100 px-3 py-2 text-slate-600">
              {{ r.user?.fullName || "-" }}
            </td>

            <td class="border-b border-slate-100 px-3 py-2 text-slate-600">
              {{ r.shippingType || "-" }}
            </td>

            <td class="border-b border-slate-100 px-3 py-2">
              <span
                class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(r.status)"
              >
                {{ statusText(r.status) }}
              </span>
            </td>

            <td class="border-b border-slate-100 px-3 py-2 text-center text-slate-700">
              {{ r.qty ?? "-" }}
            </td>

            <td class="border-b border-slate-100 px-3 py-2 text-right font-bold text-slate-800">
              {{ money(r.pay) }}
            </td>

            <td class="border-b border-slate-100 px-3 py-2 text-slate-600 whitespace-nowrap">
              {{ r.deadline || "-" }}
            </td>

            <td class="border-b border-slate-100 px-3 py-2">
              <div class="flex justify-center">
                <!-- Xem chi tiết (màu xanh biển) -->
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  @click="emit('view', r)"
                >
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Xem chi tiết
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!items?.length">
            <td colspan="8" class="px-3 py-10 text-center text-sm text-slate-400">Không có đơn hàng nào</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useOrderTable } from "../Front-End/JS/OrderTable.js";

defineProps({
  items: { type: Array, default: () => [] },
});

// Bỏ nút xác nhận/huỷ ở bảng (đã có trong modal chi tiết)
const emit = defineEmits(["view"]);

const { money, statusText, statusClass } = useOrderTable(emit);
</script>