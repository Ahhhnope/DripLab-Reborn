import { ref, computed } from 'vue'
import api from '@/api/axios'

export function useAdminDatBan() {
    const TOTAL_TABLES = 20

    const tables = ref([])
    const showDetail = ref(false)
    const selectedTable = ref(null)
    const selectedOrder = ref(null)
    const showConfirmDone = ref(false)
    const activeFilter = ref('all')
    // Hóa đơn đang được chọn ở cột trái (chỉ lọc lưới bàn, không mở modal)
    const selectedInvoice = ref(null)
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

    // Chỉ chọn hóa đơn để lọc lưới bàn bên phải — KHÔNG mở modal
    function selectInvoice(invoice) {
        selectedInvoice.value = invoice
    }

    // Mở modal chi tiết bàn (gọi khi click ô bàn xanh)
    function openDetail(tableNum) {
        selectedTable.value = tableNum
        const tableObj = tables.value.find(t => t.id === tableNum)
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

    function closeDetail() {
        showDetail.value = false
        selectedTable.value = null
        selectedOrder.value = null
        showConfirmDone.value = false
    }

    // Trả bàn hiện tại
    async function confirmDoneSingle() {
        if (!selectedTable.value) return
        try {
            await api.put(`/tables/release/${selectedTable.value}`)
            await fetchTables()
            // Nếu bàn vừa trả là bàn cuối trong invoice đang chọn thì reset
            if (selectedInvoice.value) {
                const remaining = selectedInvoice.value.selectedTables.filter(t => t !== selectedTable.value)
                selectedInvoice.value = remaining.length === 0
                    ? null
                    : { ...selectedInvoice.value, selectedTables: remaining }
            }
            closeDetail()
        } catch (err) {
            console.error("Error releasing table:", err)
        }
    }

    // Trả tất cả bàn trong hóa đơn
    async function confirmDoneAll() {
        const tables_to_release = selectedOrder.value?.selectedTables || [selectedTable.value]
        try {
            await Promise.all(tables_to_release.map(t => api.put(`/tables/release/${t}`)))
            await fetchTables()
            selectedInvoice.value = null
            closeDetail()
        } catch (err) {
            console.error("Error releasing all tables:", err)
        }
    }

    async function confirmDone() {
        await confirmDoneSingle()
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
        selectedInvoice.value = null
    }

    const filteredTables = computed(() => {
        const all = Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1)
        if (activeFilter.value === 'occupied') return all.filter(n => isOccupied(n))
        if (activeFilter.value === 'available') return all.filter(n => !isOccupied(n))
        return all
    })

    const activeInvoices = computed(() => {
        const map = new Map()
        tables.value
            .filter(t => t.status === "Đang sử dụng" && t.currentOrder)
            .forEach(t => {
                const order = t.currentOrder
                const orderId = order.id
                if (!map.has(orderId)) {
                    const displayName = order.customerName || order.anonCode || `#DRIPLAB${String(orderId).slice(-2).padStart(2, '0')}`
                    map.set(orderId, { ...order, displayName, selectedTables: [] })
                }
                map.get(orderId).selectedTables.push(t.id)
            })
        return Array.from(map.values()).map(inv => ({
            ...inv,
            selectedTables: inv.selectedTables.sort((a, b) => a - b)
        }))
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
        const relatedTables = tables.value
            .filter(t => t.currentOrder?.id === currentOrderId)
            .map(t => t.id)
            .sort((a, b) => a - b)

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
        selectedInvoice,
        fetchTables,
        isOccupied,
        getTableLabel,
        openDetail,
        selectInvoice,
        closeDetail,
        confirmDone,
        confirmDoneSingle,
        confirmDoneAll,
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