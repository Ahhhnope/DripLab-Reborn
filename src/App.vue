<script setup>
import AdminPOS from "./views/AdminPOS.vue"
</script>

<template>
  <main class="main-content">
    <AdminPOS />
  </main>
</template>

<style>
body{
  margin:0;
  padding:0;
}

#app{
  display:flex;
  flex-direction:column;
  min-height:100vh;
  width:100%;
}

/* phần nội dung chính */
.main-content{
  flex:1;
  width:100%;
  margin:0;
  padding:0;
}

/* QUAN TRỌNG: bỏ container giới hạn */
.content-container{
  width:100%;
  max-width:none;
  margin:0;
  padding:0;
}
</style>