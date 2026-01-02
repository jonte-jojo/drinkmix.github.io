import { useEffect, useMemo, useState } from 'react';
import { ProductCatalog } from '@/components/ProductCatalog';
import { OrderForm } from '@/components/OrderForm';
import { OrderSuccess } from '@/components/OrderSuccess';
import { AdminPinGate } from '@/components/AdminPinGate';
import { AdminProducts } from '@/components/AdminProducts';
import type { Product } from '@/types/product';
import { loadProducts, saveProducts } from '@/data/productsStore';
import { loadOrderItems, saveOrderItems, clearOrderItems } from "@/data/orderStore";

type AppView = 'catalog' | 'order' | 'success' | 'adminPin' | 'admin';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('catalog');
  const [orderItems, setOrderItems] = useState<Record<string, number>>(loadOrderItems());
  const [products, setProducts] = useState<Product[]>(() => loadProducts());

  useEffect(() => {
    saveOrderItems(orderItems);
  }, [orderItems]);
  // persist products whenever they change
  useEffect(() => {
    saveProducts(products);
  }, [products]);

  // if products change, remove any order lines for deleted products
  const productIds = useMemo(() => new Set(products.map((p) => p.id)), [products]);
  useEffect(() => {
    setOrderItems((prev) => {
      const next: Record<string, number> = {};
      for (const [id, qty] of Object.entries(prev)) {
        if (productIds.has(id)) next[id] = qty;
      }
      return next;
    });
  }, [productIds]);

  const handleProceedToOrder = () => setCurrentView('order');
  const handleBackToCatalog = () => setCurrentView('catalog');
  const handleOrderComplete = () => {clearOrderItems(); setCurrentView('success')};
  const handleNewOrder = () => {
    setOrderItems({});
    clearOrderItems();
    setCurrentView('catalog');
  };

  return (
    <>
      {currentView === 'catalog' && (
        <ProductCatalog
          products={products}
          orderItems={orderItems}
          onOrderItemsChange={setOrderItems}
          onProceedToOrder={handleProceedToOrder}
          onOpenAdmin={() => setCurrentView('adminPin')}
        />
      )}

      {currentView === 'order' && (
        <OrderForm
          products={products}
          orderItems={orderItems}
          onOrderItemsChange={setOrderItems}
          onBack={handleBackToCatalog}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {currentView === 'success' && <OrderSuccess onNewOrder={handleNewOrder} />}

      {currentView === 'adminPin' && (
        <AdminPinGate onCancel={() => setCurrentView('catalog')} onSuccess={() => setCurrentView('admin')} />
      )}

      {currentView === 'admin' && (
        <AdminProducts products={products} onChangeProducts={setProducts} onClose={() => setCurrentView('catalog')} />
      )}
    </>
  );
};

export default Index;
