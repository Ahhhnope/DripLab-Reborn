<template>
  <div class="employee-container">
    <div class="header">
      <h2>Nhân viên</h2>
      <button @click="addEmployee">Thêm nv</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>ID</th>
          <th>Tên nv</th>
          <th>Tài khoản</th>
          <th>Mật khẩu</th>
          <th>Ngày tạo</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(emp, index) in employees" :key="emp.id">
          <td>{{ index + 1 }}</td>
          <td>{{ emp.id }}</td>
          <td>{{ emp.name }}</td>
          <td>{{ emp.username }}</td>
          <td>{{ emp.password }}</td>
          <td>{{ emp.createdAt }}</td>
          <td>
            <span class="action" @click="editEmployee(index)">Sửa</span>
            |
            <span class="action" @click="deleteEmployee(index)">Xóa</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script src="../JS/AdminEmployee.JS"></script>
<style scoped src="../CSS/AdminEmployee.CSS"></style>