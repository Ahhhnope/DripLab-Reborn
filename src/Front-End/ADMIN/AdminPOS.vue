<style scoped src="../CSS/AdminPOS.CSS"></style>

<template>
  <div class="admin-layout">
    <main class="main-content">
      <!-- Products -->
      <section class="products">
        <div class="search-bar">
          <input v-model="search" type="text" placeholder="Tìm sản phẩm..." />
          <button @click="searchProduct">Tìm kiếm</button>
        </div>

        <div class="custom-grid">
          <div class="custom-card" @click="openBean">
            <h3>Chọn hạt cà phê</h3>
            <p v-if="selected.bean">{{ selected.bean.name }}</p>
          </div>

          <div
            class="custom-card"
            :class="{ disabled: step < 2 }"
            @click="openBase"
          >
            <h3>Chọn base</h3>
            <p v-if="selected.base">{{ selected.base.name }}</p>
          </div>

          <div
            class="custom-card"
            :class="{ disabled: step < 3 }"
            @click="openMilk"
          >
            <h3>Chọn sữa</h3>
            <p v-if="selected.milk">{{ selected.milk.name }}</p>
          </div>

          <div
            class="custom-card"
            :class="{ disabled: step < 4 }"
            @click="openTopping"
          >
            <h3>Chọn topping</h3>
            <p v-if="selected.topping">{{ selected.topping.name }}</p>
          </div>
        </div>
      </section>

      <!-- Cart -->
      <aside class="cart">
        <div class="cart-items">
          <h3>Sản phẩm đã gọi:</h3>

          <div v-for="item in cart" :key="item.id" class="cart-item">
            <span>{{ item.name }}</span>
            <span>{{ item.price }} VND</span>
          </div>
        </div>

        <div class="cart-footer">
          Mã giảm giá:
          <textarea placeholder="..."></textarea>

          <div class="total">Thành tiền: {{ total.toLocaleString() }} VND</div>

          <button class="pay-btn">Thanh toán</button>
        </div>
      </aside>
      <div v-if="showBeanPopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/Bean.jpg" class="card-img" />
          <h3>Chọn hạt cà phê</h3>

          <button v-for="b in beans" :key="b.name" @click="selectBean(b)">
            {{ b.name }} - {{ b.price }} VND
          </button>
        </div>
      </div>

      <div v-if="showBasePopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/base.png" class="card-img" />
          <h3>Chọn base</h3>

          <button v-for="b in bases" :key="b.name" @click="selectBase(b)">
            {{ b.name }} - {{ b.price }} VND
          </button>
        </div>
      </div>

      <div v-if="showMilkPopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/milk.jpg" class="card-img" />
          <h3>Chọn sữa</h3>

          <button v-for="m in milks" :key="m.name" @click="selectMilk(m)">
            {{ m.name }} - {{ m.price }} VND
          </button>
        </div>
      </div>

      <div v-if="showToppingPopup" class="popup">
        <div class="popup-box">
          <img src="../IMG/topping.jpg" class="card-img" />
          <h3>Chọn topping</h3>

          <button v-for="t in toppings" :key="t.name" @click="selectTopping(t)">
            {{ t.name }} - {{ t.price }} VND
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { usePOS } from "../JS/AdminPOS.js";

const {
  search,
  cart,
  total,
  step,
  selected,

  beans,
  bases,
  milks,
  toppings,

  showBeanPopup,
  showBasePopup,
  showMilkPopup,
  showToppingPopup,

  openBean,
  openBase,
  openMilk,
  openTopping,

  selectBean,
  selectBase,
  selectMilk,
  selectTopping,

  searchProduct,
} = usePOS();
</script>
