/**
 * useAboutUS — Composable cho trang About Us
 * Drip Lab Coffee · 2025
 *
 * Hiện tại không dùng ảnh thật (design dùng CSS thuần).
 * Khi có ảnh thực tế, import vào đây và export ra.
 */
export function useAboutUS() {

  // ─── NỘI DUNG VĂN BẢN ─────────────────────────────────────────────
  const brand = {
    name: 'Drip Lab',
    tagline: 'Nghệ thuật trong mỗi giọt.',
    founded: 2026,
    location: 'Hà Nội',
  }

  const heroContent = {
    label: 'Câu chuyện thương hiệu',
    title: 'Chương đầu của một hành trình.',
    titleEm: 'một hành trình.',
    sub: 'Drip Lab vừa mở cửa — nhưng tình yêu với cà phê của chúng tôi đã được ủ từ rất lâu. Đây là khởi đầu, và chúng tôi rất vui được bắt đầu cùng bạn.',
  }

  const introFacts = [
    {
      num: '01',
      title: 'Mới 100% — không gánh nặng',
      desc: 'Chúng tôi không có "cách làm cũ". Mỗi quyết định đều được đưa ra với tư duy tươi mới.',
    },
    {
      num: '02',
      title: 'Tập trung chất lượng từ ngày đầu',
      desc: 'Không cần 5 năm mới để ý đến hạt cà phê — chúng tôi bắt đầu với tiêu chuẩn cao nhất.',
    },
    {
      num: '03',
      title: 'Bạn là những người đầu tiên',
      desc: 'Khách hàng đến với Drip Lab hôm nay là một phần của câu chuyện ngay từ trang đầu tiên.',
    },
  ]

  const values = [
    {
      num: '01',
      icon: '🌿',
      title: 'Nguyên liệu thật sự',
      body: 'Không pha trộn, không giả vị. Hạt cà phê được chọn từ những vùng trồng uy tín, rang tươi mỗi mẻ.',
    },
    {
      num: '02',
      icon: '⚡',
      title: 'Năng lượng của người mới',
      body: 'Là tân binh, chúng tôi không ngại thử. Thực đơn luôn được thử nghiệm, cải tiến, và lắng nghe.',
    },
    {
      num: '03',
      icon: '🤝',
      title: 'Cộng đồng trước tiên',
      body: 'Từng khách hàng ghé Drip Lab đều góp phần định hình chúng tôi. Feedback của bạn là kim chỉ nam.',
    },
  ]

  const whyItems = [
    {
      title: 'Đội ngũ được đào tạo bài bản',
      desc: 'Barista của chúng tôi được huấn luyện theo tiêu chuẩn specialty coffee quốc tế trước ngày mở cửa.',
    },
    {
      title: 'Công thức được thử nghiệm kỹ lưỡng',
      desc: 'Mỗi món trong thực đơn đã trải qua hàng trăm lần pha thử trước khi ra mắt.',
    },
    {
      title: 'Không gian được thiết kế có chủ đích',
      desc: 'Từng góc đều được cân nhắc — để bạn muốn ở lại lâu hơn.',
    },
  ]

  const manifesto = {
    quote: '"Chúng tôi không cần 10 năm lịch sử để biết cách làm cà phê ngon — chúng tôi chỉ cần đủ đam mê."',
    em: '10 năm lịch sử',
    sub: 'Drip Lab ra đời năm 2026 với một cam kết duy nhất: mỗi tách cà phê bạn nhận là kết quả của sự chuẩn bị kỹ lưỡng, không phải sự tình cờ.',
  }

  const visionCards = [
    {
      icon: '📍',
      title: 'Cửa hàng đầu tiên',
      body: 'Khai trương 2026 tại Hà Nội — điểm xuất phát của mọi chuyện.',
    },
    {
      icon: '📈',
      title: 'Mục tiêu phía trước',
      body: 'Mở rộng dần, nhưng không bao giờ đánh đổi chất lượng để lấy tốc độ.',
    },
    {
      icon: '❤️',
      title: 'Cùng bạn viết tiếp',
      body: 'Mỗi người ghé Drip Lab là một phần của câu chuyện đang được viết.',
    },
  ]

  // ─── ẢNH (thêm vào khi có ảnh thực tế) ───────────────────────────
  // Uncomment và import ảnh thực tế khi sẵn sàng:
  //
  // import heroImg     from '../IMG/about_hero.jpg'
  // import interiorImg from '../IMG/about_interior.jpg'
  //
  // const heroImg     = heroImg
  // const interiorImg = interiorImg

  // ─── MARQUEE TEXT ─────────────────────────────────────────────────
  const marqueeItems = [
    'MỚI KHAI TRƯƠNG 2026',
    'ARABICA SINGLE ORIGIN',
    'COLD BREW CRAFT',
    'POUR OVER PRECISION',
    'FRESH START · NEW STORY',
    'DRIP LAB COFFEE',
  ]

  return {
    brand,
    heroContent,
    introFacts,
    values,
    whyItems,
    manifesto,
    visionCards,
    marqueeItems,
  }
}