import { ref, computed } from 'vue'
import api from '@/api/axios'

export function useAdminDatBan() {
    const TOTAL_TABLES = 15

    const tables = ref([]) 
    const showDetail = ref(false)
    const selectedTable = ref(null)
    const selectedOrder = ref(null)
    const showConfirmDone = ref(false)
    const activeFilter = ref('all')
    let _router = null

    const occupiedTables = computed(() => tables.value.filter(t => t.status === "Đang sử dụng").map(t => t.id))

    function setRouter(r) { _router = r }

    async function fetchTables() {
        try {
            const res = await api.get("/tables");
            tables.value = res.data;
        } catch (error) {
            console.error("fetch tables error: " + error);
        }
    }

    async function fetchTablesFromOrderId(currentOrderId) {
        try {
            const res = await api.get(`/tables/${currentOrderId}`);
            tables.value = res.data;
        } catch (error) {
            console.error("fetch tables error: " + error);
        }
    }

    async function syncFromShared() {
        await fetchTables()
    }

    function isOccupied(num) {
        const table = tables.value.find(t => t.id === num)
        return table?.status === "Đang sử dụng"
    }

    function getTableLabel(num) {
        return `Bàn ${String(num).padStart(2, '0')}`
    }

    function openDetail(tableNum) {
        selectedTable.value = tableNum
        const tableObj = tables.value.find(t => t.id === tableNum)
        console.log("Detail: "+tableObj.currentOrder)
        
        selectedOrder.value = tableObj?.currentOrder ?? {
            id: null,
            tableNum: tableNum,
            items: [],
            selectedTables: [tableNum],
            customerName: '',
            customerPhone: '',
            paymentMethod: ''
        }
        showDetail.value = true
    }

    function openDetailForInvoice(invoice) {
        selectedTable.value = invoice.selectedTables?.[0] ?? null
        selectedOrder.value = { ...invoice }
        showDetail.value = true
    }

    function closeDetail() {
        showDetail.value = false
        selectedTable.value = null
        selectedOrder.value = null
        showConfirmDone.value = false
    }

    async function confirmDone() {
        if (!selectedTable.value) return
        try {
            await api.put(`/tables/release/${selectedTable.value}`)
            await fetchTables()
            closeDetail()
        } catch (err) {
            console.error("Error releasing table:", err)
        }
    }

    function addProduct() {
        if (!selectedOrder.value?.id) { 
            closeDetail(); 
            return 
        }
        if (_router) {
            _router.push({ path: '/QuanLyDonTaiQuay', query: { selectOrder: selectedOrder.value.id } })
        }
        closeDetail()
    }

    function setFilter(f) {
        activeFilter.value = f
    }

    const filteredTables = computed(() => {
        const all = Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1)
        if (activeFilter.value === 'occupied') return all.filter(n => isOccupied(n))
        if (activeFilter.value === 'available') return all.filter(n => !isOccupied(n))
        return all
    })

    const activeInvoices = computed(() => {
        return tables.value
            .filter(t => t.status === "Đang sử dụng" && t.currentOrder)
            .map(t => t.currentOrder)
    })

    const totalPrice = computed(() => {
        const items = selectedOrder.value?.items || []
        return items.reduce((sum, item) => {
            const basePrice = item.basePriceAtPurchase || 0
            const sizePrice = item.size?.price || 0
            const qty = item.quantity || 0
            
            return sum + (basePrice + sizePrice) * qty
        }, 0)
    })

    function getModalTableLabel() {
        const currentOrderId = selectedOrder.value?.id;

        if (!currentOrderId) {
            return selectedTable.value ? getTableLabel(selectedTable.value) : '';
        }
        const relatedTables = tables.value.filter(t => t.currentOrder?.id === currentOrderId).map(t => t.id).sort((a, b) => a - b)

        if (relatedTables.length > 1) {
            return relatedTables.map(id => getTableLabel(id)).join(' + ');
        }

        return getTableLabel(selectedTable.value);
    }

    function isTableOccupiedInModal() {
        return isOccupied(selectedTable.value)
    }

    function countOccupied() { 
        return tables.value.filter(t => t.status === "Đang sử dụng").length 
    }
    
    function countAvailable() { 
        return TOTAL_TABLES - countOccupied() 
    }

    return {
        TOTAL_TABLES,
        occupiedTables,
        showDetail,
        selectedTable,
        selectedOrder,
        showConfirmDone,
        activeFilter,
        filteredTables,
        activeInvoices,
        fetchTables,
        isOccupied,
        getTableLabel,
        openDetail,
        openDetailForInvoice,
        closeDetail,
        confirmDone,
        addProduct,
        totalPrice,
        setFilter,
        setRouter,
        getModalTableLabel,
        isTableOccupiedInModal,
        countOccupied,
        countAvailable,
        syncFromShared 
    }
}