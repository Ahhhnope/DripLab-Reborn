<template>
  <div class="pos-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <h2 class="logo">ADMIN</h2>

      <ul>
        <li>📊 Bảng quản trị</li>
        <li class="active">🧾 Đơn tại quầy</li>
        <li>📦 Quản lý đơn hàng</li>
        <li>🪑 Quản lý bàn</li>
        <li>☕ Quản lý sản phẩm</li>
        <li>🏷 Quản lý khuyến mãi</li>
      </ul>
    </aside>

    <!-- Products -->
    <main class="products">
      <!-- Search -->
      <div class="search-bar">
        <input v-model="search" type="text" placeholder="Tìm sản phẩm..." />
        <button @click="searchProduct">Tìm kiếm</button>
      </div>

      <!-- Product Grid -->
      <div class="product-grid">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
          @click="addToCart(product)"
        >
          <img :src="product.img" class="product-img" />

          <p class="product-name">{{ product.name }}</p>
        </div>
      </div>
    </main>

    <!-- Cart -->
    <aside class="cart">
      <h3>Sản phẩm đã gọi</h3>

      <div v-for="item in cart" :key="item.id" class="cart-item">
        <span>{{ item.name }}</span>
        <span>x{{ item.qty }}</span>
      </div>

      <textarea placeholder="Ghi chú..."></textarea>

      <div class="total">Thành tiền: {{ total }} VND</div>

      <button class="pay-btn">Thanh toán</button>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const search = ref("");

const products = ref([
  { id: 1, name: "Classic Latte", price: 35000, img: "/IMG/classic-latte.png" },
  { id: 2, name: "Cortado", price: 40000, img: "/IMG/cortado.png" },
  { id: 3, name: "Flat White", price: 38000, img: "/IMG/flat-white.jpg" },
  { id: 4, name: "Dark Velvet", price: 40000, img: "/IMG/dark-velvet.png" },
  { id: 5, name: "Ethiopia Yirgacheffe", price: 42000, img: "/IMG/ethiopia.png" },
  { id: 6, name: "V60 Seasonal", price: 45000, img: "/IMG/v602.jpg" },
  { id: 7, name: "Colombia Geisha", price: 42000, img: "/IMG/geisha.png" },
  { id: 8, name: "Mocha", price: 35000, img: "/IMG/mocha.jpg" },
  { id: 9, name: "Matcha Latte", price: 50000, img: "/IMG/Matcha-latte.png" },
  { id: 10, name: "Earl Grey Reverse", price: 35000, img: "/IMG/Earl-grey.png" },
  { id: 11, name: "Hojicha Roasted", price: 40000, img: "/IMG/Hojicha-roasted.png" },
  { id: 12, name: "Oolong High Mountain", price: 35000, img: "/IMG/oolong.png" },
]);

const cart = ref([]);

const filteredProducts = computed(() => {
  return products.value.filter((p) =>
    p.name.toLowerCase().includes(search.value.toLowerCase()),
  );
});

function searchProduct() {
  // chỉ cần input là đã filter rồi
}

function addToCart(product) {
  const exist = cart.value.find((i) => i.id === product.id);

  if (exist) {
    exist.qty++;
  } else {
    cart.value.push({
      ...product,
      qty: 1,
    });
  }
}

const total = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.qty, 0);
});
</script>

<style scoped>
.pos-container {
  display: flex;
  width: 100%;
  min-height: calc(100vh - 70px);
  background: #f5f6fa;
}

/* sidebar */

.sidebar {
  width: 230px;
  background: #7a4a0a;
  color: white;
  padding: 25px 20px;
  font-family: "Poppins", sans-serif;
}

.logo {
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 25px;
}

/* menu */

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 12px 14px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

/* hover */

.sidebar li:hover {
  background: #5e3608;
  padding-left: 18px;
}

/* active */

.active {
  background: #4caf50;
  font-weight: 600;
}

/* products */

.products {
  flex: 1;
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.search-bar button {
  padding: 10px 18px;
  background: #4caf50;
  border: none;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

.search-bar button:hover {
  background: #3e8e41;
}

/* grid */

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: 0.2s;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}

.product-name {
  font-size: 14px;
  color: #555;
}

/* cart */

.cart {
  width: 280px;
  background: white;
  padding: 20px;
  border-left: 1px solid #ddd;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

textarea {
  width: 100%;
  margin-top: 10px;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.total {
  margin-top: 15px;
  font-weight: bold;
}

.pay-btn {
  margin-top: 10px;
  width: 100%;
  padding: 12px;
  background: #4caf50;
  border: none;
  color: white;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.pay-btn:hover {
  background: #3e8e41;
}
</style>
