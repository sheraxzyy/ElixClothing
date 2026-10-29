import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { CartItem, Product, CartContextType } from '../types';

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('elixCart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('elixCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (
    product: Product | CartItem,
    quantity: number = 1,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    setCartItems((currentItems) => {
      const sizeToUse = selectedSize || product.sizes?.[0] || 'L';
      const colorToUse = selectedColor || product.availableColors?.[0] || 'Black';
      const cartItemId = `${product.id}-${sizeToUse}-${colorToUse}`;

      const existingItemIndex = currentItems.findIndex(
        (item) => item.id === cartItemId || (item.id === product.id && item.size === sizeToUse)
      );

      if (existingItemIndex > -1) {
        return currentItems.map((item, idx) =>
          idx === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      const newItem: CartItem = {
        ...product,
        id: cartItemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        size: sizeToUse,
        color: colorToUse,
        images: product.images,
        slug: product.slug,
      };

      return [...currentItems, newItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((items) => items.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
