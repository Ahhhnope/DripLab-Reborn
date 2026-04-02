<template>
  <div class="about-container">

    <!-- HERO SECTION -->
    <div class="about-hero">
      <img :src="heroImg" class="about-hero__img" alt="Drip Lab Coffee" />
      <div class="about-hero__overlay">
        <p class="about-hero__label">Thông tin về chúng tôi</p>
        <h1 class="about-hero__title">CÂU CHUYỆN THƯƠNG HIỆU</h1>
      </div>
    </div>

    <!-- PHILOSOPHY SECTION -->
    <div class="about-philosophy">
      <h2 class="about-philosophy__title">TRIẾT LÝ CÀ PHÊ HIỆN ĐẠI</h2>
      <p class="about-philosophy__text">
        Tại Drip Lab - Coffee, chúng tôi áp dụng phương pháp sáng tạo tái hiện nét đẹp của cà phê truyền thống,
        khơi tạo nên một nền văn hóa cà phê hiện đại. Được pha chế từ hạt cà phê nguyên chất với cam kết vì trải nghiệm,
        chúng tôi mang đến hành trình thưởng thức theo hướng kết nối tinh hoa di sản với khẩu vị hiện đại.
      </p>
    </div>

    <!-- HERITAGE SECTION -->
    <div class="about-heritage">
      <img :src="heritageImg" class="about-heritage__img" alt="Di sản cà phê" />
      <div class="about-heritage__content">
        <h2 class="about-heritage__title">DI SẢN TOÀN CẦU</h2>
        <p class="about-heritage__text">
          Cửa hàng Drip Lab - Coffee đầu tiên khai trương tại Việt Nam với tầm nhìn mang lại
          một trải nghiệm cà phê hoàn toàn mới. Lấy cảm hứng từ văn hóa cà phê đặc sắc,
          Drip Lab dần mở rộng dấu ấn của mình, trở thành một trong những thương hiệu
          cà phê sáng tạo hàng đầu.
        </p>
      </div>
    </div>

    <!-- VISION SECTION -->
    <div class="about-vision">
      <div class="about-vision__content">
        <h2 class="about-vision__title">TẦM NHÌN THƯƠNG HIỆU</h2>
        <p class="about-vision__subtitle">DRIP LAB TOGETHER!</p>
      </div>
      <img :src="visionImg" class="about-vision__img" alt="Tầm nhìn Drip Lab" />
    </div>

    <!-- GOAL SECTION -->
    <div class="about-goal">
      <img :src="goalImg" class="about-goal__img" alt="Mục tiêu Drip Lab" />
      <div class="about-goal__overlay">
        <h2 class="about-goal__title">MỤC TIÊU</h2>
        <p class="about-goal__text">
          Phục vụ những người yêu cà phê tại khắp nơi,<br />
          tạo ra hàng nghìn cơ hội trải nghiệm sáng tạo,<br />
          và cung cấp hàng triệu ly cà phê mỗi năm.
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useAboutUS } from '../JS-USER/AboutUS.js'
const { heroImg, heritageImg, visionImg, goalImg } = useAboutUS()
</script>

<style src="../CSS-USER/AboutUS.css"></style>