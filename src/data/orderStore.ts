const KEY = "drinkmix_orderItems_v1";

export function loadOrderItems(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveOrderItems(items: Record<string, number>) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function clearOrderItems() {
  localStorage.removeItem(KEY);
}