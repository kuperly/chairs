'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrls: string[];
    stockQuantity: number;
  };
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrls[0] || '/placeholder.png',
        stockQuantity: product.stockQuantity,
      },
      quantity
    );

    toast.success(`Added ${quantity} × ${product.name} to cart`);
    setQuantity(1);
  };

  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className={className}>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 border rounded-lg">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={isOutOfStock}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10"
            onClick={() =>
              setQuantity(Math.min(product.stockQuantity, quantity + 1))
            }
            disabled={isOutOfStock || quantity >= product.stockQuantity}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {isOutOfStock
            ? 'Out of stock'
            : `${product.stockQuantity} units available`}
        </p>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    </div>
  );
}
