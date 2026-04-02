import { ref } from 'vue'

export function useAboutUS() {
    const showFull = ref(false)

    const toggleText = () => {
        showFull.value = !showFull.value
    }

    const aboutTopImg = ref(
        'https://images.unsplash.com/photo-1498804103079-a6351b050096'
    )
    const aboutBottomImg = ref(
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'
    )
    return {
        showFull,
        toggleText,
        aboutTopImg,
        aboutBottomImg
    }
}