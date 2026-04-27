import { ref, computed } from 'vue'

// ─────────────────────────────────────────
//  MOCK DATA — thay bằng API call sau
// ─────────────────────────────────────────
const MOCK_ORDERS = {
    1: {
        tableNum: 1,
        customerName: '#DRIPLAB01',
        customerPhone: 'Không Có Thông Tin',
        paymentMethod: 'Tiền mặt',
        orderTime: '17:27:00 26/4/2026',
        items: [
            {
                id: 1,
                name: 'Bạc Xỉu',
                imageUrl: '',
                price: 65000,
                size: 'S',
                ice: '0%',
                sugar: '0%',
                qty: 1,
                toppings: 'Lmao special',
            },
            {
                id: 2,
                name: 'Cà Phê Muối',
                imageUrl: '',
                price: 45000,
                size: 'M',
                ice: '50%',
                sugar: '30%',
                qty: 1,
                toppings: 'Không có',
            },
            {
                id: 3,
                name: 'Cold Brew',
                imageUrl: '',
                price: 55000,
                size: 'L',
                ice: '100%',
                sugar: '70%',
                qty: 2,
                toppings: 'Trân châu, Thạch dừa',
            },
        ],
    },
}

// ─────────────────────────────────────────
//  COMPOSABLE
// ─────────────────────────────────────────
export function useAdminDatBan() {
    const TOTAL_TABLES = 15

    const occupiedTables  = ref([1])
    const showDetail      = ref(false)
    const selectedTable   = ref(null)
    const selectedOrder   = ref(null)
    const showConfirmDone = ref(false)

    function isOccupied(num) {
        return occupiedTables.value.includes(num)
    }

    function getTableLabel(num) {
        return `Bàn ${num}`
    }

    function openDetail(num) {
        selectedTable.value = num
        selectedOrder.value = MOCK_ORDERS[num] ?? {
            tableNum: num,
            customerName: null,
            customerPhone: null,
            paymentMethod: null,
            orderTime: null,
            items: [],
        }
        showDetail.value = true
    }

    function closeDetail() {
        showDetail.value      = false
        selectedTable.value   = null
        selectedOrder.value   = null
        showConfirmDone.value = false
    }

    function confirmDone() {
        const idx = occupiedTables.value.indexOf(selectedTable.value)
        if (idx !== -1) occupiedTables.value.splice(idx, 1)
        showConfirmDone.value = false
        closeDetail()
    }

    const totalPrice = computed(() => {
        if (!selectedOrder.value?.items?.length) return 0
        return selectedOrder.value.items.reduce(
            (sum, item) => sum + item.price * item.qty,
            0,
        )
    })

    return {
        TOTAL_TABLES,
        occupiedTables,
        showDetail,
        selectedTable,
        selectedOrder,
        showConfirmDone,
        isOccupied,
        getTableLabel,
        openDetail,
        closeDetail,
        confirmDone,
        totalPrice,
    }
}