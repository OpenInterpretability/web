/** Hexclave rejects (HTTP 500) a single quantity change of about 2^31 tokens or more; split large changes. */
const CHUNK = 1_000_000_000

type QuantityItem = { increaseQuantity(n: number): Promise<void>; decreaseQuantity(n: number): Promise<void> }

export async function changeQuantity(item: QuantityItem, delta: number): Promise<void> {
  let left = Math.abs(Math.trunc(delta))
  while (left > 0) {
    const n = Math.min(left, CHUNK)
    if (delta > 0) await item.increaseQuantity(n)
    else await item.decreaseQuantity(n)
    left -= n
  }
}
