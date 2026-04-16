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
          <a v-for="item in navItems" :key="item.id"
            :class="['nav-item', { active: currentRoute === item.route }]"
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
        <section class="card">
          <h3 class="card-title">Thay đổi mật khẩu</h3>

          <form class="profile-form" @submit.prevent="savePassword">
            <div class="form-grid single-col">

              <div class="form-group">
                <label for="current-password">Mật khẩu hiện tại</label>
                <input
                  id="current-password"
                  v-model="passwordForm.current"
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div class="form-group">
                <label for="new-password">Mật khẩu mới</label>
                <input
                  id="new-password"
                  v-model="passwordForm.newPass"
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div class="form-group">
                <label for="confirm-password">Xác nhận mật khẩu mới</label>
                <input
                  id="confirm-password"
                  v-model="passwordForm.confirm"
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>

            </div>

            <p v-if="message" :class="['form-message', messageType]">{{ message }}</p>

            <button class="save-btn" type="submit">Cập nhật mật khẩu</button>
          </form>
        </section>
      </main>

    </div>
  </div>
</template>

<script setup>
import { useUserChangePassword } from '../JS-USER/UserChangePassword.JS'
import { useAuthStore } from "../Authorization/Auth";
import { useRouter } from "vue-router";

const {
  passwordForm,
  navItems, currentRoute,
  message, messageType,
  savePassword, goTo
} = useUserChangePassword()


const auth = useAuthStore();
const router = useRouter();

const user = auth.user;

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<style scoped src="../CSS-USER/UserAccount.CSS"></style>