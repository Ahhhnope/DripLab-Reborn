import { ref, computed } from 'vue'

if (!window.__dripShared) {
    window.__dripShared = {
        occupiedTables: [],     
        orderList: [],         
        pendingSelectOrderId: null,
    }
}

export function useAdminDatBan() {
    const TOTAL_TABLES = 15

    const occupiedTables = ref([...window.__dripShared.occupiedTables])

    function syncFromShared() {
        occupiedTables.value = [...window.__dripShared.occupiedTables]
    }

    // Router được gán từ component qua setRouter()
    let _router = null
    function setRouter(r) { _router = r }

    const showDetail      = ref(false)
    const selectedTable   = ref(null)
    const selectedOrder   = ref(null)
    const showConfirmDone = ref(false)
    const activeFilter    = ref('all')

    function isOccupied(num) {
        return occupiedTables.value.includes(num)
    }

    function getTableLabel(num) {
        return `Bàn ${String(num).padStart(2, '0')}`
    }

    function _findOrderByTable(tableNum) {
        return (window.__dripShared.orderList || []).find(o =>
            o.selectedTables &&
            o.selectedTables.includes(tableNum) &&
            o.dineMode === true
        ) ?? null
    }

    function openDetail(tableNum) {
        syncFromShared()
        selectedTable.value = tableNum
        const order = _findOrderByTable(tableNum)
        selectedOrder.value = order ?? {
            id: null,
            tableNum: tableNum,
            customerName: null,
            customerPhone: null,
            anonCode: null,
            paymentMethod: null,
            orderTime: null,
            items: [],
            selectedTables: [],
            dineMode: null,
            note: '',
        }
        showDetail.value = true
    }

    function openDetailForInvoice(invoice) {
        syncFromShared()
        selectedTable.value  = invoice.selectedTables?.[0] ?? null
        selectedOrder.value  = { ...invoice }
        showDetail.value     = true
    }

    function closeDetail() {
        showDetail.value      = false
        selectedTable.value   = null
        selectedOrder.value   = null
        showConfirmDone.value = false
    }

    function confirmDone() {
        const tables = selectedOrder.value?.selectedTables?.length
            ? selectedOrder.value.selectedTables
            : (selectedTable.value ? [selectedTable.value] : [])

        tables.forEach(t => {
            const idx = window.__dripShared.occupiedTables.indexOf(t)
            if (idx !== -1) window.__dripShared.occupiedTables.splice(idx, 1)
        })

        // Xóa order khỏi shared orderList
        if (selectedOrder.value?.id) {
            const idx = window.__dripShared.orderList.findIndex(o => o.id === selectedOrder.value.id)
            if (idx !== -1) window.__dripShared.orderList.splice(idx, 1)
        }

        syncFromShared()
        showConfirmDone.value = false
        closeDetail()
    }

    // ── "Thêm sản phẩm" ──

    function addProduct() {
        const order = selectedOrder.value
        if (!order?.id) { closeDetail(); return }

        window.__dripShared.pendingSelectOrderId = order.id
        closeDetail()

        if (_router) {
            // Navigate tới route đặt món (dùng tên route hoặc path thực tế của bạn)
            _router.push({ path: '/QuanLyDonTaiQuay', query: { selectOrder: order.id } })
        }
    }

    function setFilter(f) {
        syncFromShared()
        activeFilter.value = f
    }

    const filteredTables = computed(() => {
        const all = Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1)
        if (activeFilter.value === 'occupied') return all.filter(n => isOccupied(n))
        if (activeFilter.value === 'available') return all.filter(n => !isOccupied(n))
        return all
    })

    const activeInvoices = computed(() => {
        return (window.__dripShared.orderList || []).filter(o =>
            o.selectedTables && o.selectedTables.length > 0 && o.dineMode === true
        )
    })

    const totalPrice = computed(() => {
        if (!selectedOrder.value?.items?.length) return 0
        return selectedOrder.value.items.reduce((sum, item) => {
            const p = item.unitPrice ?? item.price ?? 0
            return sum + p * item.qty
        }, 0)
    })

    function getModalTableLabel() {
        const tables = selectedOrder.value?.selectedTables
        if (tables && tables.length > 1) {
            return tables.map(t => `Bàn ${String(t).padStart(2, '0')}`).join(' • ')
        }
        return selectedTable.value ? getTableLabel(selectedTable.value) : ''
    }

    function isTableOccupiedInModal() {
        const tables = selectedOrder.value?.selectedTables
        return !!(tables?.length) || isOccupied(selectedTable.value)
    }

    function countOccupied()  { return occupiedTables.value.length }
    function countAvailable() { return TOTAL_TABLES - countOccupied() }

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
        syncFromShared,
        getModalTableLabel,
        isTableOccupiedInModal,
        countOccupied,
        countAvailable,
    }
}