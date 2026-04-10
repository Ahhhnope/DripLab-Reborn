import { ref } from "vue"
import api from '../../api/axios'

const employees = ref([])
const filteredEmployees = ref([])

const search = ref("")

const showPopup   = ref(false)
const currentIndex = ref(null)
const isEditing   = ref(false)

const form = ref({ fullName: "", account: "", password: "", newPassword: "" })

// ── Load data ──
async function loadEmployees() {
  try {
    const res = await api.get('/workers')
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
  form.value         = { fullName: "", account: "", password: "", newPassword: "" }
  showPopup.value    = true
}

function openEdit(index) {
  isEditing.value    = true
  const emp          = filteredEmployees.value[index]
  currentIndex.value = employees.value.findIndex(e => e.id === emp.id)
  form.value         = { ...emp, newPassword: "" }
  showPopup.value    = true
}

function closePopup() { showPopup.value = false }

async function saveEmployee() {
  try {
    if (isEditing.value) {
      const id = employees.value[currentIndex.value].id
      const payload = {
        fullName: form.value.fullName,
        account: form.value.account,
        // Only send new password if it was typed
        password: form.value.newPassword || form.value.password 
      }
      
      await api.put(`/workers/update/${id}`, payload)
    } else {
      const res = await api.post('/workers/add', {
        fullName: form.value.fullName,
        account: form.value.account,
        password: form.value.password
      })
      // The backend returns the newly created object with its SQL ID
      employees.value.push(res.data)
    }
    
    showPopup.value = false
    await loadEmployees() // Refresh to ensure data integrity
    syncFiltered()
  } catch (err) {
    console.error("Save failed:", err)
  }
}

async function deleteEmployee(index) {
  const emp = filteredEmployees.value[index]
  if (confirm(`Bạn có chắc muốn xóa nhân viên ${emp.fullName}?`)) {
    try {
      await api.delete(`/workers/remove/${emp.id}`)
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
    saveEmployee
  }
}