<template>
  <div class="pos-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <h2 class="logo">ADMIN</h2>

      <ul>
        <li>Bảng quản trị</li>
        <li class="active">Đơn tại quầy</li>
        <li>Quản lý đơn hàng</li>
        <li>Quản lý bàn</li>
        <li>Quản lý sản phẩm</li>
        <li>Quản lý khuyến mãi</li>
      </ul>
    </aside>

    <!-- Sản Phẩm -->
    <main class="products">
      <div class="search-bar">
        <input type="text" placeholder="Tìm sản phẩm..." />
        <button>Tìm kiếm</button>
      </div>

      <div class="product-grid">
        <div class="product-card" v-for="i in 6" :key="i">
          <div class="product-img"></div>
          <p>Tên sản phẩm</p>
        </div>
      </div>
    </main>

    <!-- Giỏ hàng -->
    <aside class="cart">
      <h3>Sản phẩm đã gọi</h3>

      <div class="cart-item">
        <span>SP 1</span>
        <span>x1</span>
      </div>

      <div class="cart-item">
        <span>SP 2</span>
        <span>x2</span>
      </div>

      <div class="cart-item">
        <span>SP 3</span>
        <span>x3</span>
      </div>

      <textarea placeholder="Ghi chú..."></textarea>

      <div class="total">Thành tiền: <strong>0 VND</strong></div>

      <button class="pay-btn">Thanh toán</button>
    </aside>
  </div>
</template>

<style scoped>
/*=============== GOOGLE FONTS ===============*/
@import url("https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600;700;800;900&display=swap");

/*=============== CSS VARIABLES ===============*/
:root {
  /* Color Palette - LIGHT MODE */
  --first-color: #b8906a;
  --first-color-alt: #a17d59;
  --hover-color: hsl(0, 0%, 95%);
  --title-color: #5c4033;
  --text-color: #999;
  --white-color: hsl(0, 0%, 100%);
  --border-color: #e0e0e0;
  --body-color: #f5f5f0;
  --header-bg: rgba(248, 248, 246, 0.85);
  --header-text: #3d2b1f;
  --footer-bg: #3d2b1f;
  --footer-text: #f5f5f0;
  --primary: #3b5e4a;
  --accent-gold: #c79a5e;
  --dark-brown: #3d2b1f;
  --background-light: #f8f8f6;

  /* Typography */
  --body-font: "Epilogue", sans-serif;
  --second-font: "Epilogue", sans-serif;
  --header-font: "Epilogue", sans-serif;
  
  /* Font Sizes */
  --bigger-font-size: 1.5rem;
  --normal-font-size: .938rem;
  --small-font-size: .875rem;

  /* Font Weights */
  --font-regular: 400;
  --font-semi-bold: 600;
  --font-black: 900;
}

/*=============== DARK MODE VARIABLES ===============*/
html.dark {
  /* Body, Header, Footer đổi màu theo theme */
  --body-color: #1a1714;
  --background-light: #1a1714;
  --title-color: #f5f5f0;
  --text-color: #c0c0c0;
  --border-color: #3d2b1f;
  --white-color: #2a2520;
  --header-bg: rgba(26, 23, 20, 0.85);
  --header-text: #f5f5f0;
  --footer-bg: #1a1714;
  --footer-text: #e0e0e0;
}

/*=============== RESPONSIVE TYPOGRAPHY ===============*/
@media screen and (min-width: 1150px) {
  :root {
    --bigger-font-size: 1.75rem;
    --normal-font-size: 1rem;
    --small-font-size: .938rem;
  }
}

/*=============== BASE RESET ===============*/
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}   

body {
  background: var(--body-color);
  font-family: var(--body-font);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/*=============== REUSABLE CLASSES ===============*/
.grid {
  display: grid;
  gap: 1.5rem;
}

input,
button {
  border: none;
  outline: none;
  font-family: var(--body-font);
  font-size: var(--normal-font-size);
}

a {
  text-decoration: none;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}
.main-content {
  margin-top: 70px;
  min-height: calc(100vh - 70px - 300px);
  padding: 0;
}

.content-container {
  width:100%;
  max-width:none;
  margin:0;
  padding:0;
}

.content-container h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--title-color);
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.content-container p {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-color);
  transition: color 0.3s ease;
}
.pos-container {
  display:flex;
  width:100%;
  min-height:calc(100vh - 70px);
}

/* sidebar */

.sidebar {
  width: 240px;
  background: #744409;
  color: white;
  padding: 20px;
}

.logo {
  text-align: center;
  margin-bottom: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 6px;
}

.sidebar li:hover {
  background: #3a3a5a;
}

.active {
  background: #4caf50;
}

/* sản phẩm */

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
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.search-bar button {
  padding: 8px 15px;
  background: #4caf50;
  border: none;
  color: white;
  border-radius: 6px;
}

.product-grid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap:20px;
}

.product-card {
  background: white;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-img {
  height: 90px;
  background: #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
}

/* giỏ hàng */

.cart {
  width: 300px;
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
  font-size: 16px;
}

.pay-btn {
  margin-top: 10px;
  width: 100%;
  padding: 10px;
  background: #4caf50;
  border: none;
  color: white;
  border-radius: 6px;
  font-weight: bold;
}
</style>
