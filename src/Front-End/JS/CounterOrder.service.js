// import { ref, computed, onMounted } from "vue";
// import api from "../../api/axios";
// import { useCartStore } from "../../stores/cart";

// export function useCounterOrder() {
//     const cartStore = useCartStore();

//     // --- Data State ---
//     const drinks = ref([]);
//     const toppings = ref([]);
//     const searchText = ref('');
//     const selectedSize = ref(1);
//     const posUserId = 2; 

//     // --- UI & Modal State ---
//     const showPopup = ref(false);
//     const selectedDrink = ref(null);
//     const selectedToppingIds = ref([]);
//     const quantity = ref(1);
//     const showOrderScreen = ref(false); // Set to false so products show immediately

//     // --- Payment & Success State ---
//     const showPaymentPopup = ref(false);
//     const showSuccessPopup = ref(false);
//     const paymentMethod = ref('cash');
//     const customerMoney = ref('');
//     const txId = ref('');
//     const txTime = ref('');

//     // --- MoMo Simulation State (Keep these for the UI) ---
//     const momoPhone = ref('');
//     const momoName = ref('');
//     const momoStep = ref(1);
//     const momoError = ref('');
//     const momoLoading = ref(false);

//     onMounted(async () => {
//         try {
//             const [drinkRes, toppingRes] = await Promise.all([
//                 api.get('/drinks'),
//                 api.get('/ingredients/toppings')
//             ]);
//             drinks.value = drinkRes.data;
//             toppings.value = toppingRes.data;
//             await cartStore.fetchUserCart(posUserId);
//         } catch (error) {
//             console.error("Backend Connection Failed:", error);
//         }
//     });

//     // --- Computed Logic ---

//     // THE tears of white extracted from api
//     const products = computed(() => {
//         if (!searchText.value.trim()) return drinks.value;
//         return drinks.value.filter(d => 
//             d.name.toLowerCase().includes(searchText.value.toLowerCase())
//         );
//     });

//     // THE THING IN THE CART
//     const orderedItems = computed(() => {
//     return cartStore.items.map(item => {
//         const base = item.drink.basePrice || 0;
        
//         const sizeExtra = item.size ? item.size.price : 0;
        
//         //sum up all selected toppings
//         const toppingTotal = item.toppings ? item.toppings.reduce((sum, t) => sum + (t.topping.price || 0), 0) : 0;

//         return {
//             id: item.id,
//             name: item.drink.name,
//             qty: item.quantity,
//             // This is the individual price per 1 unit
//             price: base + sizeExtra + toppingTotal, 
//             size: item.size ? item.size.name : "S",
//             toppings: item.toppings && item.toppings.length > 0 ? item.toppings.map(t => t.topping.name).join(", ") : "Không có"
//         };
//     });
// });

//     const totalPrice = computed(() => cartStore.totalPrice);
//     const finalPrice = computed(() => totalPrice.value); // Add discount logic here later if needed

//     const changeAmount = computed(() => {
//         const paid = parseInt(customerMoney.value) || 0;
//         return Math.max(0, paid - finalPrice.value);
//     });

//     // --- Actions ---
//     async function confirmOrder() {
//         // THE PAYLOAD !!!!!!!!!!!!!!!!!!!!!
//         const payload = {
//             userId: posUserId,
//             drinkId: selectedDrink.value.id,
//             quantity: quantity.value,
//             sizeId: selectedSize.value,
//             toppings: selectedToppingIds.value // Sending IDs to backend
//         };
//         await cartStore.addToCart(payload);
//         closePopup();
//     }

//     async function removeItem(index) {
//         const item = cartStore.items[index];
//         await api.delete(`/carts/remove/${item.id}`);
//         await cartStore.fetchUserCart(posUserId);
//     }

//     // --- Modal Controls ---
//     function openPopup(drink) {
//         selectedDrink.value = drink;
//         selectedToppingIds.value = [];
//         quantity.value = 1;
//         showPopup.value = true;
//     }

//     function closePopup() { showPopup.value = false; }
    
//     function checkout() { showPaymentPopup.value = true; }
    

//     const receiptData = ref({finalPrice: 0, change:0});
//     // STRAIGHT TO ORDERS AND INVOICES MFFFFFFF
//     async function confirmPayment() {
//         receiptTotal.value = finalPrice.value;

