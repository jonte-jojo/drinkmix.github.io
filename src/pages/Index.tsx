import { useEffect, useMemo, useState } from "react";
import { ProductCatalog } from "@/components/ProductCatalog";
import { OrderForm } from "@/components/OrderForm";
import { OrderSuccess } from "@/components/OrderSuccess";
import { AdminPinGate } from "@/components/AdminPinGate";
import { AdminProducts } from "@/components/AdminProducts";
import { SeeOldOrders } from "@/components/SeeOldOrders";
import type { Product } from "@/types/product";
import { loadOrderItems, saveOrderItems, clearOrderItems } from "@/data/orderStore";
import { fetchProductsFromDB } from "@/data/productDB";
import { loadProducts } from "@/data/productsStore";

type AppView = "catalog" | "order" | "success" | "adminPin" | "admin" | "seeOrders";

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>("catalog");
  const [orderItems, setOrderItems] = useState<Record<string, number>>(loadOrderItems());
  const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  (async () => {
    try {
      const dbProducts = await fetchProductsFromDB();
      setProducts(dbProducts);
    } catch (e) {
      console.error("Failed to load products from DB:", e);
      setProducts(loadProducts());
    }
  })();
}, []);


  useEffect(() => {
    saveOrderItems(orderItems);
  }, [orderItems]);

  

  const onSeeOrders = () => setCurrentView("seeOrders");
  const onBackFromOrders = () => setCurrentView("catalog");

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

  const handleProceedToOrder = () => setCurrentView("order");
  const handleBackToCatalog = () => setCurrentView("catalog");

  const handleOrderComplete = () => {
    clearOrderItems();
    setCurrentView("success");
  };

  const handleNewOrder = () => {
    setOrderItems({});
    clearOrderItems();
    setCurrentView("catalog");
  };

  return (
    <>
      {currentView === "catalog" && (
        <ProductCatalog
          products={products}
          orderItems={orderItems}
          onOrderItemsChange={setOrderItems}
          onProceedToOrder={handleProceedToOrder}
          onOpenAdmin={() => setCurrentView("adminPin")}
          
        />
      )}

      {currentView === "order" && (
        <OrderForm
          products={products}
          orderItems={orderItems}
          onOrderItemsChange={setOrderItems}
          onBack={handleBackToCatalog}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {currentView === "success" && <OrderSuccess onNewOrder={handleNewOrder} />}

      {currentView === "adminPin" && (
        <AdminPinGate
          onCancel={() => setCurrentView("catalog")}
          onSuccess={() => setCurrentView("admin")}
        />
      )}

      {currentView === "admin" && (
        <AdminProducts
          products={products}
          onChangeProducts={setProducts}
          onClose={() => setCurrentView("catalog")}
          onSeeOrders={onSeeOrders}
        />
      )}
      {currentView === "seeOrders" && (
        <SeeOldOrders onBack={onBackFromOrders} />
      )}
    </>
  );
};

export default Index;