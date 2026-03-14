/** Format a quantity as a nice string with unicode fractions — ported from eCookbook desktop */
export function formatQty(qty: number): string {
  if (qty === 0) return '';
  if (qty === Math.floor(qty)) return String(qty);

  const frac = qty - Math.floor(qty);
  const whole = Math.floor(qty);
  const fracs: [number, string][] = [
    [0.25, '¼'],
    [0.333, '⅓'],
    [0.5, '½'],
    [0.667, '⅔'],
    [0.75, '¾'],
    [0.125, '⅛'],
  ];

  for (const [val, sym] of fracs) {
    if (Math.abs(frac - val) < 0.02) {
      return whole > 0 ? `${whole} ${sym}` : sym;
    }
  }

  return qty.toFixed(2).replace(/\.?0+$/, '');
}

/** Normalize unit strings for comparison — ported from eCookbook desktop */
export function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase().trim();
  const map: Record<string, string> = {
    t: 'tbsp', tbs: 'tbsp', tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
    tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
    c: 'cup', cup: 'cup', cups: 'cup',
    oz: 'oz', ounce: 'oz', ounces: 'oz',
    lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
    g: 'g', gram: 'g', grams: 'g',
    ml: 'ml', milliliter: 'ml', milliliters: 'ml',
    l: 'l', liter: 'l', liters: 'l',
    clove: 'clove', cloves: 'clove',
    dash: 'dash', pinch: 'pinch',
    piece: 'piece', pieces: 'piece',
    can: 'can', cans: 'can',
    slice: 'slice', slices: 'slice',
  };
  return map[u] || u;
}

export function normalizeItem(item: string): string {
  return item.toLowerCase().trim();
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

/** Format an item's display text: "2 cups flour, sifted" */
export function formatItemText(quantity: number, unit: string, item: string, style: string): string {
  const parts: string[] = [];
  const qty = formatQty(quantity);
  if (qty) parts.push(qty);
  if (unit) parts.push(unit);
  parts.push(item);
  if (style) parts.push(`(${style})`);
  return parts.join(' ');
}
