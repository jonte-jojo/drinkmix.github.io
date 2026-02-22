import { useState } from 'react';
import type { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Citrus, Settings } from 'lucide-react';
// import { bilder } from '@/data/products'; 
import { ProductImageCard } from './ProductImageCard';

interface ProductCatalogProps {
  products: Product[];
  orderItems: Record<string, number>;
  onOrderItemsChange: (items: Record<string, number>) => void;
  onProceedToOrder: () => void;
  onOpenAdmin: () => void;
}

export const ProductCatalog = ({
  products,
  orderItems,
  
  onOrderItemsChange,
  onProceedToOrder,
  onOpenAdmin,
}: ProductCatalogProps) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'Lemonad' | 'Likör' | 'Sockerlag'| 'Produktbilder'>('all');

const normalize = (s?: string) => (s ?? "").toLowerCase();

const isSockerlag = (p: Product) => normalize(p.category) === "sockerlag";

const isCaseProduct = (p: Product) => p.caseSize === 24 !== isSockerlag(p); 
// If sockerlag has caseSize 24 but should be single item, use:
// const isCaseProduct = (p: Product) => p.caseSize === 24 && p.category !== "Sockerlag";

const priceEach = (p: Product) => (isCaseProduct(p) ? p.casePrice : p.unitPrice);

const getMinOrder = (_p: Product) => 1;

const increment = (productId: string) => {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const current = orderItems[productId] || 0;
  const min = getMinOrder(product);

  const next = current === 0 ? min : current + 1;

  onOrderItemsChange({
    ...orderItems,
    [productId]: next,
  });
};

const decrement = (productId: string) => {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const current = orderItems[productId] || 0;
  if (current === 0) return;

  const min = getMinOrder(product);

  // If decreasing below minimum → remove product entirely
  const next = current <= min ? 0 : current - 1;

  const updated = { ...orderItems };
  if (next === 0) delete updated[productId];
  else updated[productId] = next;

  onOrderItemsChange(updated);
};

  const filteredProducts = activeCategory === 'all' ? products.filter((p) => p.showInAll !== false) : products.filter((p) => p.category === activeCategory);
  const productImages = products
  .filter((p) => p.image) // only products that have an image
  ;
  const totalItems = Object.values(orderItems).reduce((sum, qty) => sum + qty, 0);

const totalPrice = Object.entries(orderItems).reduce((sum, [productId, qty]) => {
  const product = products.find((p) => p.id === productId);
  if (!product) return sum;

  return sum + priceEach(product) * qty;
}, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-citrus-yellow to-citrus-green rounded-full flex items-center justify-center">
                <Citrus className="w-7 h-7 text-foreground" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">drinkmix.nu</h1>
                <p className="text-sm text-muted-foreground">Premium Lemonad & Likör</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
            {totalItems > 0 && (
                <Button
                  onClick={onProceedToOrder}
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2 text-lg px-6"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Order ({totalItems}) - {totalPrice} kr
                </Button>
              )}
              
              <Button variant="outline" size="lg" onClick={onOpenAdmin} className="gap-2">
                <Settings className="w-5 h-5" />
                Admin
              </Button>

              
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <Tabs defaultValue="all" onValueChange={(v) => setActiveCategory(v as any)}>
        <TabsList className="grid w-full max-w-2xl grid-cols-5 mb-10 h-18">
            <TabsTrigger value="all" className="text-lg">All Products</TabsTrigger>
            <TabsTrigger value="Lemonad" className="text-lg">Lemonad</TabsTrigger>
            <TabsTrigger value="Likör" className="text-lg">Likör</TabsTrigger>
            <TabsTrigger value="Sockerlag" className='text-lg'>Sockerlag</TabsTrigger>
            <TabsTrigger value="Produktbilder" className='text-lg' >Produktbilder</TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-0">
          {activeCategory === "Produktbilder" ? (
  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {productImages.map((item) => (
      <ProductImageCard key={item.id} item={item} />
    ))}
  </div>
) : (
  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {filteredProducts.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        quantity={orderItems[product.id] || 0}
        onIncrement={increment}
        onDecrement={decrement}
      />
    ))}
  </div>
)}
</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
