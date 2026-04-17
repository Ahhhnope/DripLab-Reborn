<template>
  <div class="order-table-wrapper rounded-xl border border-slate-200 bg-white p-3">
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="text-left text-sm text-slate-600">
            <th class="border-b border-slate-200 px-3 py-3 font-semibold">Mã đơn hàng</th>
            <th class="border-b border-slate-200 px-3 py-3 font-semibold">Người đặt</th>
            <th class="border-b border-slate-200 px-3 py-3 font-semibold">Phương thức thanh toán</th>
            <th class="border-b border-slate-200 px-3 py-3 font-semibold">Trạng thái</th>
            <th class="border-b border-slate-200 px-3 py-3 text-center font-semibold">Số lượng món</th>
            <th class="border-b border-slate-200 px-3 py-3 text-right font-semibold">Khách hàng phải trả</th>
            <th class="border-b border-slate-200 px-3 py-3 font-semibold">Ngày đặt</th>
            <th class="border-b border-slate-200 px-3 py-3 font-semibold">Thao tác</th>
          </tr>
        </thead>
 
        <tbody>
          <tr
            v-for="r in items"
            :key="r.code"
            class="text-sm hover:bg-slate-50 transition-colors"
          >
            <td class="border-b border-slate-200 px-3 py-3">
              <span class="font-extrabold text-blue-600 cursor-pointer hover:underline" @click="handleView(r)">
                {{ r.code }}
              </span>
            </td>

            <td class="border-b border-slate-200 px-3 py-3 text-slate-600">
              {{ r.user.fullName || "-" }}
            </td>
 
            <td class="border-b border-slate-200 px-3 py-3 text-slate-600">
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
 
            <td class="border-b border-slate-200 px-3 py-3 text-center text-slate-700">
              {{ r.qty ?? "-" }}
            </td>
 
            <td class="border-b border-slate-200 px-3 py-3 text-right font-bold text-slate-800">
              {{ money(r.pay) }}
            </td>
 
            <td class="border-b border-slate-200 px-3 py-3 text-slate-600">
              {{ r.deadline || "-" }}
            </td>
 
            <td class="border-b border-slate-200 px-3 py-3">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  class="font-semibold text-blue-600 hover:underline text-sm"
                  @click="handleView(r)"
                >
                  Xem
                </button>
 
                <span class="text-slate-300 select-none">|</span>
 
                <button
                  class="font-semibold text-emerald-600 hover:underline text-sm"
                  @click="openEdit(r)"
                >
                  Sửa
                </button>
 
                <span class="text-slate-300 select-none">|</span>
 
                <button
                  class="font-semibold text-red-500 hover:underline text-sm"
                  @click="openDelete(r)"
                >
                  Xoá
                </button>
              </div>
            </td>
          </tr>
 
          <tr v-if="!items?.length">
            <td colspan="7" class="px-3 py-10 text-center text-sm text-slate-400">
              Không có đơn hàng nào
            </td>
          </tr>
        </tbody>
      </table>
    </div>
 
    <!-- ── MODAL SỬA ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="editModal.open"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          @mousedown.self="closeEdit"
        >
          <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 class="text-base font-bold text-slate-800">Sửa đơn hàng</h2>
                <p class="text-xs text-slate-400 mt-0.5">Mã: <span class="font-semibold text-blue-600">{{ editModal.row?.code }}</span></p>
              </div>
              <button
                class="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                @click="closeEdit"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
 
            <!-- Body -->
            <div class="px-6 py-5 space-y-4">
              <!-- Phương thức thanh toán -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Phương thức thanh toán
                </label>
                <select
                  v-model="editForm.shippingType"
                  class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                >
                  <option value="COD">COD (Thanh toán khi nhận hàng)</option>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Ví điện tử">Ví điện tử</option>
                  <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                </select>
              </div>
 
              <!-- Trạng thái -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Trạng thái đơn hàng
                </label>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <label
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    class="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors text-sm"
                    :class="editForm.status === opt.value
                      ? opt.activeClass
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
                  >
                    <input
                      type="radio"
                      :value="opt.value"
                      v-model="editForm.status"
                      class="hidden"
                    />
                    <span
                      class="inline-block h-2 w-2 rounded-full shrink-0"
                      :class="opt.dotClass"
                    ></span>
                    {{ opt.label }}
                  </label>
                </div>
              </div>
 
              <!-- Ghi chú -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Ghi chú (tuỳ chọn)
                </label>
                <textarea
                  v-model="editForm.note"
                  rows="3"
                  placeholder="Nhập ghi chú cho đơn hàng..."
                  class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-none"
                />
              </div>
            </div>
 
            <!-- Footer -->
            <div class="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50">
              <button
                class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                @click="closeEdit"
              >
                Huỷ bỏ
              </button>
              <button
                class="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 active:bg-emerald-700 transition-colors shadow-sm"
                @click="submitEdit"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
 
    <!-- ── MODAL XOÁ ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="deleteModal.open"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          @mousedown.self="closeDelete"
        >
          <div class="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
            <!-- Icon -->
            <div class="flex flex-col items-center px-6 pt-8 pb-5 text-center">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4">
                <svg class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 class="text-lg font-bold text-slate-800">Xoá đơn hàng?</h2>
              <p class="mt-2 text-sm text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn xoá đơn hàng
                <span class="font-bold text-slate-700">{{ deleteModal.row?.code }}</span>?
                <br />Hành động này <span class="text-red-500 font-semibold">không thể hoàn tác</span>.
              </p>
            </div>
 
            <!-- Footer -->
            <div class="flex gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50">
              <button
                class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                @click="closeDelete"
              >
                Không, giữ lại
              </button>
              <button
                class="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 active:bg-red-700 transition-colors shadow-sm"
                @click="submitDelete"
              >
                Xoá đơn hàng
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
 
