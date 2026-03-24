<template>
  <div class="rounded-xl border border-slate-200 bg-white p-3">
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="text-left text-sm text-slate-600">
            <th class="border-b border-slate-200 px-3 py-3 font-semibold">Mã đơn hàng</th>
            <th class="border-b border-slate-200 px-3 py-3 font-semibold">Hình thức giao hàng</th>
            <th class="border-b border-slate-200 px-3 py-3 font-semibold">Trạng thái</th>
            <th class="border-b border-slate-200 px-3 py-3 text-center font-semibold">Số lượng</th>
            <th class="border-b border-slate-200 px-3 py-3 text-right font-semibold">
              Khách hàng phải trả
            </th>
            <th class="border-b border-slate-200 px-3 py-3 font-semibold">Hạn xác nhận</th>
            <th class="border-b border-slate-200 px-3 py-3 font-semibold">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="r in items"
            :key="r.code"
            class="text-sm hover:bg-slate-50"
          >
            <td class="border-b border-slate-200 px-3 py-3">
              <span class="font-extrabold text-blue-600">{{ r.code }}</span>
            </td>

            <td class="border-b border-slate-200 px-3 py-3">
              {{ r.shippingType || "-" }}
            </td>

            <td class="border-b border-slate-200 px-3 py-3">
              <span
                class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
                :class="statusClass(r.status)"
              >
                {{ statusText(r.status) }}
              </span>
            </td>

            <td class="border-b border-slate-200 px-3 py-3 text-center">
              {{ r.qty ?? "-" }}
            </td>

            <td class="border-b border-slate-200 px-3 py-3 text-right font-bold">
              {{ money(r.pay) }}
            </td>

            <td class="border-b border-slate-200 px-3 py-3">
              {{ r.deadline || "-" }}
            </td>

            <td class="border-b border-slate-200 px-3 py-3">
              <div class="flex flex-wrap gap-2">
                <a
                  href="#"
                  class="font-semibold text-blue-600 hover:underline"
                  @click.prevent="view(r)"
                >
                  Xem
                </a>

                <span class="text-slate-300">|</span>

                <a
                  href="#"
                  class="font-semibold text-emerald-600 hover:underline"
                  @click.prevent="confirm(r)"
                >
                  Xác nhận
                </a>

                <span class="text-slate-300">|</span>

                <a
                  href="#"
                  class="font-semibold text-red-600 hover:underline"
                  @click.prevent="cancel(r)"
                >
                  Huỷ
                </a>
              </div>
            </td>
          </tr>

          <tr v-if="!items?.length">
            <td colspan="7" class="px-3 py-8 text-center text-sm text-slate-500">
              Không có đơn hàng
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useOrderTable } from "../Front-End/JS/OrderTable";

defineProps({
  items: { type: Array, default: () => [] },
});

const emit = defineEmits(["view", "confirm", "cancel"]);

const { money, statusText, statusClass, view, confirm, cancel } = useOrderTable(emit);
</script>
