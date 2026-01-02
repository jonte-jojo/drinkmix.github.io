import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import ProductDetails from "@/components/ProductDetails";

export default function App() {
  return (
  <Routes>
  <Route path="/" element={<Index />} />
  <Route path="/product/:id" element={<ProductDetails />} />
</Routes>
);
}
