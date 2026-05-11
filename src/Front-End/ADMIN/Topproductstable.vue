<template>
  <div style="overflow-x: auto">
    <table class="top-products-table">
      <thead>
        <tr>
          <th style="width: 46px">#</th>
          <th>Tên Sản Phẩm</th>
          <th style="width: 120px">Giá</th>
          <th style="width: 80px; text-align: center">Đã bán</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.rank">
          <td>
            <span class="rank-badge" :class="{
              'rank-gold':   item.badge === 'gold',
              'rank-silver': item.badge === 'silver',
              'rank-bronze': item.badge === 'bronze',
              'rank-plain':  !item.badge
            }">{{ item.rank }}</span>
          </td>
          <td>
            <div class="product-name">{{ item.name }}</div>
            <div class="product-size">Size: {{ item.size }}</div>
          </td>
          <td class="product-price">{{ item.price }}</td>
          <td style="text-align: center">
            <span class="sold-badge">{{ item.sold }}</span>
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