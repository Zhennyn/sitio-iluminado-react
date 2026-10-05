// Dados de contato e conteúdo compartilhados pelo site.

export const WHATSAPP_NUMBER = '5511941942210'
export const WHATSAPP_DISPLAY = '(11) 94194-2210'
export const INSTAGRAM_URL = 'https://www.instagram.com/sitioiluminadotemporada/'
export const INSTAGRAM_HANDLE = '@sitioiluminadotemporada'
export const VIDEO_URL = 'https://www.youtube.com/shorts/ZM-ybTJY4qA'
export const PROPRIETARIO = 'Arlei'

export const whatsappLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`

// Fotos otimizadas em public/img (variações de 500px e 1000px de largura).
export const foto = (nome, largura = 1000) => `/img/${nome}-${largura}.webp`
export const fotoSrcSet = (nome) => `${foto(nome, 500)} 500w, ${foto(nome, 1000)} 1000w`
