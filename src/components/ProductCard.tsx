import { Product } from '@/types/product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (productId: string, quantity: number) => void;
}

export const ProductCard = ({ product, quantity, onQuantityChange }: ProductCardProps) => {
  const navigate = useNavigate();
  const handleIncrement = () => {
    onQuantityChange(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(product.id, quantity - 1);
    }
  };

  return (
    
    <Card
  onClick={() => navigate(`/product/${product.id}`)}
  className={`cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl ${quantity > 0 ? 'ring-2 ring-primary shadow-lg' : ''}`}>
      <div className="relative aspect-square bg-gradient-to-br from-citrus-yellow/20 to-citrus-green/20 flex items-center justify-center p-6">
  <div
    className={`absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
      product.hasAlcohol ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
    }`}
  >
    {product.hasAlcohol ? `${product.alcoholPercent != null ? ` ${product.alcoholPercent}% ` : ""}Alkohol`
    : "Alkoholfri"}
  </div>

  <div className="w-full h-full bg-card rounded-lg flex items-center justify-center">
    <img
      src={product.image}
      alt={product.name}
      className="w-3/4 h-3/4 object-contain"
    />
  </div>
</div>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading text-xl font-semibold text-foreground leading-tight">
            {product.name}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
            product.category === 'lemonade' 
              ? 'bg-citrus-yellow/30 text-foreground' 
              : 'bg-citrus-orange/30 text-foreground'
          }`}>
            {product.category}
          </span>
        </div>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-4">
        <div>
  {/* Price per unit (shown to customer) */}
  <span className="text-2xl font-bold text-secondary">
    {product.unitPrice} kr / {product.unitLabel}
  </span>

  {/* Minimum order info */}
  <span className="text-xs text-muted-foreground block">
    Min order: 1 flak ({product.caseSize} {product.unitLabel}) • {product.casePrice} kr / flak
  </span>
</div>
        </div>
        <div className="flex items-center justify-center gap-4 bg-muted rounded-lg p-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDecrement();
            }}
            disabled={quantity === 0}
            className="h-12 w-12 rounded-full"
          >
            <Minus className="h-5 w-5" />
          </Button>
          <span className="text-2xl font-bold min-w-[3rem] text-center">{quantity}</span>
          <Button
            variant="default"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleIncrement();
            }}
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
            >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
