<template>
  <div class="order-table-wrapper">
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Người đặt</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th>Số món</th>
            <th>Phải trả</th>
            <th>Ngày đặt</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="r in items" :key="r.code">
            <td><span class="order-code">{{ r.code }}</span></td>
            <td>{{ r.user?.fullName || "-" }}</td>
            <td>{{ r.shippingType || "-" }}</td>
            <td>
              <span class="status-badge" :class="statusClass(r.status)">
                {{ statusText(r.status) }}
              </span>
            </td>
            <td class="text-center">{{ r.qty ?? "-" }}</td>
            <td class="text-right price">{{ money(r.pay) }}</td>
            <td class="nowrap">{{ r.deadline || "-" }}</td>
            <td class="text-center">
              <button class="btn-view" @click="emit('view', r)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Xem chi tiết
              </button>
            </td>
          </tr>

          <tr v-if="!items?.length">
            <td colspan="8" class="empty-td">Không có đơn hàng nào</td>
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

const emit = defineEmits(["view"]);
const { money, statusText, statusClass } = useOrderTable(emit);
</script>

<style scoped>
.order-table-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

thead th {
  background: #f1f5f9;
  padding: 13px 16px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  text-align: left;
  border: 1px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

tbody tr { transition: background 0.12s; }
tbody tr:hover { background: #fafbff; }

tbody td {
  padding: 12px 16px;
  font-size: 13.5px;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.text-center { text-align: center; }
.text-right  { text-align: right; }
.nowrap      { white-space: nowrap; }

.order-code {
  font-weight: 800;
  color: #2563eb;
  font-size: 13.5px;
}

.price {
  font-weight: 700;
  color: #111827;
}

/* ── Status badge ─────────────────────────────── */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  white-space: nowrap;
}

/* Màu từng trạng thái — giữ nguyên class từ useOrderTable */
:deep(.status-pending),
.status-pending   { background: #fef9c3; color: #854d0e; border-color: #fde68a; }
:deep(.status-processing),
.status-processing { background: #dbeafe; color: #1d4ed8; border-color: #bfdbfe; }
:deep(.status-shipping),
.status-shipping  { background: #ede9fe; color: #6d28d9; border-color: #ddd6fe; }
:deep(.status-delivered),
.status-delivered { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
:deep(.status-cancelled),
.status-cancelled { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
:deep(.status-delivery_failed),
.status-delivery_failed { background: #ffedd5; color: #9a3412; border-color: #fed7aa; }

/* ── Button xem chi tiết ─────────────────────── */
.btn-view {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2563eb;
  color: white;
  border: none;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.btn-view:hover { background: #1d4ed8; }

/* ── Empty ───────────────────────────────────── */
.empty-td {
  text-align: center;
  padding: 48px;
  color: #9ca3af;
  font-size: 14px;
}
</style>