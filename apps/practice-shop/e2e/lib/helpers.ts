// Helpers for generated test names and SKUs.

/** A name with a random suffix, e.g. "Mouse 3fa9c1d2". */
export function uniqueName(prefix: string): string {
  return `${prefix} ${crypto.randomUUID().slice(0, 8)}`
}

// The seed uses SKU-0001 to SKU-0024, so we start at 1000.
// Each process starts at a random place and counts up, wrapping after 9999.
// Values can repeat across processes or after 9000 calls.
const FIRST = 1000
const LAST = 9999
let nextSku = FIRST + Math.floor(Math.random() * (LAST - FIRST))

/** A valid SKU like "SKU-4821" that is not used by the seed data. */
export function uniqueSku(): string {
  const value = nextSku
  nextSku = value >= LAST ? FIRST : value + 1
  return `SKU-${value}`
}
