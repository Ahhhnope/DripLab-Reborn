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

          <div class="card-title-row">
            <div class="card-title-icon">
              <span class="material-symbols-outlined">location_on</span>
            </div>
            <h3 class="card-title">Quản lý địa chỉ</h3>
          </div>

          <form class="profile-form" @submit.prevent="saveAddress">
            <div class="form-grid single-col">
              <div class="form-group">
                <label>Địa chỉ đường phố</label>
                <input v-model="addressForm.street" type="text" placeholder=" 72A Nguyễn Trãi, phường Thượng Đình, quận Thanh Xuân" />
              </div>
              <div class="form-group">
                <label>Căn hộ, phòng, v.v. (Tùy chọn)</label>
                <input v-model="addressForm.apt" type="text" placeholder="Căn 48b Chung cư Royal City" />
              </div>
            </div>

            <div class="form-grid three-col">
              <div class="form-group">
                <label>Thành phố</label>
                <input value="Hà Nội" readonly />
              </div>
            </div>

            <p v-if="message" :class="['form-message', messageType]">{{ message }}</p>

            <div class="form-footer">
              <button class="save-btn" type="submit">Lưu địa chỉ</button>
            </div>
          </form>

        </section>
      </main>

    </div>
  </div>
</template>

<script setup>
import { useUserAddress } from '../JS-USER/UserAddress.JS'
import { useAuthStore } from "../Authorization/Auth";
import { useRouter } from "vue-router";

const {
  addressForm,
  navItems, currentRoute,
  message, messageType,
  saveAddress, goTo
} = useUserAddress()


const auth = useAuthStore();
const router = useRouter();

const user = auth.user;

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<style scoped src="../CSS-USER/UserAccount.CSS"></style>