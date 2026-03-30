import { useRouter } from 'vue-router'

export function useHeader() {
  const router = useRouter()

  const navItems = [
    { label: 'MENU',     path: '/menu' },
    { label: 'ABOUT US', path: '/about' },
    { label: 'NEWS',     path: '/news' },
    { label: 'STORES',   path: '/stores' },
  ]

  function goToLogin() {
    router.push('/account')
  }

  function goToCart() {
    router.push('/cart')
  }

  return { navItems, goToLogin, goToCart }
}