//         try {
//             // The backend pulls them directly from the Cart table using the userID
//             // literal black magic
//             const res = await api.post(`/orders/add`, null, { 
//                 params: { userId: posUserId, note: "POS Order" } 
//             });

//             receiptData.value = {
//                 finalPrice: res.data.finalPrice,
//                 change: (parseInt(customerMoney.value) || 0) - res.data.finalPrice
//             }

//             txId.value = res.data.orderNumber;
//             txTime.value = new Date().toLocaleString();
            
//             showPaymentPopup.value = false;
//             showSuccessPopup.value = true;

//             await cartStore.fetchUserCart(posUserId);
//         } catch (error) {
//             console.error("Payment failed:", err);
//             alert("Thanh toán failed bruh: " + error.response.data.message);
//         }
//     }

//     // --- Topping Helpers (Template passes object) ---
//     function toggleTopping(topping) {
//         const id = topping.id;
//         const idx = selectedToppingIds.value.indexOf(id);
//         idx === -1 ? selectedToppingIds.value.push(id) : selectedToppingIds.value.splice(idx, 1);
//     }
//     const isToppingSelected = (topping) => selectedToppingIds.value.includes(topping.id);

//     return {
//         searchText, products, searchProducts: () => {},
//         showOrderScreen, orderList: ref([]), createNewOrder: () => {}, selectOrder: () => {},
//         orderedItems, totalPrice, finalPrice, removeItem,
//         checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount, confirmPayment, closePaymentPopup: () => showPaymentPopup.value = false,
//         showSuccessPopup, closeSuccessPopup: () => showSuccessPopup.value = false, txId, txTime,
//         showPopup, selectedProduct: selectedDrink, toppingList: toppings, selectedToppings: selectedToppingIds, selectedSize, selectedQty: quantity,
//         openPopup, closePopup, toggleTopping, isToppingSelected, incQty: () => quantity.value++, decQty: () => { if(quantity.value > 1) quantity.value-- }, confirmOrder, receiptData,
//         // MoMo placeholders
//         momoPhone, momoName, momoStep, momoError, momoLoading, onMomoPhoneInput: () => {}, confirmMomoReceiver: () => {}, backMomo: () => {}
//     };
// }


import { ref, computed, onMounted } from "vue";
import api from "../../api/axios";
import { useCartStore } from "../../stores/cart";

