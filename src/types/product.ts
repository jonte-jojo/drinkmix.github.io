export interface Product {
  id: string;
  name: string;
  description: string;
  unitPrice: number;    // price per bottle
  casePrice: number;    // price per box
  caseSize: number;     // bottles in box
  unitLabel: string;
  unit: string;
  category: 'lemonade' | 'liquers' | 'Sockerlag';
  image: string;
  showInAll?: boolean;
  hasAlcohol: boolean;
  alcoholPercent?: number | null;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  orderDate: string;
  invoice: string;
  orgNumber: string;
  deliveryDate: string;
}

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  signature: string;
  date: string;
  total: number;
}

export interface Bilder {
  id: string;
  name: string;
  price: number;
  category: 'Produktbilder';
  image: string;
}
