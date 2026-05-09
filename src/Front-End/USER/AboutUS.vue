<template>
  <div class="about-container">

    <!-- HERO -->
    <div class="hero">
      <div class="hero-grid"></div>
      <div class="hero-glow"></div>
      <div class="hero-badge">
        <span class="badge-dot"></span>
        <span class="badge-text">Mới khai trương · 2026</span>
      </div>
      <div class="hero-year">2026</div>
      <div class="hero-content">
        <div class="hero-tag">Câu chuyện thương hiệu</div>
        <h1 class="hero-h1">Chương đầu<br>của <em>một hành trình.</em></h1>
        <p class="hero-sub">
          Drip Lab vừa mở cửa — nhưng tình yêu với cà phê của chúng tôi đã được ủ từ rất lâu.
          Đây là khởi đầu, và chúng tôi rất vui được bắt đầu cùng bạn.
        </p>
        <div class="hero-cta">
          <button class="btn-gold" @click="router.push('/homepage')">Khám phá ngay</button>
          <button class="btn-ghost" @click="router.push('/menu')">Xem thực đơn</button>
        </div>
      </div>
    </div>

    <!-- MARQUEE STRIP -->
    <div class="strip">
      <div class="strip-inner">
        MỚI KHAI TRƯƠNG 2026<span class="strip-dot">·</span>
        ARABICA SINGLE ORIGIN<span class="strip-dot">·</span>
        COLD BREW CRAFT<span class="strip-dot">·</span>
        POUR OVER PRECISION<span class="strip-dot">·</span>
        FRESH START · NEW STORY<span class="strip-dot">·</span>
        DRIP LAB COFFEE<span class="strip-dot">·</span>
        MỚI KHAI TRƯƠNG 2026<span class="strip-dot">·</span>
        ARABICA SINGLE ORIGIN<span class="strip-dot">·</span>
        COLD BREW CRAFT<span class="strip-dot">·</span>
        POUR OVER PRECISION<span class="strip-dot">·</span>
        FRESH START · NEW STORY<span class="strip-dot">·</span>
        DRIP LAB COFFEE<span class="strip-dot">·</span>
      </div>
    </div>

    <!-- INTRO — NEW STORY -->
    <div class="intro">
      <div class="intro-left">
        <div class="section-tag">Câu chuyện của chúng tôi</div>
        <h2 class="intro-h2">Sinh ra từ<br><em>đam mê,</em><br>không phải thói quen</h2>
        <p class="intro-body">
          Drip Lab không đến từ một chuỗi franchise hay một công thức có sẵn.
          Chúng tôi bắt đầu từ câu hỏi đơn giản:
          <em class="highlight">"Tại sao cà phê ngon thường khó tìm?"</em>
          — và quyết định tự tạo ra câu trả lời.
        </p>
      </div>
      <div class="intro-right">
        <div class="fact-item">
          <div class="fact-num">01</div>
          <div class="fact-info">
            <div class="fact-title">Mới 100% — không gánh nặng</div>
            <div class="fact-desc">Chúng tôi không có "cách làm cũ". Mỗi quyết định đều được đưa ra với tư duy tươi mới.</div>
          </div>
        </div>
        <div class="fact-item">
          <div class="fact-num">02</div>
          <div class="fact-info">
            <div class="fact-title">Tập trung chất lượng từ ngày đầu</div>
            <div class="fact-desc">Không cần 5 năm mới để ý đến hạt cà phê — chúng tôi bắt đầu với tiêu chuẩn cao nhất.</div>
          </div>
        </div>
        <div class="fact-item">
          <div class="fact-num">03</div>
          <div class="fact-info">
            <div class="fact-title">Bạn là những người đầu tiên</div>
            <div class="fact-desc">Khách hàng đến với Drip Lab hôm nay là một phần của câu chuyện ngay từ trang đầu tiên.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- VALUES -->
    <div class="vals">
      <div class="vals-header">
        <div class="section-tag">Giá trị cốt lõi</div>
        <h2 class="vals-h2">Chúng tôi tin vào điều gì</h2>
      </div>
      <div class="vals-grid">
        <div class="val-card">
          <span class="val-num">01</span>
          <div class="val-icon">🌿</div>
          <div class="val-title">Nguyên liệu thật sự</div>
          <p class="val-body">Không pha trộn, không giả vị. Hạt cà phê được chọn từ những vùng trồng uy tín, rang tươi mỗi mẻ.</p>
        </div>
        <div class="val-card">
          <span class="val-num">02</span>
          <div class="val-icon">⚡</div>
          <div class="val-title">Năng lượng của người mới</div>
          <p class="val-body">Là tân binh, chúng tôi không ngại thử. Thực đơn luôn được thử nghiệm, cải tiến, và lắng nghe.</p>
        </div>
        <div class="val-card">
          <span class="val-num">03</span>
          <div class="val-icon">🤝</div>
          <div class="val-title">Cộng đồng trước tiên</div>
          <p class="val-body">Từng khách hàng ghé Drip Lab đều góp phần định hình chúng tôi. Feedback của bạn là kim chỉ nam.</p>
        </div>
      </div>
    </div>

    <!-- WHY US -->
    <div class="why">
      <div class="why-left">
        <div class="why-glow"></div>
        <div class="section-tag">Tại sao chọn Drip Lab?</div>
        <h2 class="why-h2">Tân binh<br>nhưng <em>không non kinh nghiệm</em></h2>
        <div class="why-list">
          <div class="why-item">
            <div class="why-check">✓</div>
            <div class="why-text">
              <strong>Đội ngũ được đào tạo bài bản</strong>
              Barista của chúng tôi được huấn luyện theo tiêu chuẩn specialty coffee quốc tế trước ngày mở cửa.
            </div>
          </div>
          <div class="why-item">
            <div class="why-check">✓</div>
            <div class="why-text">
              <strong>Công thức được thử nghiệm kỹ lưỡng</strong>
              Mỗi món trong thực đơn đã trải qua hàng trăm lần pha thử trước khi ra mắt.
            </div>
          </div>
          <div class="why-item">
            <div class="why-check">✓</div>
            <div class="why-text">
              <strong>Không gian được thiết kế có chủ đích</strong>
              Từng góc đều được cân nhắc — để bạn muốn ở lại lâu hơn.
            </div>
          </div>
        </div>
      </div>
      <div class="why-right">
        <div class="section-tag">Tuyên ngôn</div>
        <p class="manifesto">
          "Chúng tôi không cần <em>10 năm lịch sử</em> để biết cách làm cà phê ngon —
          chúng tôi chỉ cần đủ đam mê."
        </p>
        <p class="manifesto-sub">
          Drip Lab ra đời năm 2026 với một cam kết duy nhất: mỗi tách cà phê bạn nhận là
          kết quả của sự chuẩn bị kỹ lưỡng, không phải sự tình cờ.
        </p>
      </div>
    </div>

    <!-- VISION -->
    <div class="vision">
      <div class="section-tag vision-tag">Tầm nhìn · Drip Lab Together!</div>
      <h2 class="vision-h2">Câu chuyện này<br>mới <em>bắt đầu</em></h2>
      <p class="vision-body">
        Năm 2025 là trang đầu tiên. Chúng tôi xây dựng Drip Lab để lớn lên cùng cộng đồng —
        và chặng đường phía trước còn rất dài, rất thú vị.
      </p>
      <div class="vision-cards">
        <div class="vis-card">
          <div class="vis-icon">📍</div>
          <div class="vis-title">Cửa hàng đầu tiên</div>
          <p class="vis-body">Khai trương 2026 tại Hà Nội — điểm xuất phát của mọi chuyện.</p>
        </div>
        <div class="vis-card">
          <div class="vis-icon">📈</div>
          <div class="vis-title">Mục tiêu phía trước</div>
          <p class="vis-body">Mở rộng dần, nhưng không bao giờ đánh đổi chất lượng để lấy tốc độ.</p>
        </div>
        <div class="vis-card">
          <div class="vis-icon">❤️</div>
          <div class="vis-title">Cùng bạn viết tiếp</div>
          <p class="vis-body">Mỗi người ghé Drip Lab là một phần của câu chuyện đang được viết.</p>
        </div>
      </div>
    </div>

    <!-- CTA FOOTER -->
    <div class="cta-footer">
      <div class="cta-ring cta-ring--1"></div>
      <div class="cta-ring cta-ring--2"></div>
      <h2 class="cta-h2">Trở thành<br><em>người đầu tiên</em></h2>
      <p class="cta-sub">Ghé Drip Lab hôm nay — và kể cho bạn bè nghe rằng bạn đã biết từ đầu</p>
      <div class="cta-btns">
        <button class="btn-gold" @click="router.push('/brewing')">Pha chế ngay</button>
        <button class="btn-ghost" @click="router.push('/stores')">Tìm cửa hàng</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
// Không cần import ảnh vì design này dùng CSS thuần
// Nếu muốn thêm ảnh thực tế, import tại đây:
// import heroImg from '../IMG/hero.jpg'
</script>

<style src="../CSS-USER/AboutUS.CSS"></style>