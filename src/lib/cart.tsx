"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { api } from "./api";
import { useAuth } from "./auth";
import type { CartItemResponse } from "./types";

interface CartContextType {
  items: CartItemResponse[];
  itemCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<CartItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.get<CartItemResponse[]>("/carts/items");
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: number, quantity: number) => {
    await api.post("/carts/items", { productId, quantity });
    await fetchCart();
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    await api.put("/carts/items", { productId, quantity });
    await fetchCart();
  };

  const removeItem = async (cartItemId: number) => {
    await api.delete(`/carts/items/${cartItemId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete("/carts/items");
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        isLoading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
