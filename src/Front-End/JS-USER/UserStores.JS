import { useAuthStore } from "../Authorization/Auth";

const DEFAULT_STORE_ID = 3; // Drip Lab-Indochina Plaza — 241 Xuân Thủy

export default {
  name: "UserStores",

  data() {
    return {
      store: null,
      loading: true,
      error: null,

      avgRating: 0,
      totalReviews: 0,
      ratingBars: { 5: 0, 4: 0, 3: 0 },

      reviews: [],
      allLoaded: false,

      showForm: false,
      newReview: { stars: 0, text: "" },
    };
  },

  computed: {
    storeId() {
      const authStore = useAuthStore();
      const isLoggedIn = !!authStore.user || !!authStore.token;

      if (isLoggedIn) {
        // Logged-in: use the store the customer selected
        return (
          this.$route.query.id ||
          localStorage.getItem("selectedStoreId") ||
          sessionStorage.getItem("selectedStoreId") ||
          DEFAULT_STORE_ID
        );
      }

      // Not logged-in: always show the default store, no error
      return DEFAULT_STORE_ID;
    },

    amenities() {
      if (!this.store?.amenities) return [];
      try {
        return JSON.parse(this.store.amenities);
      } catch {
        return [];
      }
    },

    openHours() {
      if (!this.store) return "";
      return `${this.store.open_time} - ${this.store.close_time}`;
    },
  },

  async mounted() {
    await this.fetchStore();
    await this.fetchReviews();
  },

  methods: {
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

    async fetchReviews() {
      try {
        const res = await fetch(`/api/stores/${this.storeId}/reviews`);
        if (!res.ok) return;
        const data = await res.json();

        this.reviews = data.reviews || [];
        this.totalReviews = data.total || this.reviews.length;
        this.avgRating = data.avg_rating || 0;

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
        this.reviews = [];
      }
    },

    openMaps() {
      const url = this.store?.maps_url;
      if (url) window.open(url, "_blank");
    },

    toggleForm() {
      this.showForm = !this.showForm;
      this.newReview = { stars: 0, text: "" };
    },

    async submitReview() {
      if (!this.newReview.stars || !this.newReview.text.trim()) {
        alert("Vui lòng chọn số sao và nhập nội dung!");
        return;
      }

      const optimisticReview = {
        id: Date.now(),
        initials: "B",
        reviewer_name: "Bạn",
        stars: this.newReview.stars,
        review_date: new Date().toISOString(),
        review_text: this.newReview.text.trim(),
      };

      try {
        await fetch(`/api/stores/${this.storeId}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stars: this.newReview.stars,
            review_text: this.newReview.text.trim(),
          }),
        });
      } catch {
        // optimistic update still applies
      }

      this.reviews.unshift(optimisticReview);
      this.showForm = false;
      this.newReview = { stars: 0, text: "" };
    },

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

    loadMore() {
      this.allLoaded = true;
    },

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