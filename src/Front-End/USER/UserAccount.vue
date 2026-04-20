<template>
  <div class="account-wrapper">
    <div class="account-inner">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-profile">
          <div class="avatar-ring">
            <img :src="user.avatar" alt="Avatar" class="avatar-img" />
          </div>
          <h2 class="sidebar-name">{{ user.fullName }}</h2>
          <p class="sidebar-role">Thành viên cao cấp</p>
        </div>

        <nav class="sidebar-nav">
          <a
            v-for="item in navItems"
            :key="item.id"
            :class="['nav-item', { active: item.route === '/account' }]"
            @click="goTo(item.route)"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>

          <div class="nav-divider"></div>

          <a class="nav-item logout" @click="logout">
            <span class="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="account-main">
        <!-- Profile Settings -->
        <section v-if="activeTab === 'account'" class="card">
          <h3 class="card-title">Cài đặt hồ sơ</h3>

          <div class="profile-pic-row">
            <div class="avatar-edit">
              <!-- yippe ;-; -->
              <img :src="user.avatar" alt="Profile" class="profile-img" />
              <button class="edit-avatar-btn" @click="triggerFileInput">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="onAvatarChange"
              />
            </div>
            <div>
              <p class="pic-label">Ảnh đại diện</p>
            </div>
          </div>

          <form class="profile-form" @submit.prevent="saveProfile">
            <div class="form-grid">
              <div class="form-group">
                <label for="fullname">Tên đầy đủ</label>
                <input id="fullname" v-model="form.fullName" type="text" />
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input id="email" v-model="form.email" type="email" />
              </div>
              <div class="form-group">
                <label for="phone">Số điện thoại</label>
                <input id="phone" v-model="form.phone" type="tel" />
              </div>
            </div>
            <button class="save-btn" type="submit">Lưu giữ</button>
          </form>
        </section>

        <!-- Change Password -->
        <section v-if="activeTab === 'password'" class="card">
          <h3 class="card-title">Thay đổi mật khẩu</h3>
          <form class="profile-form" @submit.prevent="savePassword">
            <div class="form-grid">
              <div class="form-group">
                <label>Mật khẩu hiện tại</label>
                <input v-model="passwordForm.current" type="password" />
              </div>
              <div class="form-group">
                <label>Mật khẩu mới</label>
                <input v-model="passwordForm.newPass" type="password" />
              </div>
              <div class="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input v-model="passwordForm.confirm" type="password" />
              </div>
            </div>
            <button class="save-btn" type="submit">Cập nhật mật khẩu</button>
          </form>
        </section>

        <!-- Address -->
        <section v-if="activeTab === 'address'" class="card">
          <h3 class="card-title">Địa chỉ của tôi</h3>
          <div class="address-list">
            <div v-for="(addr, i) in addresses" :key="i" class="address-card">
              <div class="address-info">
                <p class="address-label">{{ addr.label }}</p>
                <p class="address-text">{{ addr.text }}</p>
              </div>
              <button class="edit-address-btn">
                <span class="material-symbols-outlined">Chỉnh sửa</span>
              </button>
            </div>
            <button class="add-address-btn">+ Nhập địa chỉ mới</button>
          </div>
        </section>

        <!-- Orders -->
        <section v-if="activeTab === 'orders'" class="card">
          <h3 class="card-title">Đơn hàng của tôi</h3>
          <div class="order-list">
            <div v-for="order in orders" :key="order.id" class="order-card">
              <div class="order-top">
                <span class="order-id">#{{ order.id }}</span>
                <span :class="['order-status', order.status.toLowerCase()]">{{
                  order.status
                }}</span>
              </div>
              <p class="order-date">{{ order.date }}</p>
              <p class="order-total">
                {{ order.total.toLocaleString("vi-VN") }} VND
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useUserAccount } from "../JS-USER/UserAccount.JS";
import { useAuthStore } from "../Authorization/Auth";
import { useRouter } from "vue-router";

const {
  form, passwordForm,
  addresses, orders,
  navItems, activeTab,
  fileInput,
  triggerFileInput,
  onAvatarChange,
  setTab,
  saveProfile, savePassword,
  goTo
} = useUserAccount()

const auth = useAuthStore();
const router = useRouter();

import { computed } from 'vue'
const user = computed(() => auth.user || {})

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<style scoped src="../CSS-USER/UserAccount.CSS"></style>
