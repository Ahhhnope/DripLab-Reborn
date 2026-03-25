export function useFooter() {
  const connectLinks = [
    { label: 'MENU', path: '/menu' },
    { label: 'ABOUT US', path: '/about' },
    { label: 'NEWS', path: '/news' },
    { label: 'STORES', path: '/stores' },
  ]

  const socialLinks = [
    { label: 'IG', href: 'https://instagram.com' },
    { label: 'FB', href: 'https://facebook.com' },
    { label: 'TK', href: 'https://tiktok.com' },
  ]

  const year = new Date().getFullYear()

  return { connectLinks, socialLinks, year }
}   