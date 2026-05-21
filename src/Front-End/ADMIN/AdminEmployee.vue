<style scoped src="../CSS/AdminEmployee.CSS"></style>
<template>
  <div class="employee-container">
    <div class="header">
      <h2>Quản lý tài khoản nhân viên</h2>
      <button @click="openAdd">+ Thêm nhân viên</button>
    </div>

    <div class="filter">
      <input v-model="search" @keyup.enter="filterEmployee" placeholder="Tìm theo tên hoặc tài khoản..." />
      <button class="btn-filter" @click="filterEmployee">Lọc</button>
      <button class="btn-reset" @click="resetFilter">Xóa lọc</button>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 50px">STT</th>
          <th style="width: 70px">ID</th>
          <th>Tên nhân viên</th>
          <th>Tài khoản</th>
          <th>Mật khẩu</th>
          <th>Role</th>
          <th style="width: 130px">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(emp, index) in filteredEmployees" :key="emp.id">
          <td>{{ index + 1 }}</td>
          <td><span class="badge-id">{{ emp.id }}</span></td>
          <td>{{ emp.fullName }}</td>
          <td>{{ emp.account }}</td>
          <td>••••••••</td>
          <td>
            <span
              class="badge-role"
              :class="{
                admin: emp.role === 'ADMIN',
                manager: emp.role === 'MANAGER',
                staff: emp.role === 'STAFF' || !emp.role
              }"
            >
              {{ emp.role || 'STAFF' }}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="edit-btn" @click="openEdit(index)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Sửa
              </button>
              <button class="delete-btn" @click="deleteEmployee(index)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showPopup" class="popup-overlay">
      <div class="popup">
        <div class="popup-header">
          <h3>{{ isEditing ? 'Sửa nhân viên' : 'Thêm nhân viên mới' }}</h3>
          <span class="close-btn" @click="closePopup">✖</span>
        </div>

        <div class="form-group">
          <label>Họ và Tên</label>
          <input v-model="form.fullName" placeholder="Nhập tên đầy đủ" />
        </div>
        <div class="form-group">
          <label>Tài khoản</label>
          <input v-model="form.account" :readonly="isEditing" />
        </div>
        <div class="form-group">
          <label>{{ isEditing ? 'Mật khẩu hiện tại' : 'Mật khẩu' }}</label>
          <input type="password" v-model="form.password" :disabled="isEditing" />
        </div>
        <div class="form-group" v-if="isEditing">
          <label>Mật khẩu mới (Để trống nếu không đổi)</label>
          <input type="password" v-model="form.newPassword" />
        </div>
        <div class="form-group">
          <label>Role</label>
          <select v-model="form.role">
            <option value="STAFF">STAFF</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
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
import { onMounted } from "vue";
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
} = useEmployee();

onMounted(() => loadEmployees());
</script>