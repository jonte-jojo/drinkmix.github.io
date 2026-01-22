import { Card } from "@/components/ui/card";
import type { Product } from "@/types/product";

export function ProductImageCard({ item }: { item: Product }) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition">
      <div className="aspect-square bg-muted flex items-center justify-center p-6">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="p-4 text-center">
        <p className="font-semibold">{item.name}</p>
      </div>
    </Card>
  );
}