export function useCounterOrder() {
    const cartStore = useCartStore();

    // --- Data State ---
    const drinks = ref([]);
    const toppings = ref([]);
    const searchText = ref('');
    const selectedSize = ref(1);
    const posUserId = 2; 

    // --- UI & Modal State ---
    const showPopup = ref(false);
    const selectedDrink = ref(null);
    const selectedToppingIds = ref([]);
    const quantity = ref(1);
    const showOrderScreen = ref(false);

    // --- Payment & Success State ---
    const showPaymentPopup = ref(false);
    const showSuccessPopup = ref(false);
    const paymentMethod = ref('cash');
    const customerMoney = ref('');
    const txId = ref('');
    const txTime = ref('');
    const receiptData = ref({ finalPrice: 0, change: 0 }); // Corrected initialization

    // --- MoMo Simulation State ---
    const momoPhone = ref('');
    const momoName = ref('');
    const momoStep = ref(1);
    const momoError = ref('');
    const momoLoading = ref(false);

    onMounted(async () => {
        try {
            const [drinkRes, toppingRes] = await Promise.all([
                api.get('/drinks'),
                api.get('/ingredients/toppings')
            ]);
            drinks.value = drinkRes.data;
            toppings.value = toppingRes.data;
            await cartStore.fetchUserCart(posUserId);
        } catch (error) {
            console.error("Backend Connection Failed:", error);
        }
    });

    // --- Computed Logic ---
    const products = computed(() => {
        const list = !searchText.value.trim() 
            ? drinks.value 
            : drinks.value.filter(d => 
                d.name.toLowerCase().includes(searchText.value.toLowerCase())
            );

        return list.map(product => ({
            ...product,
            // Map the SQL column 'image_url' to the template's 'imageUrl'
            imageUrl: getImg(product.imageUrl)
        }));
    });

    function getImg(filename) {
        return new URL('../IMG/MistakesWereMade.jpg', import.meta.url).href
    }

    const orderedItems = computed(() => {
        return cartStore.items.map(item => {
            const base = item.drink.basePrice || 0;
            const sizeExtra = item.size ? item.size.price : 0;
            const toppingTotal = item.toppings ? item.toppings.reduce((sum, t) => sum + (t.topping.price || 0), 0) : 0;

            return {
                id: item.id,
                name: item.drink.name,
                qty: item.quantity,
                price: base + sizeExtra + toppingTotal, 
                size: item.size ? item.size.name : "S",
                toppings: item.toppings && item.toppings.length > 0 ? item.toppings.map(t => t.topping.name).join(", ") : "Không có"
            };
        });
    }); // Fixed: removed the extra random "});" that was here

    const totalPrice = computed(() => cartStore.totalPrice);
    const finalPrice = computed(() => totalPrice.value);

    const changeAmount = computed(() => {
        const paid = parseInt(customerMoney.value) || 0;
        return Math.max(0, paid - finalPrice.value);
    });

    // --- Actions ---
    async function confirmOrder() {
        const payload = {
            userId: posUserId,
            drinkId: selectedDrink.value.id,
            quantity: quantity.value,
            sizeId: selectedSize.value,
            toppings: selectedToppingIds.value 
        };
        await cartStore.addToCart(payload);
        closePopup();
    }

    async function removeItem(index) {
        const item = cartStore.items[index];
        await api.delete(`/carts/remove/${item.id}`);
        await cartStore.fetchUserCart(posUserId);
    }

    function openPopup(drink) {
        selectedDrink.value = drink;
        selectedToppingIds.value = [];
        quantity.value = 1;
        showPopup.value = true;
    }

    function closePopup() { showPopup.value = false; }
    function checkout() { showPaymentPopup.value = true; }
    
    async function confirmPayment() {
        // FIX 1: Removed 'receiptTotal.value = finalPrice.value' because it was undefined.
        
        try {
            const res = await api.post(`/orders/add`, null, { 
                params: { userId: posUserId, note: "POS Order" } 
            });

            // FIX 2: Set the data we need for the success popup
            receiptData.value = {
                finalPrice: res.data.finalPrice,
                change: (parseInt(customerMoney.value) || 0) - res.data.finalPrice
            };

            txId.value = res.data.orderNumber;
            txTime.value = new Date().toLocaleString();
            
            showPaymentPopup.value = false;
            showSuccessPopup.value = true;

            await cartStore.fetchUserCart(posUserId);
        } catch (error) {
            // FIX 3: Changed 'err' to 'error' to match the catch variable
            console.error("Payment failed:", error);
            const msg = error.response?.data?.message || "Lỗi không xác định";
            alert("Thanh toán failed bruh: " + msg);
        }
    }

    function toggleTopping(topping) {
        const id = topping.id;
        const idx = selectedToppingIds.value.indexOf(id);
        idx === -1 ? selectedToppingIds.value.push(id) : selectedToppingIds.value.splice(idx, 1);
    }

    const isToppingSelected = (topping) => selectedToppingIds.value.includes(topping.id);

    return {
        searchText, products, searchProducts: () => {},
        showOrderScreen, orderList: ref([]), createNewOrder: () => {}, selectOrder: () => {},
        orderedItems, totalPrice, finalPrice, removeItem,
        checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount, confirmPayment, closePaymentPopup: () => showPaymentPopup.value = false,
        showSuccessPopup, closeSuccessPopup: () => showSuccessPopup.value = false, txId, txTime,
        showPopup, selectedProduct: selectedDrink, toppingList: toppings, selectedToppings: selectedToppingIds, selectedSize, selectedQty: quantity,
        openPopup, closePopup, toggleTopping, isToppingSelected, incQty: () => quantity.value++, decQty: () => { if(quantity.value > 1) quantity.value-- }, confirmOrder, receiptData,
        momoPhone, momoName, momoStep, momoError, momoLoading, onMomoPhoneInput: () => {}, confirmMomoReceiver: () => {}, backMomo: () => {}
    };
}