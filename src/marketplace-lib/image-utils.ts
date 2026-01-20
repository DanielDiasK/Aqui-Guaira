/**
 * Utility para melhorar a qualidade de imagens usando a API do Pixian.ai
 * https://pixian.ai/api
 */

/**
 * Melhora a qualidade da imagem usando upscaling 2x
 * @param imageUrl URL original da imagem
 * @returns URL da imagem melhorada ou URL original se falhar
 */
export function enhanceImageQuality(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '/placeholder.svg'
  
  // Se já é uma imagem melhorada, retorna ela mesma
  if (imageUrl.includes('wsrv.nl')) return imageUrl
  
  // Se não é uma URL completa (http/https), retorna original
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  try {
    // Usa o serviço wsrv.nl para upscaling de imagens
    // w=2x dobra a largura (upscaling 2x)
    // &output=webp converte para WebP (melhor qualidade/tamanho)
    // &q=85 qualidade 85% (balanço entre qualidade e tamanho)
    const enhancedUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=2x&output=webp&q=85&il`
    return enhancedUrl
  } catch (error) {
    console.error('Erro ao melhorar qualidade da imagem:', error)
    return imageUrl
  }
}

/**
 * Melhora um array de imagens
 * @param images Array de URLs de imagens
 * @returns Array de URLs melhoradas
 */
export function enhanceImagesQuality(images: (string | null | undefined)[]): string[] {
  return images.map(img => enhanceImageQuality(img))
}
