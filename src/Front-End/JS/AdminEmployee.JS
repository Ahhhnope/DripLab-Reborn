import { ref } from "vue"
import api from '../../api/axios'

const employees = ref([])
const filteredEmployees = ref([])

const search = ref("")

const showPopup    = ref(false)
const currentIndex = ref(null)
const isEditing    = ref(false)

const form = ref({
  fullName: "", email: "", password: "",
  phone: "", defaultAddress: "", role: ""
})

// ── Load data ──
async function loadEmployees() {
  try {
    const res = await api.get('/users/employees')
    employees.value         = res.data
    filteredEmployees.value = res.data
  } catch (err) {
    console.warn("Không kết nối được backend, dùng data mẫu")
  }
}

// ── Filter ──
function filterEmployee() {
  const q = search.value.toLowerCase()
  filteredEmployees.value = employees.value.filter(emp =>
    emp.fullName?.toLowerCase().includes(q) ||
    emp.email?.toLowerCase().includes(q)
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
  form.value         = { fullName: "", email: "", phone: "", password: "", newPassword: "", role: "EMPLOYEE" }
  showPopup.value    = true
}

function openEdit(index) {
  isEditing.value    = true
  const emp          = filteredEmployees.value[index]
  currentIndex.value = employees.value.findIndex(e => e.id === emp.id)
  form.value         = { ...emp, newPassword: "", role: emp.role || "EMPLOYEE" }
  showPopup.value    = true
}

function closePopup() { showPopup.value = false }

async function saveEmployee() {
  try {
    if (isEditing.value) {
      const id = employees.value[currentIndex.value].id
      const payload = {
        id: id,
        fullName: form.value.fullName,
        email:  form.value.account,
        password: form.value.newPassword || form.value.password,
        role:     form.value.role,
      }
      await api.put(`/users/update/${id}`, payload)
    } else {
      await api.post('/users/add', {
        fullName: form.value.fullName,
        email: form.value.email,
        phone: form.value.phone,
        password: form.value.password,
        defaultAddress: form.value.defaultAddress,
        loyaltyPoint: 0,
        tier: {id: 1},
        usedPoint: 0,
        avatar: '/IMG/lel.png',
        role: form.value.role
      })
    }

    showPopup.value = false
    await loadEmployees()
    syncFiltered()
  } catch (err) {
    console.error("Save failed:", err)
  }
}

async function deleteEmployee(index) {
  const emp = filteredEmployees.value[index]
  if (confirm(`Bạn có chắc muốn xóa nhân viên ${emp.fullName}?`)) {
    try {
      await api.delete(`/users/remove/${emp.id}`)
      await loadEmployees()
      syncFiltered()
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }
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
    saveEmployee,
  }
}