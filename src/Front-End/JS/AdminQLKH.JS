import { ref } from "vue"
import api from "../../api/axios"

const customers = ref([])
const filteredCustomers = ref([])
const search = ref("")
const showPopup = ref(false)

// Use backend-aligned keys: fullName, account (email), phone, address
const form = ref({
  fullName: "", email: "", password: "",
  phone: "", defaultAddress: ""
})

async function loadCustomers() {
  try {
    const res = await api.get("/users")
    customers.value = res.data
    filteredCustomers.value = res.data
  } catch (err) {
    console.error("Backend unreachable, check your @Data annotations or API path.")
  }
}

function filterCustomer() {
  const q = search.value.toLowerCase()
  filteredCustomers.value = customers.value.filter(c =>
    c.fullName?.toLowerCase().includes(q) ||
    c.account?.toLowerCase().includes(q)
  )
}

function resetFilter() {
  search.value = ""
  filteredCustomers.value = [...customers.value]
}

function syncFiltered() {
  search.value.trim() ? filterCustomer() : filteredCustomers.value = [...customers.value]
}

function openAdd() {
  form.value = { fullName: "", account: "", password: "", phone: "", defaultAddress: "" }
  showPopup.value = true
}

async function saveCustomer() {
  try {
    // Post using the DTO structure your backend expects
    const res = await api.post('/users/add', {
      fullName: form.value.fullName,
      email: form.value.email,
      password: form.value.password,
      phone: form.value.phone,
      defaultAddress: form.value.address
    })
    
    // Refresh list to get the new ID and formatted date from SQL
    await loadCustomers()
    showPopup.value = false
    syncFiltered()
  } catch (err) {
    console.error("Save failed:", err)
  }
}

async function deleteCustomer(index) {
  const c = filteredCustomers.value[index]
  if (confirm(`Xóa khách hàng ${c.fullName}?`)) {
    try {
      await api.delete(`/users/remove/${c.id}`)
      customers.value = customers.value.filter(item => item.id !== c.id)
      syncFiltered()
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }
}

export default function useCustomer() {
  return {
    customers, filteredCustomers, search,
    filterCustomer, resetFilter, loadCustomers,
    deleteCustomer, openAdd, showPopup,
    form, closePopup: () => { showPopup.value = false },
    saveCustomer
  }
}