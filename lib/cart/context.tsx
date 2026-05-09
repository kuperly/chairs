'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/utils/supabase/client';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  maxStock: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'livechairs_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const supabase = createClient();

  // Load cart from database or localStorage
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);

      if (isAuthenticated && user) {
        // Load from database for authenticated users
        try {
          const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select(`
              id,
              product_id,
              quantity,
              products (
                id,
                name,
                price,
                "imageUrls",
                "stockQuantity"
              )
            `)
            .eq('user_id', user.id);

          if (error) throw error;

          const formattedItems: CartItem[] = (cartItems || []).map((item: any) => ({
            productId: item.product_id,
            name: item.products.name,
            price: item.products.price,
            quantity: item.quantity,
            imageUrl: item.products.imageUrls[0] || '/placeholder.png',
            maxStock: item.products.stockQuantity,
          }));

          setItems(formattedItems);
          // Also save to localStorage for backup
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(formattedItems));
        } catch (error) {
          console.error('Failed to load cart from database:', error);
          // Fallback to localStorage
          const savedCart = localStorage.getItem(CART_STORAGE_KEY);
          if (savedCart) {
            setItems(JSON.parse(savedCart));
          }
        }
      } else {
        // Load from localStorage for unauthenticated (backup only)
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (error) {
            console.error('Failed to parse cart from localStorage:', error);
          }
        }
      }

      setLoading(false);
    };

    loadCart();
  }, [isAuthenticated, user, supabase]);

  // Save to database helper
  const syncToDatabase = async (updatedItems: CartItem[]) => {
    if (!isAuthenticated || !user) return;

    try {
      // Delete all existing cart items for this user
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      // Insert new cart items
      if (updatedItems.length > 0) {
        const dbItems = updatedItems.map(item => ({
          user_id: user.id,
          product_id: item.productId,
          quantity: item.quantity,
        }));

        await supabase
          .from('cart_items')
          .insert(dbItems);
      }
    } catch (error) {
      console.error('Failed to sync cart to database:', error);
    }
  };

  const addItem = async (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const updatedItems = (() => {
      const existingItem = items.find((i) => i.productId === item.productId);

      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          item.maxStock
        );

        return items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: newQuantity }
            : i
        );
      } else {
        return [...items, { ...item, quantity: Math.min(quantity, item.maxStock) }];
      }
    })();

    setItems(updatedItems);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
    await syncToDatabase(updatedItems);
  };

  const removeItem = async (productId: string) => {
    const updatedItems = items.filter((i) => i.productId !== productId);
    setItems(updatedItems);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
    await syncToDatabase(updatedItems);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    const updatedItems = items.map((item) => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: Math.min(quantity, item.maxStock),
        };
      }
      return item;
    });

    setItems(updatedItems);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
    await syncToDatabase(updatedItems);
  };

  const clearCart = async () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);

    if (isAuthenticated && user) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to clear cart from database:', error);
      }
    }
  };

  const isInCart = (productId: string) => {
    return items.some((item) => item.productId === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = {
    items,
    itemCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  // If no CartProvider (e.g., manufacturer users), return empty cart
  if (context === undefined) {
    return {
      items: [],
      itemCount: 0,
      totalPrice: 0,
      addItem: async () => {},
      removeItem: async () => {},
      updateQuantity: async () => {},
      clearCart: async () => {},
      isInCart: () => false,
      getItemQuantity: () => 0,
      loading: false,
    };
  }

  return context;
}
