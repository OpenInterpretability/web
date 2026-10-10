import type { Order } from "./orders"

type Creditable = { id: string; getItem(itemId: string): Promise<{ increaseQuantity(amount: number): Promise<void> }> }

/** Adds the pack's input tokens to the buyer's Hexclave "tokens" item (the balance the gateway debits). */
export function creditFor(user: Creditable) {
  return async (tokens: number, order: Order) => {
    const item = await user.getItem("tokens")
    await item.increaseQuantity(tokens)
    console.log(`[crypto-pay] credited ${tokens} tokens to ${user.id} for order ${order.id} (${order.network} ${order.txHash})`)
  }
}
