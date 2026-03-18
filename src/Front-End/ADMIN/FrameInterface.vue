<script setup>
import { useAdminMenu } from "../JS/FrameInterface.JS";

const { menuItems, activeIndex, openMenu, openSub, logout, clickMenu, clickSub, clickSubChild } = useAdminMenu();
</script>

<style scoped src="../CSS/FrameInterface.CSS"></style>

<template>
  <div class="admin-layout">
    <aside class="sidebar">

      <div class="sidebar-header">
        <img src="../IMG/DripLab_Logo.png" class="sidebar-logo" alt="logo" />
      </div>

      <ul class="sidebar-nav">
        <li v-for="item in menuItems" :key="item.id">

          <button class="nav-item" :class="{ active: activeIndex === item.id }" @click="clickMenu(item)">
            {{ item.label }}
            <span v-if="item.children">{{ openMenu === item.id ? '▴' : '▾' }}</span>
          </button>

          <!-- Cấp 1 -->
          <ul v-if="item.children && openMenu === item.id" class="submenu">
            <li v-for="child in item.children" :key="child.id">

              <button class="nav-item sub-item" :class="{ active: activeIndex === child.id }" @click="clickSub(child)">
                {{ child.label }}
                <span v-if="child.subChildren">{{ openSub === child.id ? '▴' : '▾' }}</span>
              </button>

              <!-- Cấp 2 -->
              <ul v-if="child.subChildren && openSub === child.id" class="submenu level2-menu">
                <li v-for="sub in child.subChildren" :key="sub.id">
                  <button class="nav-item sub-item level2" :class="{ active: activeIndex === sub.id }"
                    @click="clickSubChild(sub)">
                    {{ sub.label }}
                  </button>
                </li>
              </ul>

            </li>
          </ul>

        </li>
      </ul>

      <div class="sidebar-footer">
        <div class="user-avatar">A</div>
        <div class="user-info">
          <div class="user-name">Quản Trị Viên</div>
          <div class="user-role">Nguyễn Huy Bình</div>
        </div>
        <button class="logout-btn" @click="logout" title="Đăng xuất">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          </svg>
        </button>
      </div>

    </aside>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>