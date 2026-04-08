import { ref } from "vue"
import api from '../../api/axios'

const employees = ref([])
const filteredEmployees = ref([])

const search = ref("")

const showPopup   = ref(false)
const currentIndex = ref(null)
const isEditing   = ref(false)

const form = ref({ name: "", username: "", password: "", newPassword: "" })

// ── Load data ──
async function loadEmployees() {
  try {
    const res = await api.get('/workers')
    employees.value         = res.data
    filteredEmployees.value = res.data
  } catch (err) {
    console.warn("Không kết nối được backend, dùng data mẫu")
    // const sample = [
    //   { id: "NV_01", name: "Americano", username: "abc123", password: "Lmao", createdAt: "20/02/2020" },
    //   { id: "NV_02", name: "Robusta",   username: "kikiki", password: "Lol",  createdAt: "04/01/2026" }
    // ]
    // employees.value         = sample
    // filteredEmployees.value = sample
  }
}

// ── Filter ──
function filterEmployee() {
  const q = search.value.toLowerCase()
  filteredEmployees.value = employees.value.filter(emp =>
    emp.name.toLowerCase().includes(q) ||
    emp.username.toLowerCase().includes(q)
  )
}

function resetFilter() {
  search.value            = ""
  filteredEmployees.value = [...employees.value]
}

function syncFiltered() {
  if (search.value.trim()) {
    filterEmployee()
  } else {
    filteredEmployees.value = [...employees.value]
  }
}

// ── CRUD ──
function openAdd() {
  isEditing.value    = false
  currentIndex.value = null
  form.value         = { name: "", username: "", password: "", newPassword: "" }
  showPopup.value    = true
}

function openEdit(index) {
  isEditing.value    = true
  const emp          = filteredEmployees.value[index]
  currentIndex.value = employees.value.findIndex(e => e.id === emp.id)
  form.value         = { name: emp.name, username: emp.username, password: emp.password, newPassword: "" }
  showPopup.value    = true
}

function closePopup() { showPopup.value = false }

async function saveEmployee() {
  if (isEditing.value) {
    //update
    const i = currentIndex.value
    employees.value[i].name     = form.value.name
    employees.value[i].username = form.value.username
    if (form.value.newPassword) {
      employees.value[i].password = form.value.newPassword
    }

    await api.put(`/workers/update/${employees.value[i].id}`, {
      fullName: employees.value[i].name,
      account: employees.value[i].username,
      password: form.value.newPassword || employees.value[i].password,
    })

  } else {

    //add
    const newId  = "NV_" + String(employees.value.length + 1).padStart(2, "0")
    const newEmp = {
      id:        newId,
      name:      form.value.name,
      username:  form.value.username,
      password:  form.value.password,
      createdAt: new Date().toLocaleDateString("vi-VN")
    }
    employees.value.push(newEmp)

    // Khi có backend: bỏ comment dòng dưới
    const res = await api.post('/workers/add', {
      fullName: newEmp.name,
      account: newEmp.username,
      password: newEmp.password,
    })

    newEmp.id = res.data.id
    newEmp.name = res.data.fullName
    newEmp.username = res.data.account
  }

  showPopup.value = false
  syncFiltered()
}

async function deleteEmployee(index) {
  const emp       = filteredEmployees.value[index]
  const realIndex = employees.value.findIndex(e => e.id === emp.id)
  if (realIndex !== -1) {
    employees.value.splice(realIndex, 1)

    await api.delete(`/workers/remove/${emp.id}`)
  }
  syncFiltered()
}

export default function useEmployee() {
  return {
    employees,
    filteredEmployees,
    search,
    filterEmployee,
    resetFilter,
    loadEmployees,
    deleteEmployee,
    openAdd,
    openEdit,
    isEditing,
    showPopup,
    form,
    closePopup,
    saveEmployee
  }
}