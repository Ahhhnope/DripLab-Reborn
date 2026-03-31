import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useUserReceipts() {
  const router = useRouter()

  const receipts = ref([
    {
      id: '#DL-8821', date: 'March 24, 2024', total: '$24.50', icon: 'coffee',
      subtotal: '$22.50', tax: '$2.00',
      items: [
        { name: 'Artisan Latte',       qty: 1, price: '$5.50' },
        { name: 'Matcha Tea',          qty: 1, price: '$6.25' },
        { name: 'Butter Croissant',    qty: 1, price: '$4.75' },
        { name: 'House Blend (Beans)', qty: 1, price: '$8.00' },
      ]
    },
    {
      id: '#DL-8794', date: 'March 12, 2024', total: '$42.00', icon: 'shopping_bag',
      subtotal: '$40.00', tax: '$2.00',
      items: [{ name: 'Cold Brew Bundle', qty: 1, price: '$42.00' }]
    },
    {
      id: '#DL-8651', date: 'Feb 28, 2024', total: '$12.75', icon: 'local_cafe',
      subtotal: '$12.00', tax: '$0.75',
      items: [{ name: 'Espresso Shot x2', qty: 2, price: '$12.75' }]
    },
    {
      id: '#DL-8422', date: 'Feb 15, 2024', total: '$88.30', icon: 'package_2',
      subtotal: '$84.00', tax: '$4.30',
      items: [{ name: 'Monthly Subscription Box', qty: 1, price: '$88.30' }]
    }
  ])

  const showModal       = ref(false)
  const selectedReceipt = ref(null)

  function openModal(receipt) {
    selectedReceipt.value = receipt
    showModal.value = true
  }

  function closeModal() { showModal.value = false }
  function goTo(route)  { router.push(route) }

  return {
    receipts,
    showModal, selectedReceipt,
    openModal, closeModal,
    goTo
  }
}