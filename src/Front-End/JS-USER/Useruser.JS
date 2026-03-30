import { ref } from 'vue'

// ✅ Load từ localStorage khi khởi động app
const savedProfile = JSON.parse(localStorage.getItem('userProfile') || 'null')

// Shared state — dùng chung toàn bộ app
export const sharedUser = ref({
  name:   savedProfile?.name   || 'Tuân Nguyễn Đình',
  avatar: savedProfile?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD1ZW68pBEupULBdQQvsJBx4zsNuuZJGpwXDdh8NbcA8dhyRO-XnKk4_u0vHgK3JS7I3ixMTfi7hQ-h1HgjYX9ViGY18zJeb9jxRrYHmVIMidrVerQicquMEonvthNlHrO5gCKer1L0ST2AjCyTLchpQ7xI3z5hFZZzzYL8uaXzQagiKkZIHHE0xMSaCiBqrYjDMUA_heW5FBT4IcJh8XSknWPwp7RMYR54MokfC-HtDCrfQqX8b3kNsVeIstZdlgCgYiYlL2fE-NC'
})

export function saveUserProfile(data) {
  if (data.name)   sharedUser.value.name   = data.name
  if (data.avatar) sharedUser.value.avatar = data.avatar

  localStorage.setItem('userProfile', JSON.stringify({
    name:   sharedUser.value.name,
    email:  data.email  || '',
    phone:  data.phone  || '',
    avatar: sharedUser.value.avatar
  }))
}