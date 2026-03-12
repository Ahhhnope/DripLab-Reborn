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

/* POS CUSTOM DRINK */

export function usePOS(){

  const search = ref("")
  const step = ref(1)
  const cart = ref([])

  const selected = ref({
    bean:null,
    base:null,
    milk:null,
    topping:null
  })

  /* popup */

  const showBeanPopup = ref(false)
  const showBasePopup = ref(false)
  const showMilkPopup = ref(false)
  const showToppingPopup = ref(false)

  /* PRODUCTS */

  const beans = [
    { name:"Robusta", price:12000, img:"/IMG/robusta.jpg" },
    { name:"Arabica", price:15000, img:"/IMG/arabica.png" },
    { name:"Culi", price:18000, img:"/IMG/culi.jpg" },
    { name:"Moka", price:20000, img:"/IMG/moka.jpg" }
  ]

  const bases = [
    { name:"Espresso (pha máy)", price:10000, img:"/IMG/espresso.jpg" },
    { name:"Cold Brew (ủ)", price:12000, img:"/IMG/coldbrew.jpg" },
    { name:"Pour Over (nhỏ giọt)", price:15000, img:"/IMG/pourover.jpg" }
  ]

  const milks = [
    { name:"Sữa tươi", price:7000, img:"/IMG/suatuoi.jpg" },
    { name:"Sữa hạt", price:9000, img:"/IMG/suahạt.jpg" },
    { name:"Sữa kem béo", price:10000, img:"/IMG/kembeo.jpg" },
    { name:"Sữa đặc", price:5000, img:"/IMG/suadac.jpg" }
  ]

  const toppings = [
    { name:"Trân châu đen", price:5000, img:"/IMG/tranchau.jpg" },
    { name:"Thạch cà phê", price:6000, img:"/IMG/thachcf.jpg" },
    { name:"Kem cheese", price:8000, img:"/IMG/creamcheese.jpg" },
    { name:"Pudding trứng", price:7000, img:"/IMG/pudding.jpg" },
    { name:"Kem béo", price:6000, img:"/IMG/kembeo.jpg" },
    { name:"Machiato", price:7000, img:"/IMG/machiato.jpg" },
    { name:"Whipping cream", price:8000, img:"/IMG/whipping.jpg" }
  ]

  /* open popup */

  function openBean(){
    showBeanPopup.value=true
  }

  function openBase(){
    if(step.value<2) return
    showBasePopup.value=true
  }

  function openMilk(){
    if(step.value<3) return
    showMilkPopup.value=true
  }

  function openTopping(){
    if(step.value<4) return
    showToppingPopup.value=true
  }

  /* select */

  function selectBean(b){
    selected.value.bean=b
    step.value=2
    showBeanPopup.value=false
  }

  function selectBase(b){
    selected.value.base=b
    step.value=3
    showBasePopup.value=false
  }

  function selectMilk(m){
    selected.value.milk=m
    step.value=4
    showMilkPopup.value=false
  }

  function selectTopping(t){
    selected.value.topping=t
    showToppingPopup.value=false
    addToCart()
  }

  /* CART */

  function addToCart(){

    const item = {
      id: Date.now(),

      name:
        selected.value.bean.name+" + "+
        selected.value.base.name+" + "+
        selected.value.milk.name+" + "+
        selected.value.topping.name,

      qty:1,

      price:
        selected.value.bean.price +
        selected.value.base.price +
        selected.value.milk.price +
        selected.value.topping.price
    }

    cart.value.push(item)

    selected.value={
      bean:null,
      base:null,
      milk:null,
      topping:null
    }

    step.value=1
  }

  /* TOTAL */

  const total = computed(()=>{
    return cart.value.reduce((sum,item)=>{
      return sum + item.price * item.qty
    },0)
  })

  function searchProduct(){}

  return{
    search,
    step,
    selected,
    cart,

    beans,
    bases,
    milks,
    toppings,

    showBeanPopup,
    showBasePopup,
    showMilkPopup,
    showToppingPopup,

    openBean,
    openBase,
    openMilk,
    openTopping,

    selectBean,
    selectBase,
    selectMilk,
    selectTopping,

    total,
    searchProduct
  }
}