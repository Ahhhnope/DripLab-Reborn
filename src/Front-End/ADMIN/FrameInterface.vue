<script setup>
import { useAdminMenu } from '../JS/FrameInterface.JS'
const { menuItems, setActive, isActive, logout } = useAdminMenu()
</script>

<style scoped src="../CSS/FrameInterface.CSS"></style>

<template>
    <div class="admin-layout">
        <aside class="sidebar">
            <div class="sidebar-header">
                <img src="../IMG/DripLab_Logo.png" class="sidebar-logo" alt="logo" />
                <span class="sidebar-title">ADMIN</span>
            </div>

            <ul class="sidebar-nav">
                <li v-for="item in menuItems" :key="item.id">
                    <button class="nav-item" :class="{ active: isActive(item.id) }" @click="setActive(item.id)">
                        {{ item.label }}
                    </button>
                </li>
            </ul>

            <div class="sidebar-footer">
                <button class="logout-btn" @click="logout">← LOGOUT</button>
            </div>
        </aside>

        <main class="main-content">

        </main>
    </div>
</template>
