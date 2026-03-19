<template>
  <div class="card">
    <table class="table">
      <thead>
        <tr>
          <th>Mã đơn hàng</th>
          <th>Hình thức giao hàng</th>
          <th>Trạng thái</th>
          <th>Số lượng</th>
          <th style="text-align:right;">Khách hàng phải trả</th>
          <th>Hạn xác nhận</th>
          <th>Thao tác</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="r in items" :key="r.code">
          <td class="code">{{ r.code }}</td>
          <td>{{ r.shippingType }}</td>
          <td><span class="tag">{{ statusText(r.status) }}</span></td>
          <td style="text-align:center;">{{ r.qty }}</td>
          <td style="text-align:right;">{{ money(r.pay) }}</td>
          <td>{{ r.deadline }}</td>
          <td>
            <a href="#" @click.prevent="view(r)">Xem</a>
            |
            <a href="#" @click.prevent="confirm(r)">Xác nhận</a>
            |
            <a href="#" @click.prevent="cancel(r)">Huỷ</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useOrderTable } from "../Front-End/JS/OrderTable";

defineProps({ items: { type: Array, default: () => [] } });
const emit = defineEmits(["view", "confirm", "cancel"]);

const { money, statusText, view, confirm, cancel } = useOrderTable(emit);
</script>

<style scoped>
.card { background: #fff; border: 1px solid #eef1f6; border-radius: 10px; padding: 12px; }
.table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid #eef1f6; padding: 10px; font-size: 14px; }
.code { font-weight: 800; color: #1677ff; }
.tag { background: #fff2d7; border: 1px solid #ffe2a3; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
</style>
