import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchProductByIdFromDB } from "@/data/productDB";
import type { Product } from "@/types/product";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const p = await fetchProductByIdFromDB(id);
      setProduct(p);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="p-10">Loading...</div>;

  if (!product) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/">
          <Button className="mt-6">Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <Link to="/">
        <Button variant="outline" className="mb-6">← Back</Button>
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-muted rounded-2xl p-8 flex items-center justify-center">
          <img src={product.image} alt={product.name} className="w-full h-full object-contain max-h-[420px]" />
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-muted-foreground mb-6">{product.description}</p>

          <p className="text-3xl font-bold text-secondary mb-2">
            {product.unitPrice} kr / {product.unitLabel}
          </p>

          <p className="text-muted-foreground mb-6">
            Min order: 1 flak ({product.caseSize} {product.unitLabel}) • {product.casePrice} kr / flak
          </p>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Category: {product.category}</p>
            <p>{product.unit}</p>
          </div>
        </div>
      </div>
    </div>
  );
}