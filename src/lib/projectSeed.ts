/** Browser-safe project seed (hex already computed on the server). */
export function seedFromHex(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}
