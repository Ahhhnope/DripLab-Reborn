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
          <p class="sidebar-role">{{ user.tier?.name }}</p>
        </div>

        <nav class="sidebar-nav">
          <a v-for="item in navItems" :key="item.id" :class="['nav-item', { active: currentRoute === item.route }]"
            @click="goTo(item.route)">
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

              <!-- Số nhà, tên đường -->
              <div class="form-group">
                <label>Số nhà, tên đường</label>
                <input v-model="fullAddress" type="text" placeholder="123 Đường Lê Lợi" />
              </div>

              <!-- Phường / Xã -->
              <div class="form-group">
                <label>Phường / Xã</label>
                <div class="field-input-wrap">
                  <input v-model="wardSearch" list="ward-list" type="text" :class="{ 'ward-selected': ward }"
                    placeholder="Tìm phường / xã…" autocomplete="off" @change="onWardChange" @input="onWardInput" />
                  <datalist id="ward-list">
                    <option v-for="w in ALL_WARDS" :key="w" :value="w" />
                  </datalist>
                </div>
              </div>

              <!-- Thành phố (fixed) -->
              <div class="form-group">
                <label>Thành phố</label>
                <input :value="city" type="text" readonly />
              </div>

            </div>

            <p v-if="message" :class="['form-message', messageType]">{{ message }}</p>

            <div class="form-footer">
              <button class="save-btn" type="submit" :disabled="isLoading">
                {{ isLoading ? 'Đang lưu...' : 'Lưu địa chỉ' }}
              </button>
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
  fullAddress,
  wardSearch,      // ← thêm
  ward,            // ← thêm
  ALL_WARDS,       // ← thêm
  city,            // ← thêm
  navItems,
  currentRoute,
  message,
  messageType,
  isLoading,       // ← thêm
  saveAddress,
  goTo,
  onWardInput,     // ← thêm
  onWardChange,    // ← thêm
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