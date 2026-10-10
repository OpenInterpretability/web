import ImageFn from './opengraph-image'

export const runtime = 'edge'
export const alt = 'OpenInterpretability — Know what an action will do before your agent runs it.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function TwitterImage() {
  return ImageFn()
}
