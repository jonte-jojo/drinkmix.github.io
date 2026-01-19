import type { Product } from '@/types/product';


const STORAGE_KEY = 'drinkmix_products_v1';

function normalizeProduct(p: any): Product {
  // 🟢 If you still have old "price", treat it as casePrice
  const casePrice =
    typeof p.casePrice === 'number'
      ? p.casePrice
      : typeof p.price === 'number'
      ? p.price
      : 0;

  const caseSize = typeof p.caseSize === 'number' ? p.caseSize : guessCaseSizeFromUnit(p.unit);

  const unitLabel = typeof p.unitLabel === 'string' && p.unitLabel.trim() !== '' ? p.unitLabel : 'st';

  const inferredHasAlcohol =
  typeof p.hasAlcohol === "boolean"
    ? p.hasAlcohol
    : /(\balkohol\b|[0-9]+(\.[0-9]+)?\s*%)/i.test(`${p.name ?? ""} ${p.description ?? ""}`);

  const unitPrice =
    typeof p.unitPrice === 'number'
      ? p.unitPrice
      : caseSize > 0
      ? Math.round((casePrice / caseSize) * 100) / 100
      : 0;

  const unit =
    typeof p.unit === 'string' && p.unit.trim() !== ''
      ? p.unit
      : `${caseSize} ${unitLabel} per flak`;

  // ✅ Fix category typo if any old saved products had "liquer"
  let category = p.category;
  if (category === 'liquer') category = 'liquers';

  return {
    id: p.id ?? crypto.randomUUID(),
    name: p.name ?? 'Unnamed product',
    description: p.description ?? '',
    image: p.image ?? '/placeholder.svg',
    category: category ?? 'lemonade',

    // new fields
    unitPrice,
    casePrice,
    caseSize,
    unitLabel,
    unit,
    showInAll: typeof p.showInAll === "boolean" ? p.showInAll : true,
    hasAlcohol: inferredHasAlcohol,
    
  };
}

// Try to infer caseSize from unit string like "24 stycken per flak"
function guessCaseSizeFromUnit(unit?: string): number {
  if (!unit) return 24; // default
  const match = unit.match(/\d+/);
  if (!match) return 24;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : 24;
}

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];

    return parsed.map(normalizeProduct);
  } catch {
    return [];
  }
}

export function saveProducts(next: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function resetProductsToSeed() {
  localStorage.removeItem(STORAGE_KEY);
}