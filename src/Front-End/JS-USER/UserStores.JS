export default {
  name: "UserStores",

  data() {
    return {
      // Dữ liệu cửa hàng từ SQL
      store: null,
      loading: true,
      error: null,

      // Rating tổng hợp
      avgRating: 0,
      totalReviews: 0,
      ratingBars: { 5: 0, 4: 0, 3: 0 }, // phần trăm

      // Reviews
      reviews: [],
      allLoaded: false,

      // Form đánh giá
      showForm: false,
      newReview: { stars: 0, text: "" },
    };
  },

  computed: {
    // store_id lấy từ query param ?id=1
    storeId() {
      return this.$route.query.id || null;
    },

    // Parse amenities từ JSON string
    amenities() {
      if (!this.store?.amenities) return [];
      try {
        return JSON.parse(this.store.amenities);
      } catch {
        return [];
      }
    },

    // Giờ mở cửa dạng "HH:MM - HH:MM"
    openHours() {
      if (!this.store) return "";
      return `${this.store.open_time} - ${this.store.close_time}`;
    },
  },

  async mounted() {
    if (!this.storeId) {
      this.error = "Không tìm thấy thông tin cửa hàng.";
      this.loading = false;
      return;
    }
    await this.fetchStore();
    await this.fetchReviews();
  },

  methods: {
    // Fetch thông tin cửa hàng từ API
    async fetchStore() {
      try {
        const res = await fetch(`/api/stores/${this.storeId}`);
        if (!res.ok) throw new Error("Không tải được dữ liệu cửa hàng");
        const data = await res.json();
        this.store = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    // Fetch danh sách đánh giá từ API
    async fetchReviews() {
      try {
        const res = await fetch(`/api/stores/${this.storeId}/reviews`);
        if (!res.ok) return;
        const data = await res.json();

        this.reviews = data.reviews || [];
        this.totalReviews = data.total || this.reviews.length;
        this.avgRating = data.avg_rating || 0;

        // Tính phần trăm từng sao
        const counts = { 5: 0, 4: 0, 3: 0 };
        this.reviews.forEach((r) => {
          if (r.stars >= 3 && r.stars <= 5) counts[r.stars]++;
        });
        const total = this.reviews.length || 1;
        this.ratingBars = {
          5: Math.round((counts[5] / total) * 100),
          4: Math.round((counts[4] / total) * 100),
          3: Math.round((counts[3] / total) * 100),
        };
      } catch {
        // Nếu API lỗi, không hiện reviews
        this.reviews = [];
      }
    },

    // Mở Google Maps
    openMaps() {
      const url = this.store?.maps_url;
      if (url) window.open(url, "_blank");
    },

    // Hiện / ẩn form đánh giá
    toggleForm() {
      this.showForm = !this.showForm;
      this.newReview = { stars: 0, text: "" };
    },

    // Gửi đánh giá lên API (POST) rồi reload
    async submitReview() {
      if (!this.newReview.stars || !this.newReview.text.trim()) {
        alert("Vui lòng chọn số sao và nhập nội dung!");
        return;
      }

      try {
        const res = await fetch(`/api/stores/${this.storeId}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stars: this.newReview.stars,
            review_text: this.newReview.text.trim(),
          }),
        });

        if (res.ok) {
          // Thêm tạm vào đầu danh sách (optimistic update)
          this.reviews.unshift({
            id: Date.now(),
            initials: "B",
            reviewer_name: "Bạn",
            stars: this.newReview.stars,
            review_date: new Date().toISOString(),
            review_text: this.newReview.text.trim(),
          });
        } else {
          // Nếu API chưa sẵn sàng, vẫn hiện optimistic
          this.reviews.unshift({
            id: Date.now(),
            initials: "B",
            reviewer_name: "Bạn",
            stars: this.newReview.stars,
            review_date: new Date().toISOString(),
            review_text: this.newReview.text.trim(),
          });
        }
      } catch {
        // Offline fallback
        this.reviews.unshift({
          id: Date.now(),
          initials: "B",
          reviewer_name: "Bạn",
          stars: this.newReview.stars,
          review_date: new Date().toISOString(),
          review_text: this.newReview.text.trim(),
        });
      }

      this.showForm = false;
      this.newReview = { stars: 0, text: "" };
    },

    // ──────────────────────────────────────────
    // Format ngày đánh giá
    // ──────────────────────────────────────────
    formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Hôm nay";
      if (diffDays === 1) return "1 ngày trước";
      if (diffDays < 7) return `${diffDays} ngày trước`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
      return `${Math.floor(diffDays / 30)} tháng trước`;
    },

    // Tải thêm (placeholder)
    loadMore() {
      this.allLoaded = true;
    },

    // ──────────────────────────────────────────
    // Hiển thị icon ngôi sao dựa trên rating
    // ──────────────────────────────────────────
    getStarIcon(index, rating) {
      if (index <= Math.floor(rating)) return "star";
      if (index === Math.ceil(rating) && rating % 1 >= 0.5) return "star_half";
      return "star_border";
    },

    getStarClass(index, rating) {
      return {
        "star-filled": index <= Math.floor(rating),
        "star-half-filled": index === Math.ceil(rating) && rating % 1 >= 0.5,
      };
    },
  },
};