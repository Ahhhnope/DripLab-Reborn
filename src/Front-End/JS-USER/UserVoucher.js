import { ref, onMounted } from 'vue'
import api from '../../api/axios.js'

export function useUserVoucher() {

    const promos   = ref([])
    const myPromos = ref([])
    const userId   = ref(null)
    const toast    = ref({ show: false, message: '', type: 'success' })

    async function loadAll() {
        const res = await api.get('/promo-codes')
        const now = new Date()
        promos.value = res.data.filter(v =>
            v.status &&
            v.quantity > 0 &&
            new Date(v.endDate) >= now
        )
    }

    async function loadMine() {
        const res = await api.get('/promo-codes/my-promos',
            { params: { userId: userId.value } })
        myPromos.value = res.data.map(v => v.id)
    }

    function isSaved(promoId) {
        return myPromos.value.includes(promoId)
    }

    async function savePromo(promoId) {
        try {
            await api.post(`/promo-codes/${promoId}/save`, null,
                { params: { userId: userId.value } })
            await Promise.all([loadAll(), loadMine()])
            showToast('Đã lưu mã vào kho của bạn!', 'success')
        } catch (e) {
            showToast(e.response?.data?.message || 'Lỗi khi lưu mã', 'error')
        }
    }

    function fmtValue(v) {
        return v.category === 'PHẦN TRĂM'
            ? v.value + '%'
            : (+v.value).toLocaleString('vi-VN') + 'đ'
    }

    function showToast(message, type = 'success') {
        toast.value = { show: true, message, type }
        setTimeout(() => { toast.value.show = false }, 3500)
    }

    onMounted(async () => {
        userId.value = JSON.parse(localStorage.getItem('user'))?.id
        await Promise.all([loadAll(), loadMine()])
    })

    return { promos, myPromos, isSaved, savePromo, fmtValue, toast }
}