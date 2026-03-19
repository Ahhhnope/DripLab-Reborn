<template>
  <div class="card">
    <input class="input" v-model="form.keyword" placeholder="Tìm theo mã " @keyup.enter="apply" />

    <select class="select" v-model="form.status">
      <option value="all">Tất cả trạng thái</option>
      <option value="pending">Chờ xác nhận</option>
      <option value="processing">Đang xử lý</option>
      <option value="shipping">Đang vận chuyển</option>
      <option value="delivered">Đã giao</option>
      <option value="cancelled">Đã huỷ</option>
    </select>

    <select class="select" v-model="form.type">
      <option value="all">Tất cả loại</option>
      <option value="online">Online</option>
      <option value="counter">Tại quầy</option>
    </select>

    <input class="date" type="date" v-model="form.fromDate" />
    <input class="date" type="date" v-model="form.toDate" />

    <button class="btn primary" @click="apply">Lọc</button>
    <button class="btn ghost" @click="reset">Xóa lọc</button>
  </div>
</template>

<script setup>
import { useOrderFilter } from "../Front-End/JS/OrderFilter";

const emit = defineEmits(["apply", "reset"]);
const { form, apply, reset } = useOrderFilter(emit);
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 14px;
  padding: 14px;
  display: grid;
  grid-template-columns: 300px 190px 170px 170px 170px 90px 110px;
  gap: 12px;
  align-items: center;
}

.input,
.select,
.date {
  height: 44px;
  border: 1px solid #e6ebf2;
  border-radius: 12px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
}

.input:focus,
.select:focus,
.date:focus {
  border-color: #ff7a00;
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.12);
}

.btn {
  height: 44px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  transition: 0.15s ease;
}

.primary {
  background: #ff7a00;
  color: #fff;
}

.primary:hover {
  filter: brightness(0.95);
}

.ghost {
  background: #e5e7eb;
  color: #111827;
}

.ghost:hover {
  filter: brightness(0.97);
}

/* Responsive: màn nhỏ thì xuống dòng */
@media (max-width: 1200px) {
  .card {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
