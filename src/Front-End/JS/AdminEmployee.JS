import { ref } from "vue"

const employees = ref([
  {
    id: "NV_01",
    name: "Americano",
    username: "abc123",
    password: "Lmao",
    createdAt: "20/02/2020"
  },
  {
    id: "NV_02",
    name: "Robusta",
    username: "kikiki",
    password: "Lol",
    createdAt: "04/01/2026"
  }
])

function addEmployee() {
  employees.value.push({
    id: "NV_" + (employees.value.length + 1),
    name: "New",
    username: "user",
    password: "123",
    createdAt: new Date().toLocaleDateString()
  })
}

function deleteEmployee(index) {
  employees.value.splice(index, 1)
}

function editEmployee(index) {
  alert("edit")
}

export default {
  setup() {
    return {
      employees,
      addEmployee,
      deleteEmployee,
      editEmployee
    }
  }
}