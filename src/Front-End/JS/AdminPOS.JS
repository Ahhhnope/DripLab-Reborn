import { ref, computed } from 'vue'

export function useAdminMenu() {
    const activeIndex = ref(1)

    const menuItems = [
        { id: 1, label: 'Quản lý thống kê' },
        { id: 2, label: 'Đơn tại quầy' },
        { id: 3, label: 'Quản lý sản phẩm' },
        { id: 4, label: 'Quản lý tin tức' },
        { id: 5, label: 'Quản lí khuyến mãi' },
    ]

    const setActive = (id) => activeIndex.value = id
    const isActive = (id) => activeIndex.value === id
    const logout = () => alert('Đăng xuất!')

    return { menuItems, setActive, isActive, logout }
}


export function usePOS() {

  const search = ref("");

  const products = ref([
    { id: 1, name: "Classic Latte", price: 35000, img: "/IMG/classic-latte.png" },
    { id: 2, name: "Cortado", price: 40000, img: "/IMG/cortado.png" },
    { id: 3, name: "Flat White", price: 38000, img: "/IMG/flat-white.jpg" },
    { id: 4, name: "Dark Velvet", price: 40000, img: "/IMG/dark-velvet.png" },
    { id: 5, name: "Ethiopia Yirgacheffe", price: 42000, img: "/IMG/ethiopia.png" },
    { id: 6, name: "V60 Seasonal", price: 45000, img: "/IMG/v602.jpg" },
    { id: 7, name: "Colombia Geisha", price: 42000, img: "/IMG/geisha.png" },
    { id: 8, name: "Mocha", price: 35000, img: "/IMG/mocha.jpg" },
    { id: 9, name: "Matcha Latte", price: 50000, img: "/IMG/Matcha-latte.png" },
    { id: 10, name: "Earl Grey Reverse", price: 35000, img: "/IMG/Earl-grey.png" },
    { id: 11, name: "Hojicha Roasted", price: 40000, img: "/IMG/Hojicha-roasted.png" },
    { id: 12, name: "Oolong High Mountain", price: 35000, img: "/IMG/oolong.png" },
  ]);

  const cart = ref([]);

  const filteredProducts = computed(() => {
    return products.value.filter((p) =>
      p.name.toLowerCase().includes(search.value.toLowerCase())
    );
  });

  function searchProduct() {
    // input đã tự filter
  }

  function addToCart(product) {
    const exist = cart.value.find((i) => i.id === product.id);

    if (exist) {
      exist.qty++;
    } else {
      cart.value.push({
        ...product,
        qty: 1,
      });
    }
  }

  const total = computed(() => {
    return cart.value.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
  });

  return {
    search,
    products,
    cart,
    filteredProducts,
    searchProduct,
    addToCart,
    total,
  };
}