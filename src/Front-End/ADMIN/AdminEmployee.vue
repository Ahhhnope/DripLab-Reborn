<style scoped src="../CSS/AdminEmployee.CSS"></style>
<template>
  <div class="employee-container">
    <!-- HEADER -->
    <div class="header">
      <h2>Quản lý tài khoản nhân viên</h2>
      <button @click="openAdd">+ Thêm nhân viên</button>
    </div>

    <!-- FILTER -->
    <div class="filter">
      <input v-model="search" placeholder="Tìm theo tên hoặc tài khoản" />
      <button class="btn-filter" @click="filterEmployee">Lọc</button>
      <button class="btn-reset" @click="resetFilter">Xóa lọc</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Tên nhân viên</th>
          <th>Tài khoản</th>
          <th>Mật khẩu</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(emp, index) in employees" :key="emp.id">
          <td>{{ emp.fullName }}wat</td>
          <td>{{ emp.account }}</td>
          <td>{{ emp.password }}</td>
          <td>
            <div class="action-buttons">
              <button class="edit-btn" @click="openEdit(index)">Sửa</button>
              <button class="delete-btn" @click="deleteEmployee(index)">
                Xóa
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showPopup" class="popup-overlay">
      <div class="popup">
        <div class="popup-header">
          <h3>{{ isEditing ? "Sửa nhân viên" : "Thêm nhân viên" }}</h3>
          <span class="close-btn" @click="closePopup">✖</span>
        </div>
        <div class="form-group">
          <label>Tên</label>
          <input v-model="form.name" />
        </div>
        <div class="form-group">
          <label>Tài khoản</label>
          <input v-model="form.username" />
        </div>
        <div class="form-group">
          <label>Mật khẩu</label>
          <input type="password" v-model="form.password" />
        </div>
        <div class="form-group" v-if="isEditing">
          <label>Mật khẩu mới</label>
          <input type="password" v-model="form.newPassword" />
        </div>
        <div class="popup-actions">
          <button class="save-btn" @click="saveEmployee">Lưu</button>
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
