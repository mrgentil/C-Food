import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, MenuItem, MenuItemOption } from '../types';

export type DeliveryType = 'delivery' | 'pickup';

function newCartLineId(): string {
  return `l_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`;
}

function normInstr(s?: string | null): string {
  return (s?.trim() ?? '');
}

interface CartContextType {
  cart: CartItem[];
  items: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, options?: MenuItemOption[], specialInstructions?: string) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');

  const addToCart = (item: MenuItem, quantity = 1, options: MenuItemOption[] = [], specialInstructions?: string) => {
    const note = normInstr(specialInstructions) || undefined;
    setCart(prev => {
      const currentRestaurantId = prev[0]?.menuItem?.restaurantId;
      if (currentRestaurantId && item.restaurantId && currentRestaurantId !== item.restaurantId) {
        return [{
          lineId: newCartLineId(),
          menuItem: item,
          quantity,
          selectedOptions: options,
          specialInstructions: note,
        }];
      }
      const existing = prev.find(
        c =>
          c.menuItem.id === item.id &&
          JSON.stringify(c.selectedOptions) === JSON.stringify(options) &&
          normInstr(c.specialInstructions) === normInstr(note)
      );
      if (existing) {
        return prev.map(c =>
          c.lineId === existing.lineId ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [
        ...prev,
        {
          lineId: newCartLineId(),
          menuItem: item,
          quantity,
          selectedOptions: options,
          specialInstructions: note,
        },
      ];
    });
  };

  const removeFromCart = (lineId: string) => {
    setCart(prev => prev.filter(c => c.lineId !== lineId));
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineId);
      return;
    }
    setCart(prev => prev.map(c => (c.lineId === lineId ? { ...c, quantity } : c)));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        deliveryType,
        setDeliveryType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
