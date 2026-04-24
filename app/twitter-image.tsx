import ImageFn from './opengraph-image'

export const runtime = 'edge'
export const alt = 'OpenInterp — Watch language models think.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function TwitterImage() {
  return ImageFn()
}
