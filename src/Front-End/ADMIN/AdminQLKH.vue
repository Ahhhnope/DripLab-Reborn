<style scoped src="../CSS/AdminQLKH.CSS"></style>
<template>
  <div class="customer-container">
    <!-- HEADER -->
    <div class="header">
      <h2>Khách hàng</h2>
    </div>

    <!-- FILTER -->
    <div class="filter">
      <input v-model="search" placeholder="Tìm theo tên hoặc tài khoản" />
      <button class="btn-filter" @click="filterCustomer">Lọc</button>
      <button class="btn-reset" @click="resetFilter">Xóa lọc</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>ID</th>
          <th>Tên khách hàng</th>
          <th>Tài khoản</th>
          <th>Mật khẩu</th>
          <th>SDT</th>
          <th>Địa chỉ</th>
          <th>Ngày tạo</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cus, index) in filteredCustomers" :key="cus.id">
          <td>{{ index + 1 }}</td>
          <td>{{ cus.id }}</td>
          <td>{{ cus.name }}</td>
          <td>{{ cus.username }}</td>
          <td>{{ cus.password }}</td>
          <td>{{ cus.phone }}</td>
          <td>{{ cus.address }}</td>
          <td>{{ cus.createdAt }}</td>
          <td>
            <div class="action-buttons">
              <button class="delete-btn" @click="deleteCustomer(index)">Xóa</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- POPUP THÊM -->
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup">
        <div class="popup-header">
          <h3>Thêm khách hàng</h3>
          <span class="close-btn" @click="closePopup">✖</span>
        </div>
        <div class="form-group">
          <label>Tên khách hàng</label>
          <input v-model="form.name" placeholder="Nhập tên khách hàng" />
        </div>
        <div class="form-group">
          <label>Tài khoản</label>
          <input v-model="form.username" placeholder="Nhập tài khoản" />
        </div>
        <div class="form-group">
          <label>Mật khẩu</label>
          <input type="password" v-model="form.password" placeholder="Nhập mật khẩu" />
        </div>
        <div class="form-group">
          <label>Số điện thoại</label>
          <input v-model="form.phone" placeholder="Nhập số điện thoại" />
        </div>
        <div class="form-group">
          <label>Địa chỉ</label>
          <input v-model="form.address" placeholder="Nhập địa chỉ" />
        </div>
        <div class="popup-actions">
          <button class="save-btn" @click="saveCustomer">Lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue"
import useCustomer from "../JS/AdminQLKH.JS"

const {
  filteredCustomers,
  search,
  filterCustomer,
  resetFilter,
  loadCustomers,
  deleteCustomer,
  openAdd,
  showPopup,
  form,
  closePopup,
  saveCustomer,
} = useCustomer()

onMounted(() => loadCustomers())
</script>