<style scoped src="../CSS/AdminEmployee.CSS"></style>
<template>
  <div class="employee-container">
    <div class="header">
      <h2>Quản lý tài khoản nhân viên</h2>
      <button class="btn-them" @click="openAdd">+ Thêm nhân viên</button>
    </div>

    <div class="filter">
      <input v-model="search" @keyup.enter="filterEmployee" placeholder="Tìm theo tên hoặc tài khoản..." />
      <button class="btn-filter" @click="filterEmployee">Lọc</button>
      <button class="btn-reset" @click="resetFilter">Xóa lọc</button>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 60px">STT</th>
          <th>Tên nhân viên</th>
          <th>Tài khoản</th>
          <th>Mật khẩu</th>
          <th style="width: 120px">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(emp, index) in filteredEmployees" :key="emp.id">
          <td>{{ index + 1 }}</td>
          <td class="name-cell">{{ emp.fullName }}</td>
          <td><span class="badge-id">{{ emp.account }}</span></td>
          <td class="password-cell">••••••••</td> <td>
            <div class="action-buttons">
              <button class="edit-btn" @click="openEdit(index)">Sửa</button>
              <button class="delete-btn" @click="deleteEmployee(index)">Xóa</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showPopup" class="popup-overlay show">
      <div class="popup">
        <div class="popup-header">
          <h3>{{ isEditing ? "Sửa nhân viên" : "Thêm nhân viên" }}</h3>
          <span class="close-btn" @click="closePopup">✖</span>
        </div>
        <div class="form-grid">
          <div class="form-group full">
            <label>Họ và Tên</label>
            <input v-model="form.fullName" placeholder="Nhập tên đầy đủ" />
          </div>
          <div class="form-group full">
            <label>Tài khoản</label>
            <input v-model="form.account" :readonly="isEditing" />
          </div>
          <div class="form-group full">
            <label>{{ isEditing ? 'Mật khẩu hiện tại' : 'Mật khẩu' }}</label>
            <input type="password" v-model="form.password" :disabled="isEditing" />
          </div>
          <div class="form-group full" v-if="isEditing">
            <label>Mật khẩu mới (Để trống nếu không đổi)</label>
            <input type="password" v-model="form.newPassword" />
          </div>
        </div>
        <div class="popup-actions">
          <button class="cancel-btn" @click="closePopup">Hủy</button>
          <button class="save-btn" @click="saveEmployee">Lưu nhân viên</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import useEmployee from "../JS/AdminEmployee.JS";

const {
  filteredEmployees,
  search,
  filterEmployee,
  resetFilter,
  loadEmployees,
  deleteEmployee,
  openEdit,
  openAdd,
  isEditing,
  showPopup,
  form,
  closePopup,
  saveEmployee,
  employees
} = useEmployee();

onMounted(() => loadEmployees());
</script>
