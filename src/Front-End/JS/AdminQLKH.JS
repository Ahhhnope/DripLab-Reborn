import { ref } from "vue"
import axios from "axios"

const customers = ref([])
const filteredCustomers = ref([])

const search = ref("")

const showPopup = ref(false)

const form = ref({
  name: "", username: "", password: "",
  phone: "", address: ""
})

// ── Load data ──
async function loadCustomers() {
  try {
    const res = await axios.get("http://localhost:8080/customers")
    customers.value         = res.data
    filteredCustomers.value = res.data
  } catch (err) {
    console.warn("Không kết nối được backend, dùng data mẫu")
    const sample = [
      {
        id: "KH_01", name: "Tung tung tung", username: "aoghowg@gmail.com",
        password: "Lmao", phone: "018591209", address: "âfaafw",
        createdAt: "20/20/2020"
      },
      {
        id: "KH_02", name: "Thịnh", username: "aoghowg@gmail.com",
        password: "Lol", phone: "018591209", address: "âfwwafaf",
        createdAt: "4/1/2026"
      }
    ]
    customers.value         = sample
    filteredCustomers.value = sample
  }
}

// ── Filter ──
function filterCustomer() {
  const q = search.value.toLowerCase()
  filteredCustomers.value = customers.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.username.toLowerCase().includes(q)
  )
}

function resetFilter() {
  search.value            = ""
  filteredCustomers.value = [...customers.value]
}

function syncFiltered() {
  if (search.value.trim()) {
    filterCustomer()
  } else {
    filteredCustomers.value = [...customers.value]
  }
}

// ── CRUD ──
function openAdd() {
  form.value      = { name: "", username: "", password: "", phone: "", address: "" }
  showPopup.value = true
}

function closePopup() { showPopup.value = false }

async function saveCustomer() {
  const newId  = "KH_" + String(customers.value.length + 1).padStart(2, "0")
  const newCus = {
    id:        newId,
    name:      form.value.name,
    username:  form.value.username,
    password:  form.value.password,
    phone:     form.value.phone,
    address:   form.value.address,
    createdAt: new Date().toLocaleDateString("vi-VN")
  }
  customers.value.push(newCus)
  showPopup.value = false
  syncFiltered()
}

async function deleteCustomer(index) {
  const c         = filteredCustomers.value[index]
  const realIndex = customers.value.findIndex(e => e.id === c.id)
  if (realIndex !== -1) {
    customers.value.splice(realIndex, 1)
  }
  syncFiltered()
}

export default function useCustomer() {
  return {
    customers,
    filteredCustomers,
    search,
    filterCustomer,
    resetFilter,
    loadCustomers,
    deleteCustomer,
    openAdd,
    showPopup,
    form,
    closePopup,
    saveCustomer
  }
}