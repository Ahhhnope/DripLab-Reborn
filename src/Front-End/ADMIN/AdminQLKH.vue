<style scoped src="../CSS/AdminQLKH.CSS"></style>
<template>
  <div class="customer-container">
    <div class="header">
      <h2>Quản lý Khách hàng</h2>
      <button class="btn-them" @click="openAdd">+ Thêm khách hàng</button>
    </div>

    <div class="filter">
      <input v-model="search" @keyup.enter="filterCustomer" placeholder="Tìm tên hoặc Email..." />
      <button class="btn-filter" @click="filterCustomer">Lọc</button>
      <button class="btn-reset" @click="resetFilter">Xóa lọc</button>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 50px">STT</th>
          <th style="width: 70px">ID</th>
          <th>Tên khách hàng</th>
          <th>Email (Tài khoản)</th>
          <th>Mật khẩu</th>
          <th>SĐT</th>
          <th>Địa chỉ</th>
          <th style="width: 120px">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cus, index) in filteredCustomers" :key="cus.id">
          <td>{{ index + 1 }}</td>
          <td><span class="badge-id">{{ cus.id }}</span></td>
          <td class="name-cell">{{ cus.fullName }}</td>
          <td>{{ cus.email }}</td>
          <td class="password-cell">••••••••</td>
          <td>{{ cus.phone }}</td>
          <td>{{ cus.defaultAddress }}</td>
          <td>
            <div class="action-buttons">
              <button class="delete-btn" title="Xóa" @click="deleteCustomer(index)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showPopup" class="popup-overlay show">
      <div class="popup">
        <div class="popup-header">
          <h3>Thêm khách hàng mới</h3>
          <span class="close-btn" @click="closePopup">✖</span>
        </div>
        <div class="form-grid">
          <div class="form-group full">
            <label>Họ và Tên</label>
            <input v-model="form.fullName" />
          </div>
          <div class="form-group full">
            <label>Email / Tài khoản</label>
            <input v-model="form.account" placeholder="example@gmail.com" />
          </div>
          <div class="form-group full">
            <label>Mật khẩu</label>
            <input type="password" v-model="form.password" />
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <input v-model="form.phone" />
          </div>
          <div class="form-group">
            <label>Địa chỉ</label>
            <input v-model="form.address" />
          </div>
        </div>
        <div class="popup-actions">
          <button class="cancel-btn" @click="closePopup">Hủy</button>
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