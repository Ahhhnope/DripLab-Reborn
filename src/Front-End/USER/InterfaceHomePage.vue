<script setup>
import InterfaceHeader from './InterfaceHeader.vue'
import InterfaceFooter from './InterfaceFooter.vue'
import Homepage from './Homepage.vue';
</script>

<template>
    <div class="user-layout">

        <InterfaceHeader />

        <main class="user-content">
            <RouterView />
        </main>

        <InterfaceFooter />
    </div>
</template>

<style src="../CSS-USER/InterfaceHomePage.CSS"></style>