<script setup>
import { reactive } from "vue";
import { useOrderTable } from "../Front-End/JS/OrderTable";
 
const props = defineProps({
  items: { type: Array, default: () => [] },
});
 
const emit = defineEmits(["view", "confirm", "cancel", "edit-saved", "delete-confirmed"]);
 
const { money, statusText, statusClass } = useOrderTable(emit);
 

//Modal Sửa
// ── STATUS OPTIONS cho radio group ───────────────────────
const statusOptions = [
  { value: "pending",    label: "Chờ xác nhận",     dotClass: "bg-amber-400",   activeClass: "border-amber-300 bg-amber-50 text-amber-700 font-semibold" },
  { value: "processing", label: "Đang xử lý",        dotClass: "bg-blue-400",    activeClass: "border-blue-300 bg-blue-50 text-blue-700 font-semibold" },
  { value: "shipping",   label: "Đang vận chuyển",   dotClass: "bg-indigo-400",  activeClass: "border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold" },
  { value: "delivered",  label: "Đã giao",           dotClass: "bg-emerald-400", activeClass: "border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold" },
  { value: "cancelled",  label: "Đã huỷ",            dotClass: "bg-red-400",     activeClass: "border-red-300 bg-red-50 text-red-700 font-semibold" },
];
 
// ── XEM ──────────────────────────────────────────────────
function handleView(row) {
  emit("view", row);
}
 
// ── SỬA ──────────────────────────────────────────────────
const editModal = reactive({ open: false, row: null });
const editForm  = reactive({ shippingType: "", status: "", note: "" });
 
function openEdit(row) {
  editModal.row  = row;
  editForm.shippingType = row.shippingType ?? "";
  editForm.status       = row.status       ?? "";
  editForm.note         = row.note         ?? "";
  editModal.open = true;
}
 
function closeEdit() {
  editModal.open = false;
  editModal.row  = null;
}
 
function submitEdit() {
  emit("edit-saved", {
    ...editModal.row,
    shippingType: editForm.shippingType,
    status:       editForm.status,
    note:         editForm.note,
  });
  closeEdit();
}
 
// ── XOÁ ──────────────────────────────────────────────────
const deleteModal = reactive({ open: false, row: null });
 
function openDelete(row) {
  deleteModal.row  = row;
  deleteModal.open = true;
}
 
function closeDelete() {
  deleteModal.open = false;
  deleteModal.row  = null;
}
 
function submitDelete() {
  emit("delete-confirmed", deleteModal.row);
  closeDelete();
}
</script>
 
<style scoped>
/* Fade transition cho modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
 
/* Slide-up cho modal content */
.fade-enter-active .rounded-2xl {
  animation: slideUp 0.2s ease;
}
 
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>