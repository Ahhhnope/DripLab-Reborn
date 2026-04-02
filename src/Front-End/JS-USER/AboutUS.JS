import { ref } from 'vue'

export function useAboutUS() {
  // Hero — quán cà phê mờ tối, cinematic
  const heroImg = ref(
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&auto=format&fit=crop'
  )

  // Heritage — quán cà phê góc nhìn rộng
  const heritageImg = ref(
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=900&auto=format&fit=crop'
  )

  // Vision — nhóm bạn cầm ly cà phê, vui vẻ ngoài trời
  const visionImg = ref(
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop'
  )

  // Goal — nội thất quán cà phê tối ấm
  const goalImg = ref(
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&auto=format&fit=crop'
  )

  return {
    heroImg,
    heritageImg,
    visionImg,
    goalImg,
  }
}