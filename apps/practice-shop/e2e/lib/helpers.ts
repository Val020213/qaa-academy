// Small helpers that make test data unique.

/** A name that no other test uses, e.g. "Mouse 3fa9c1d2". */
export function uniqueName(prefix: string): string {
  return `${prefix} ${crypto.randomUUID().slice(0, 8)}`
}

// The seed uses SKU-0001 to SKU-0024, so we start at 1000.
// We start at a random place and count up, so two tests never get the
// same SKU, and two runs rarely do.
const FIRST = 1000
const LAST = 9999
let nextSku = FIRST + Math.floor(Math.random() * (LAST - FIRST))

/** A valid SKU like "SKU-4821" that is not used by the seed data. */
export function uniqueSku(): string {
  const value = nextSku
  nextSku = value >= LAST ? FIRST : value + 1
  return `SKU-${value}`
}
