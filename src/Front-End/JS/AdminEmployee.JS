import { ref } from "vue"

export default function useEmployee() {
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

  const showPopup = ref(false)
  const currentIndex = ref(null)
  const isEditing = ref(false)

  const form = ref({
    name: "",
    username: "",
    password: "",
    newPassword: ""
  })

  function openAdd() {
    isEditing.value = false
    currentIndex.value = null
    form.value = { name: "", username: "", password: "", newPassword: "" }
    showPopup.value = true
  }

  function openEdit(index) {
    isEditing.value = true 
    const emp = employees.value[index]
    currentIndex.value = index
    form.value = {
      name: emp.name,
      username: emp.username,
      password: emp.password,
      newPassword: ""
    }
    showPopup.value = true
  }

  function closePopup() {
    showPopup.value = false
  }

   function saveEmployee() {
    if (isEditing.value) {
      // Sửa nhân viên cũ
      const index = currentIndex.value
      employees.value[index].name = form.value.name
      employees.value[index].username = form.value.username
      if (form.value.newPassword) {
        employees.value[index].password = form.value.newPassword
      }
    } else {
       // Thêm nhân viên mới
      const newId = "NV_" + String(employees.value.length + 1).padStart(2, "0")
      employees.value.push({
        id: newId,
        name: form.value.name,
        username: form.value.username,
        password: form.value.password,
        createdAt: new Date().toLocaleDateString("vi-VN")
      })
    }

    showPopup.value = false
  }

  function deleteEmployee(index) {
    employees.value.splice(index, 1)
  }

   return {
    employees,
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