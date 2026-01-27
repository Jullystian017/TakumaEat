'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CartItem = {
  name: string;
  note: string;
  quantity: number;
  price: number;
  image: string;
};

type AddCartItem = Omit<CartItem, 'quantity' | 'note'> & { quantity?: number; note?: string };

type CartContextValue = {
  cartItems: CartItem[];
  cartItemCount: number;
  cartSubtotal: number;
  addItem: (item: AddCartItem) => void;
  incrementItem: (name: string) => void;
  decrementItem: (name: string) => void;
  removeItem: (name: string) => void;
  clearCart: () => void;
  isLoaded: boolean;
};

const initialCartItems: CartItem[] = [];

const CartContext = createContext<CartContextValue | undefined>(undefined);
const cartStorageKey = 'takumaeat:cart-items';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(cartStorageKey);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as CartItem[];
      if (!Array.isArray(parsed)) {
        return;
      }

      setCartItems(parsed);
    } catch (error) {
      console.warn('[CartContext] Failed to parse stored cart items', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
    } catch (error) {
      console.warn('[CartContext] Failed to persist cart items', error);
    }
  }, [cartItems, isInitialized]);

  const addItem = useCallback((item: AddCartItem) => {
    const quantity = item.quantity ?? 1;
    setCartItems((prev) => {
      const existing = prev.find((cartItem) => cartItem.name === item.name);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.name === item.name
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity, note: item.note ?? '', price: item.price }];
    });
  }, []);

  const incrementItem = useCallback((name: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  const decrementItem = useCallback((name: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    );
  }, []);

  const removeItem = useCallback((name: string) => {
    setCartItems((prev) => prev.filter((item) => item.name !== name));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      cartItemCount,
      cartSubtotal,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
      isLoaded: isInitialized
    }),
    [cartItems, cartItemCount, cartSubtotal, addItem, incrementItem, decrementItem, removeItem, clearCart, isInitialized]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
