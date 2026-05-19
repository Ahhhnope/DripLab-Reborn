import { ref, computed } from 'vue'
import api from '@/api/axios'

const _tableOrdersCache = new Map()
const _tableLatestOrderId = new Map()

export function useAdminDatBan() {
    const TOTAL_TABLES = 20

    const tables = ref([])
    const showDetail = ref(false)
    const selectedTable = ref(null)
    const selectedOrder = ref(null)
    const showConfirmDone = ref(false)
    const activeFilter = ref('all')
    const selectedInvoice = ref(null)
    let _router = null

    const occupiedTables = computed(() =>
        tables.value.filter(t => t.status === "Đang sử dụng").map(t => t.id)
    )

    function setRouter(r) { _router = r }

    async function fetchTables() {
        try {
            const res = await api.get("/tables")
            tables.value = res.data

            res.data.forEach(t => {
                if (t.status === "Đang sử dụng" && t.currentOrder) {
                    const order = t.currentOrder
                    const tableId = t.id

                    if (!_tableOrdersCache.has(tableId)) {
                        _tableOrdersCache.set(tableId, new Map())
                    }

                    const ordersMap = _tableOrdersCache.get(tableId)

                    // Luôn cập nhật để lấy invoiceId mới nhất từ backend
                    const existing = ordersMap.get(order.id)
                    const updatedEntry = {
                        order: { ...order },
                        _cachedAt: existing?._cachedAt ?? Date.now(),
                    }
                    ordersMap.set(order.id, updatedEntry)

                    _tableLatestOrderId.set(tableId, order.id)

                } else if (t.status !== "Đang sử dụng") {
                    if (_tableOrdersCache.has(t.id)) {
                        _tableOrdersCache.delete(t.id)
                        _tableLatestOrderId.delete(t.id)
                    }
                }
            })
        } catch (error) {
            console.error("fetch tables error: " + error)
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

    function selectInvoice(invoice) {
        if (selectedInvoice.value?.id === invoice.id) {
            selectedInvoice.value = null
        } else {
            selectedInvoice.value = invoice
        }
    }

    function getRelatedTableIds(tableId) {
        const tableObj = tables.value.find(t => t.id === tableId)
        const orderId = tableObj?.currentOrder?.id
        if (!orderId) return [tableId]

        return tables.value
            .filter(t => t.currentOrder?.id === orderId)
            .map(t => t.id)
            .sort((a, b) => a - b)
    }

    // ── Helper: lấy invoiceId đúng từ order object ──────────────────────────
    // Backend trả về invoiceId dưới dạng số nguyên (vd: 17)
    // Ta format thành HD_17
    function resolveInvoiceLabel(order) {
        if (!order) return null
        // invoiceId là số sequential từ DB
        if (order.invoiceId != null) return order.invoiceId
        // fallback: orderNumber nếu invoiceId chưa có
        return order.orderNumber ?? null
    }

    function openDetail(tableNum) {
        selectedTable.value = tableNum
        const tableObj = tables.value.find(t => t.id === tableNum)
        const latestOrder = tableObj?.currentOrder ?? {
            id: null, tableNum: tableNum, items: [],
            selectedTables: [tableNum], customerName: '',
            customerPhone: '', paymentMethod: ''
        }

        const relatedTableIds = getRelatedTableIds(tableNum)

        const allOrdersMap = new Map()
        relatedTableIds.forEach(tid => {
            const ordersMap = _tableOrdersCache.get(tid)
            if (ordersMap) {
                ordersMap.forEach((entry, orderId) => {
                    if (!allOrdersMap.has(orderId)) {
                        allOrdersMap.set(orderId, entry)
                    }
                })
            }
        })

        const sortedEntries = Array.from(allOrdersMap.values())
            .sort((a, b) => (a._cachedAt || 0) - (b._cachedAt || 0))

        let orderSections = []
        let firstOrderData = null

        sortedEntries.forEach((entry, idx) => {
            const o = entry.order
            if (!firstOrderData) firstOrderData = o

            if (o.items && o.items.length) {
                const invoiceNum = resolveInvoiceLabel(o)
                orderSections.push({
                    orderId: o.id,
                    // invoiceNum là số nguyên, format HD_xx khi hiển thị
                    orderNumber: invoiceNum,
                    items: o.items.map(item => ({ ...item })),
                    _cachedAt: entry._cachedAt,
                })
            }
        })

        if (!orderSections.length && latestOrder.items?.length) {
            const invoiceNum = resolveInvoiceLabel(latestOrder)
            orderSections = [{
                orderId: latestOrder.id,
                orderNumber: invoiceNum,
                items: [...latestOrder.items],
                _cachedAt: Date.now(),
            }]
        }

        const baseOrder = firstOrderData || latestOrder

        // orderNumber trên selectedOrder: số nguyên invoiceId từ latestOrder
        const latestInvoiceNum = resolveInvoiceLabel(latestOrder)

        selectedOrder.value = {
            ...latestOrder,
            customerName: baseOrder.customerName || latestOrder.customerName || '',
            customerPhone: baseOrder.customerPhone || latestOrder.customerPhone || '',
            anonCode: baseOrder.anonCode || latestOrder.anonCode || '',
            receiverName: baseOrder.receiverName || latestOrder.receiverName || '',
            receiverPhone: baseOrder.receiverPhone || latestOrder.receiverPhone || '',
            orderNumber: latestInvoiceNum,
            items: orderSections.flatMap(s => s.items),
            orderSections: orderSections,
        }

        showDetail.value = true
    }

    function closeDetail() {
        showDetail.value = false
        selectedTable.value = null
        selectedOrder.value = null
        showConfirmDone.value = false
    }

    async function confirmDoneSingle() {
        if (!selectedTable.value) return
        try {
            await api.put(`/tables/release/${selectedTable.value}`)
            _tableOrdersCache.delete(selectedTable.value)
            _tableLatestOrderId.delete(selectedTable.value)
            await fetchTables()
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

    async function confirmDoneAll() {
        const currentOrderId = selectedOrder.value?.id
        let tables_to_release = []

        if (currentOrderId) {
            tables_to_release = tables.value
                .filter(t => t.currentOrder?.id === currentOrderId)
                .map(t => t.id)
        }

        if (!tables_to_release.length) {
            tables_to_release = [selectedTable.value]
        }

        try {
            await Promise.all(tables_to_release.map(t => api.put(`/tables/release/${t}`)))
            tables_to_release.forEach(t => {
                _tableOrdersCache.delete(t)
                _tableLatestOrderId.delete(t)
            })
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
        if (!selectedOrder.value) {
            closeDetail()
            return
        }

        const currentOrderId = selectedOrder.value?.id
        let allTables = []
        if (currentOrderId) {
            allTables = tables.value
                .filter(t => t.currentOrder?.id === currentOrderId)
                .map(t => t.id)
                .sort((a, b) => a - b)
        }
        if (!allTables.length && selectedTable.value) {
            allTables = [selectedTable.value]
        }

        const addProductOrderInfo = {
            originalOrderId: currentOrderId || null,
            customerName: selectedOrder.value.customerName || selectedOrder.value.receiverName || '',
            customerPhone: selectedOrder.value.customerPhone || selectedOrder.value.receiverPhone || '',
            anonCode: selectedOrder.value.anonCode || '',
            tables: allTables,
            dineMode: true,
        }

        sessionStorage.setItem('addProductOrderInfo', JSON.stringify(addProductOrderInfo))

        if (_router) {
            _router.push('/QuanLyDonTaiQuay')
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
                    let displayName = order.customerName || order.anonCode || order.receiverName

                    const ordersMap = _tableOrdersCache.get(t.id)
                    if (ordersMap && ordersMap.size > 0) {
                        const sorted = Array.from(ordersMap.values())
                            .sort((a, b) => (a._cachedAt || 0) - (b._cachedAt || 0))
                        const first = sorted[0]?.order
                        if (first) {
                            displayName = first.customerName
                                || first.anonCode
                                || first.receiverName
                                || displayName
                        }
                    }

                    if (!displayName) displayName = `Order #${orderId}`

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
        const sections = selectedOrder.value?.orderSections || []
        if (sections.length) {
            return sections.flatMap(s => s.items).reduce((sum, item) => {
                const basePrice = item.basePriceAtPurchase || 0
                const sizePrice = item.size?.price || 0
                const qty = item.quantity || 0
                return sum + (basePrice + sizePrice) * qty
            }, 0)
        }
        const items = selectedOrder.value?.items || []
        return items.reduce((sum, item) => {
            const basePrice = item.basePriceAtPurchase || 0
            const sizePrice = item.size?.price || 0
            const qty = item.quantity || 0
            return sum + (basePrice + sizePrice) * qty
        }, 0)
    })

    function getModalTableLabel() {
        const currentOrderId = selectedOrder.value?.id
        if (!currentOrderId) {
            return selectedTable.value ? getTableLabel(selectedTable.value) : ''
        }
        const relatedTables = tables.value
            .filter(t => t.currentOrder?.id === currentOrderId)
            .map(t => t.id)
            .sort((a, b) => a - b)

        if (relatedTables.length > 1) {
            return relatedTables.map(id => getTableLabel(id)).join(' + ')
        }
        return getTableLabel(selectedTable.value)
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