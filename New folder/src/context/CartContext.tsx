import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, RestaurantSettings } from '../types';
import { api } from '../services/api';
import { INITIAL_SETTINGS } from '../data/initialData';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  couponCode: string | null;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  settings: RestaurantSettings | null;
  refreshSettings: () => Promise<void>;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('snackfuel_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [settings, setSettings] = useState<RestaurantSettings | null>(INITIAL_SETTINGS);

  const refreshSettings = async () => {
    try {
      const s = await api.getSettings();
      setSettings(s);
    } catch (err) {
      console.error('Failed to load restaurant settings:', err);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('snackfuel_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    // Generate unique key based on product, size, and add-ons
    const uniqueKey = `${item.productId}_${item.selectedSize || 'standard'}_${(item.selectedAddOns || []).sort().join('-')}_${item.specialInstructions || ''}`;
    
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === uniqueKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, { ...item, id: uniqueKey }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = async (code: string) => {
    if (!code.trim()) return { success: false, message: 'Please enter a coupon code' };
    try {
      const res = await api.validateCoupon(code.trim(), subtotal);
      if (res.valid) {
        setCouponCode(res.code);
        setCouponDiscount(res.discount);
        return { success: true, message: `Coupon ${res.code} applied! Saved Rs. ${res.discount}` };
      }
      return { success: false, message: 'Invalid coupon' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to apply coupon' };
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
  };

  const deliveryFee = settings
    ? subtotal >= settings.freeDeliveryThreshold
      ? 0
      : subtotal > 0
      ? settings.deliveryFee
      : 0
    : 150;

  const tax = settings ? Math.round((subtotal * settings.taxRate) / 100) : Math.round(subtotal * 0.05);

  const total = Math.max(0, subtotal - couponDiscount + deliveryFee + tax);
  const totalItemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        couponCode,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        settings,
        refreshSettings,
        subtotal,
        deliveryFee,
        tax,
        total,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
