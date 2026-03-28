export default {
  name: "UserStores",

  data() {
    return {
      showForm: false,
      allLoaded: false,
      newReview: { stars: 0, text: "" },

      reviews: [
        {
          id: 1,
          initials: "JS",
          name: "James Sutherland",
          stars: 5,
          date: "2 ngày trước",
          text: "Không khí ở đây tuyệt vời. Tôi đặc biệt thích ly pour-over từ cà phê Ethiopia single-origin. Nhân viên rất chuyên nghiệp và am hiểu về cà phê. Góc yên tĩnh lý tưởng để đọc sách buổi sáng.",
        },
        {
          id: 2,
          initials: "EM",
          name: "Elena Martinez",
          stars: 4,
          date: "1 tuần trước",
          text: "Latte art đẹp lắm! Hơi đông vào cuối tuần nhưng chờ xứng đáng vì chất lượng rang xay rất tốt. Tôi gợi ý dòng blend đặc trưng của Soho nếu bạn thích vị bùi bùi.",
        },
        {
          id: 3,
          initials: "DK",
          name: "David Kim",
          stars: 5,
          date: "2 tuần trước",
          text: "Cold brew ngon nhất khu vực, không chỗ nào bì được. Thiết kế industrial chic rất thu hút. Tôi hay ngồi ở dãy ghế cạnh cửa sổ để ngắm phố.",
        },
      ],
    };
  },

  methods: {
    // Mở Google Maps — thay link bằng địa chỉ thật
    openMaps() {
      window.open(
        "https://www.google.com/maps/search/?api=1&query=123+Coffee+Lane+New+York+NY+10012",
        "_blank"
      );
    },

    // Hiện / ẩn form viết bình luận
    toggleForm() {
      this.showForm = !this.showForm;
      this.newReview = { stars: 0, text: "" };
    },

    // Gửi bình luận mới
    submitReview() {
      if (!this.newReview.stars || !this.newReview.text.trim()) {
        alert("Vui lòng chọn số sao và nhập nội dung!");
        return;
      }
      this.reviews.unshift({
        id: Date.now(),
        initials: "B",
        name: "Bạn",
        stars: this.newReview.stars,
        date: "Vừa xong",
        text: this.newReview.text.trim(),
      });
      this.showForm = false;
      this.newReview = { stars: 0, text: "" };
    },

    // Tải thêm bình luận
    loadMore() {
      this.allLoaded = true;
    },
  },
};