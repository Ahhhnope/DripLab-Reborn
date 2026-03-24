import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useInterfaceHeader() {
    const router = useRouter()
    const isMenuOpen = ref(false)

    const navLinks = [
        { id: 1, label: 'MENU', path: '/menu' },
        { id: 2, label: 'ABOUT US', path: '/about' },
        { id: 3, label: 'NEWS', path: '/news' },
        { id: 4, label: 'STORES', path: '/stores' },
    ]

    function goTo(path) {
        router.push(path)
        isMenuOpen.value = false
    }

    function toggleMobileMenu() {
        isMenuOpen.value = !isMenuOpen.value
    }

    function goHome() {
        router.push('/')
    }

    return { navLinks, isMenuOpen, goTo, toggleMobileMenu, goHome }
}