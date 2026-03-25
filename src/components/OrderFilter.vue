<template>
  <div class="filter-card">
    <div class="filter-item flex-2">
      <input 
        class="input-control" 
        v-model="form.keyword" 
        placeholder="Tìm theo mã đơn hàng..." 
        @keyup.enter="apply" 
      />
    </div>

    <div class="filter-item flex-1">
      <select class="input-control" v-model="form.status">
        <option value="all">Tất cả trạng thái</option>
        <option value="pending">Chờ xác nhận</option>
        <option value="processing">Đang xử lý</option>
        <option value="shipping">Đang vận chuyển</option>
        <option value="delivered">Đã giao</option>
        <option value="cancelled">Đã huỷ</option>
      </select>
    </div>

    <div class="filter-item flex-1">
      <select class="input-control" v-model="form.type">
        <option value="all">Tất cả loại</option>
        <option value="online">Online</option>
        <option value="counter">Tại quầy</option>
      </select>
    </div>

    <div class="filter-item flex-1">
      <input class="input-control" type="date" v-model="form.fromDate" />
    </div>

    <div class="filter-item flex-1">
      <input class="input-control" type="date" v-model="form.toDate" />
    </div>

    <div class="button-group">
      <button class="btn btn-primary" @click="apply">Lọc</button>
      <button class="btn btn-ghost" @click="reset">Xóa lọc</button>
    </div>
  </div>
</template>

<script setup>
import { useOrderFilter } from "../Front-End/JS/OrderFilter";

const emit = defineEmits(["apply", "reset"]);
const { form, apply, reset } = useOrderFilter(emit);
</script>

<style scoped>
.filter-card {
  background: #fff;
  border: 1px solid #f0ece8; /* Nâu nhạt */
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-wrap: wrap; /* Quan trọng nhất: Tự động xuống hàng */
  gap: 12px;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
  margin-bottom: 20px;
}

.filter-item {
  min-width: 160px; /* Điểm gãy để nhảy hàng */
}

/* Ô tìm kiếm ưu tiên rộng hơn */
.flex-2 { flex: 2 1 240px; }
.flex-1 { flex: 1 1 160px; }

.input-control {
  width: 100%;
  height: 44px;
  border: 1px solid #e6ebf2;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 14px;
  outline: none;
  background: #fff;
  transition: all 0.2s ease-in-out;
  color: #3C2A21;
}

.input-control:focus {
  border-color: #634832; /* Màu nâu cafe */
  box-shadow: 0 0 0 3px rgba(99, 72, 50, 0.1);
}

.button-group {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn {
  height: 44px;
  padding: 0 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #ff7a00; /* Giữ màu cam nhấn của bạn hoặc đổi thành #634832 */
  color: #fff;
}

.btn-primary:hover {
  filter: brightness(0.9);
  transform: translateY(-1px);
}

.btn-ghost {
  background: #f5ebe0; /* Màu kem sữa */
  color: #634832;
}

.btn-ghost:hover {
  background: #ede0d4;
}

/* Responsive cho màn hình điện thoại */
@media (max-width: 640px) {
  .filter-item {
    flex: 1 1 100% !important; /* Mỗi ô chiếm trọn 1 hàng */
  }
  .button-group {
    width: 100%;
  }
  .btn {
    flex: 1; /* Hai nút dãn đều 50/50 */
  }
}
</style>