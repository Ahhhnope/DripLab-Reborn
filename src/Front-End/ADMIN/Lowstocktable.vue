<template>
  <div style="overflow-x: auto">
    <table class="low-stock-table">
      <thead>
        <tr>
          <th style="width: 40px">STT</th>
          <th>Tên Sản Phẩm</th>
          <th style="width: 80px">Kích cỡ</th>
          <th style="width: 80px; text-align: center">Tồn kho</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.id }}</td>
          <td><span style="font-weight: 600; color: #2c1a0e">{{ item.name }}</span></td>
          <td><span class="size-badge">{{ item.size }}</span></td>
          <td style="text-align: center">
            <span :class="{
              'stock-zero': item.stock === 0,
              'stock-low':  item.stock > 0 && item.stock <= 5,
              'stock-ok':   item.stock > 5
            }">{{ item.stock }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true }
})
</script>