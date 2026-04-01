<template>
  <div class="about-container">
    <!-- SECTION 1 -->
    <div class="about-top">
      <h2 class="section-label">Thông tin về chúng tôi</h2>

      <div class="about-image">
        <img :src="aboutTopImg" />
      </div>

      <h1 class="philosophy-title">Triết Lý Drip Lab</h1>

      <p class="philosophy-text">
        Drip Lab là nơi cà phê gặp gỡ sự sáng tạo và cá tính. Đây là nền tảng duy nhất
        cho phép bạn tự tạo đồ uống theo phong cách riêng, pha trộn hương vị theo cách
        của bạn và tạo nên một trải nghiệm hoàn toàn khác biệt. Không menu nhàm chán,
        chỉ có gu của bạn. ☕🔥
      </p>
    </div>

    <!-- SECTION 2 -->
    <div class="about-bottom">
      <div class="about-bottom-left">
        <img :src="aboutBottomImg" />
      </div>

      <div class="about-bottom-right">
        <h2>Thông tin về chúng tôi</h2>

        <p>
          Drip Lab là nền tảng cà phê hiện đại dành cho giới trẻ yêu thích sáng tạo,
          phong cách và trải nghiệm độc đáo. Không chỉ là nơi đặt đồ uống, Drip Lab còn
          là không gian nơi mỗi ly cà phê thể hiện cá tính riêng của bạn.
        </p>

        <p v-if="showFull">
          Từ những hương vị cà phê đậm đà đến các loại topping đa dạng, tất cả đều được
          thiết kế để phù hợp với phong cách sống năng động. Điểm khác biệt lớn nhất của
          Drip Lab là khả năng tùy chỉnh đồ uống theo ý thích.

          Bạn có thể tự chọn nguyên liệu, điều chỉnh tỉ lệ và thử nghiệm nhiều cách pha
          chế khác nhau để tạo ra ly cà phê hoàn hảo nhất.

          Với Drip Lab, uống cà phê không chỉ là thưởng thức mà còn là trải nghiệm sáng tạo.
        </p>

        <span class="read-more" @click="toggleText">
          {{ showFull ? 'Thu gọn' : 'Đọc thêm' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAboutUS } from '../JS-USER/AboutUS.js'
const { showFull, toggleText, aboutTopImg, aboutBottomImg } = useAboutUS()
</script>

<style src="../CSS-USER/AboutUS.css"></style>