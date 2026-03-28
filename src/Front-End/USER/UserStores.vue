<template>
  <div class="stores-page">

    <!-- ===== LƯỚI ẢNH ===== -->
    <section class="photo-grid">
      <!-- Ảnh lớn trái (chiếm 2 hàng) -->
      <div class="photo-item photo-big">
        <div class="photo-bg"
          style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuACiqIMCNghyhx1mxHuryYcVP3lKk_IqXozA7gJ3BbRb7Znx1uaBGTq0f2ILd5hK3MEgScOUbV1bcDkt-NysEDEwAish075vvb06TmJrWz7FIHKeCl8xe-zCw_Uh5QLmT3DknFeb5VHrlXY_C5acuKXWc74sfdhThFkCBFla4f36cdi2uQtVMYw4porXzCqYvjTvKFLxc9rd2C3MO4vXFeW2QDV2-GE8h5hCT3Y_HMvE7unt38cyFhul-BRNT0H98sA5FHApHKSASvl')">
        </div>
      </div>

      <!-- Ảnh nhỏ trên phải -->
      <div class="photo-item">
        <div class="photo-bg"
          style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQ5L7Po32mSj8zVOrFXqbcsLLiZTLSggn56XvGRzXc9GLOCRLcUekG7cepjE9MwyzELJj_p4ZSQfCgsglHYL_unAnvZjg3jUg8vgz-vEDOPyvY4SgRg06o30XwXVG5TKXomFhhZqsw3QQgC2LG0BWKeVwfE9t2uIUvzVgy8TBOxOun3zi7T0ZAdJ68fgeeui25G9d0pVyUHZhq5usEdLldVCMzNLazgqZ5cXaXumu-VxloVog9mBkglSAqOFKOf-muqArHNGMRIhiH')">
        </div>
      </div>

      <!-- Ảnh nhỏ trên phải 2 -->
      <div class="photo-item">
        <div class="photo-bg"
          style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuB0sA_9dNVPBdE1ieXwfKaEQno3wmpiJpK44_fkSLnCeOZ8_tO53Q5xkuW-NjeVqlnCEsgXnPpeGJX8dTC3H1M9BtyJMUqK3ePhWr4VvMZ-6WUpu9hogG8WmkT7fLufAUISy5QQ4Rks3Nk9_CXYCaJlQhaLNTAse1E3l53-24-5tytFMw_TRSpZWxnQF0qY5EJSuhO6IjHdGlBElmpNsXf_Tc22EjZsmzq7LOUbyaulplX1lv_PzTKXiy9h3oj_7G3R_SjySbGjaA1N')">
        </div>
      </div>

      <!-- Ảnh rộng dưới phải (chiếm 2 cột) -->
      <div class="photo-item photo-wide">
        <div class="photo-bg"
          style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZttY2fDqUalM3AU8m23UAlZz8oOplihStoqiNaKM2PmBCIKkC370YgxtlguTPtWoF8b5vvmXLdts1beCoNeJkwXqKOr2YEqR2zxmlr6c9kgrA6in2yGCytK3_iHvYdm1b4kLIBPKqLfCVy6nADtCHj3QuwSItB0g3Pb3M5Cs2FqDiY_1_o9lHyTFYgr8X55ReUdmPr68ttG6qasd8BoQma4wIhv2t2E6L8JVPxs3G7GVqtXc9CkAMH26YKq3gQ25xNmzGSIeJpuul')">
        </div>
      </div>
    </section>

    <!-- ===== NỘI DUNG: THÔNG TIN + ĐÁNH GIÁ ===== -->
    <section class="detail-section">

      <!-- CỘT TRÁI: Thông tin cửa hàng -->
      <div class="info-col">
        <div class="store-title-block">
          <h2 class="store-name">The Roastery - Soho</h2>
          <p class="store-sub">Signature Roastery &amp; Tasting Room</p>
        </div>

        <div class="info-list">
          <!-- Địa chỉ -->
          <div class="info-item">
            <span class="material-symbols-outlined icon-gold">location_on</span>
            <div>
              <h4 class="info-label">ĐỊA CHỈ</h4>
              <p class="info-text">123 Coffee Lane, New York, NY 10012</p>
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
              <span class="material-symbols-outlined star-gold">star</span>
              <span class="material-symbols-outlined star-gold">star</span>
              <span class="material-symbols-outlined star-gold">star</span>
              <span class="material-symbols-outlined star-gold">star</span>
              <span class="material-symbols-outlined star-gold">star_half</span>
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