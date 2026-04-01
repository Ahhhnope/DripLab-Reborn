<template>
  <div class="stores-page">

    <!-- ===== ẢNH ĐƠN ===== -->
    <section class="photo-single">
      <div class="photo-bg"
        style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuACiqIMCNghyhx1mxHuryYcVP3lKk_IqXozA7gJ3BbRb7Znx1uaBGTq0f2ILd5hK3MEgScOUbV1bcDkt-NysEDEwAish075vvb06TmJrWz7FIHKeCl8xe-zCw_Uh5QLmT3DknFeb5VHrlXY_C5acuKXWc74sfdhThFkCBFla4f36cdi2uQtVMYw4porXzCqYvjTvKFLxc9rd2C3MO4vXFeW2QDV2-GE8h5hCT3Y_HMvE7unt38cyFhul-BRNT0H98sA5FHApHKSASvl')">
      </div>
    </section>

    <!-- ===== NỘI DUNG: THÔNG TIN + ĐÁNH GIÁ ===== -->
    <section class="detail-section">

      <!-- CỘT TRÁI: Thông tin cửa hàng -->
      <div class="info-col">
        <div class="store-title-block">
          <h2 class="store-name">Drip Lab - Hà Nội</h2>
          <p class="store-sub">Rang Xay Đặc Trưng &amp; Phòng Thử Nghiệm</p>
        </div>

        <div class="info-list">
          <!-- Địa chỉ -->
          <div class="info-item">
            <span class="material-symbols-outlined icon-gold">location_on</span>
            <div>
              <h4 class="info-label">ĐỊA CHỈ</h4>
              <p class="info-text">200 Tô Hiến Thành, Hai Bà Trưng, Hà Nội</p>
            </div>
          </div>

          <!-- Giờ mở cửa -->
          <div class="info-item">
            <span class="material-symbols-outlined icon-gold">schedule</span>
            <div>
              <h4 class="info-label">GIỜ MỞ CỬA</h4>
              <p class="info-text"><span>Thứ 2 - Thứ 6</span><span>7:00 SA - 8:00 CH</span></p>
              <p class="info-text"><span>Thứ 7 - CN</span><span>8:00 SA - 8:00 CH</span></p>
            </div>
          </div>

          <!-- Tiện ích -->
          <div class="info-item">
            <span class="material-symbols-outlined icon-gold">coffee_maker</span>
            <div>
              <h4 class="info-label">TIỆN ÍCH</h4>
              <div class="tag-list">
                <span class="tag">Wi-Fi Miễn Phí</span>
                <span class="tag">Chỗ Ngồi Ngoài Trời</span>
                <span class="tag">Thú Cưng</span>
                <span class="tag">Lớp Latte Art</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Nút chỉ đường -->
        <button class="btn-directions" @click="openMaps">
          <span class="material-symbols-outlined">near_me</span>
          Chỉ Đường
        </button>
      </div>

      <!-- CỘT PHẢI: Đánh giá -->
      <div class="review-col">

        <!-- Dòng tổng điểm -->
        <div class="rating-row">
          <!-- Điểm to + sao + số lượng -->
          <div class="rating-score">
            <div class="score-number">4.8</div>
            <div class="score-stars">
              <span class="material-symbols-outlined star-gold star-filled">star</span>
              <span class="material-symbols-outlined star-gold star-filled">star</span>
              <span class="material-symbols-outlined star-gold star-filled">star</span>
              <span class="material-symbols-outlined star-gold star-filled">star</span>
              <span class="material-symbols-outlined star-gold star-filled">star_half</span>
            </div>
            <p class="score-count">128 ĐÁNH GIÁ</p>
          </div>

          <!-- Đường kẻ dọc ngăn cách -->
          <div class="divider-v"></div>

          <!-- Thanh điểm 5 4 3 -->
          <div class="rating-bars">
            <div class="bar-row">
              <span class="bar-label">5</span>
              <div class="bar-track">
                <div class="bar-fill" style="width:85%"></div>
              </div>
            </div>
            <div class="bar-row">
              <span class="bar-label">4</span>
              <div class="bar-track">
                <div class="bar-fill" style="width:10%"></div>
              </div>
            </div>
            <div class="bar-row">
              <span class="bar-label">3</span>
              <div class="bar-track">
                <div class="bar-fill" style="width:3%"></div>
              </div>
            </div>
          </div>

          <!-- Nút đánh giá góc phải -->
          <button class="btn-rate" @click="toggleForm">
            <span class="material-symbols-outlined">edit</span>
            Đánh Giá Cửa Hàng
          </button>
        </div>

        <!-- Form viết bình luận (ẩn/hiện) -->
        <div v-if="showForm" class="write-review-box">
          <div class="wr-header">
            <h3 class="wr-title">Viết Đánh Giá</h3>
            <div class="wr-stars">
              <span v-for="i in 5" :key="i" class="material-symbols-outlined wr-star"
                :class="{ active: i <= newReview.stars }" @click="newReview.stars = i">star</span>
            </div>
          </div>
          <textarea v-model="newReview.text" class="wr-textarea"
            placeholder="Chia sẻ trải nghiệm của bạn về cà phê và không gian..." rows="3"></textarea>
          <div class="wr-footer">
            <button class="btn-submit" @click="submitReview">Gửi Đánh Giá</button>
          </div>
        </div>

        <!-- Danh sách bình luận -->
        <div class="reviews-list">
          <div v-for="r in reviews" :key="r.id" class="review-item">
            <div class="ri-top">
              <div class="ri-left">
                <div class="ri-avatar">{{ r.initials }}</div>
                <div>
                  <h4 class="ri-name">{{ r.name }}</h4>
                  <div class="ri-stars">
                    <span v-for="i in 5" :key="i" class="material-symbols-outlined ri-star"
                      :class="{ dim: i > r.stars }">star</span>
                  </div>
                </div>
              </div>
              <span class="ri-date">{{ r.date }}</span>
            </div>
            <p class="ri-text">{{ r.text }}</p>
          </div>
        </div>

        <!-- Tải thêm -->
        <button v-if="!allLoaded" class="btn-load-more" @click="loadMore">
          TẢI THÊM ĐÁNH GIÁ
        </button>

      </div>
    </section>

  </div>
</template>

<script src="../JS-USER/UserStores.JS"></script>
<style src="../CSS-USER/UserStores.CSS" scoped></style>