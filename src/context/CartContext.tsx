import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Product } from '../types/database';
import { requestCouponQuote, type CouponQuote } from '../lib/coupons';

// Removed eslint-disable for react-refresh
export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, options?: { openCart?: boolean }) => void;
  addToCart: (product: Product, quantity?: number, options?: { openCart?: boolean }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  couponCode: string | null;
  couponQuote: CouponQuote | null;
  couponError: string | null;
  isApplyingCoupon: boolean;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  discountTotal: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const toItemsPayload = (items: CartItem[]) =>
  items.map((item) => ({ product_id: item.product.id, quantity: item.quantity }));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponQuote, setCouponQuote] = useState<CouponQuote | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const couponCodeRef = useRef<string | null>(null);

  const addItem = (product: Product, quantity: number = 1, options?: { openCart?: boolean }) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      if (existingItem) {
        const totalQuantity = existingItem.quantity + quantity;
        if (totalQuantity > product.stock) {
          return currentItems; // No agregar más si no hay stock
        }
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(totalQuantity, product.stock) }
            : item
        );
      }
      return [...currentItems, { product, quantity }];
    });
    if (options?.openCart !== false) setIsOpen(true);
  };

  const addToCart = addItem;

  const removeItem = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(currentItems => {
      const item = currentItems.find(item => item.product.id === productId);
      if (!item) return currentItems;

      if (quantity > item.product.stock) {
        return currentItems; // No actualizar si excede el stock
      }

      return currentItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    setIsOpen(false);
    setCouponCode(null);
    setCouponQuote(null);
    setCouponError(null);
    couponCodeRef.current = null;
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponQuote(null);
    setCouponError(null);
    couponCodeRef.current = null;
  };

  const applyCoupon = useCallback(async (code: string) => {
    const normalized = code.trim();

    if (!normalized) {
      setCouponError('Escribe el código del cupón');
      return false;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const quote = await requestCouponQuote(normalized, toItemsPayload(items));
      setCouponQuote(quote);
      setCouponCode(quote.coupon.code);
      couponCodeRef.current = quote.coupon.code;
      return true;
    } catch (error) {
      setCouponQuote(null);
      setCouponCode(null);
      couponCodeRef.current = null;
      setCouponError(error instanceof Error ? error.message : 'No se pudo aplicar el cupón');
      return false;
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [items]);

  // Revalida el cupón cuando cambia el carrito (el descuento depende de los productos)
  useEffect(() => {
    const code = couponCodeRef.current;
    if (!code) return;

    let cancelled = false;

    void (async () => {
      try {
        const quote = await requestCouponQuote(code, toItemsPayload(items));
        if (cancelled) return;
        setCouponQuote(quote);
        setCouponError(null);
      } catch (error) {
        if (cancelled) return;
        setCouponQuote(null);
        setCouponError(error instanceof Error ? error.message : 'El cupón ya no aplica a tu carrito');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountTotal = couponQuote?.discount_total ?? 0;
  const finalTotal = couponQuote ? couponQuote.total : total;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        isOpen,
        setIsOpen,
        couponCode,
        couponQuote,
        couponError,
        isApplyingCoupon,
        applyCoupon,
        removeCoupon,
        discountTotal,
        finalTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
