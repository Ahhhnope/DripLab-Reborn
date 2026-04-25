<template>
  <div class="stores-page">

    <!-- ===== LOADING STATE ===== -->
    <div v-if="loading" class="us-loading">
      <span class="us-spinner"></span>
      <p>Đang tải thông tin cửa hàng...</p>
    </div>

    <!-- ===== ERROR STATE (SQL không chạy / API lỗi) ===== -->
    <div v-else-if="error || !store" class="us-error">
      <p>{{ error || 'Không tìm thấy thông tin cửa hàng.' }}</p>
      <button class="us-back-btn" @click="$router.back()">← Quay lại</button>
    </div>

    <!-- ===== NỘI DUNG CHÍNH ===== -->
    <template v-else>

      <!-- ===== ẢNH CỬA HÀNG (từ SQL image_url) ===== -->
      <section class="photo-single">
        <div class="photo-bg">
          <img :src="`${store.image_url}`"/>
        </div>
      </section>

      <!-- ===== NỘI DUNG: THÔNG TIN + ĐÁNH GIÁ ===== -->
      <section class="detail-section">

        <!-- CỘT TRÁI: Thông tin cửa hàng -->
        <div class="info-col">
          <div class="store-title-block">
            <h2 class="store-name">{{ store.code }}</h2>
            <p class="store-sub">Rang Xay Đặc Trưng &amp; Phòng Thử Nghiệm</p>
          </div>

          <div class="info-list">
            <!-- Địa chỉ -->
            <div class="info-item">
              <span class="material-symbols-outlined icon-gold">location_on</span>
              <div>
                <h4 class="info-label">ĐỊA CHỈ</h4>
                <p class="info-text">{{ store.address }}</p>
              </div>
            </div>

            <!-- Giờ mở cửa -->
            <div class="info-item">
              <span class="material-symbols-outlined icon-gold">schedule</span>
              <div>
                <h4 class="info-label">GIỜ MỞ CỬA</h4>
                <p class="info-text">
                  <span>Hằng ngày</span>
                  <span>{{ store.open_time }} - {{ store.close_time }}</span>
                </p>
              </div>
            </div>

            <!-- Tiện ích (từ SQL amenities JSON) -->
            <div class="info-item" v-if="amenities.length">
              <span class="material-symbols-outlined icon-gold">coffee_maker</span>
              <div>
                <h4 class="info-label">TIỆN ÍCH</h4>
                <div class="tag-list">
                  <span v-for="(tag, i) in amenities" :key="i" class="tag">{{ tag }}</span>
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
              <div class="score-number">{{ avgRating ? avgRating.toFixed(1) : '—' }}</div>
              <div class="score-stars">
                <template v-for="i in 5" :key="i">
                  <span
                    class="material-symbols-outlined star-gold"
                    :class="getStarClass(i, avgRating)"
                  >{{ getStarIcon(i, avgRating) }}</span>
                </template>
              </div>
              <p class="score-count">{{ totalReviews }} ĐÁNH GIÁ</p>
            </div>

            <div class="divider-v"></div>

            <!-- Thanh điểm 5 4 3 -->
            <div class="rating-bars">
              <div v-for="star in [5, 4, 3]" :key="star" class="bar-row">
                <span class="bar-label">{{ star }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: ratingBars[star] + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Nút đánh giá -->
            <button class="btn-rate" @click="toggleForm">
              <span class="material-symbols-outlined">edit</span>
              Đánh Giá Cửa Hàng
            </button>
          </div>

          <!-- Form viết bình luận -->
          <div v-if="showForm" class="write-review-box">
            <div class="wr-header">
              <h3 class="wr-title">Viết Đánh Giá</h3>
              <div class="wr-stars">
                <span
                  v-for="i in 5" :key="i"
                  class="material-symbols-outlined wr-star"
                  :class="{ active: i <= newReview.stars }"
                  @click="newReview.stars = i"
                >star</span>
              </div>
            </div>
            <textarea
              v-model="newReview.text"
              class="wr-textarea"
              placeholder="Chia sẻ trải nghiệm của bạn về cà phê và không gian..."
              rows="3"
            ></textarea>
            <div class="wr-footer">
              <button class="btn-submit" @click="submitReview">Gửi Đánh Giá</button>
            </div>
          </div>

          <!-- Danh sách bình luận (từ SQL store_reviews) -->
          <div v-if="reviews.length" class="reviews-list">
            <div v-for="r in reviews" :key="r.id" class="review-item">
              <div class="ri-top">
                <div class="ri-left">
                  <div class="ri-avatar">{{ r.initials }}</div>
                  <div>
                    <h4 class="ri-name">{{ r.reviewer_name }}</h4>
                    <div class="ri-stars">
                      <span
                        v-for="i in 5" :key="i"
                        class="material-symbols-outlined ri-star"
                        :class="{ dim: i > r.stars }"
                      >star</span>
                    </div>
                  </div>
                </div>
                <span class="ri-date">{{ formatDate(r.review_date) }}</span>
              </div>
              <p class="ri-text">{{ r.review_text }}</p>
            </div>
          </div>

          <!-- Không có reviews khi SQL chưa có dữ liệu -->
          <div v-else class="us-no-reviews">
            Chưa có đánh giá nào. Hãy là người đầu tiên!
          </div>

          <!-- Tải thêm -->
          <button v-if="!allLoaded && reviews.length >= 5" class="btn-load-more" @click="loadMore">
            TẢI THÊM ĐÁNH GIÁ
          </button>

        </div>
      </section>

    </template>
  </div>
</template>

<script src="../JS-USER/UserStores.JS"></script>
<style src="../CSS-USER/UserStores.CSS" scoped></style>