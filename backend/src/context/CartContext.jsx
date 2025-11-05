import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem('cart_items');
    return raw ? JSON.parse(raw) : [];
  });
  const [coupon, setCoupon] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p._id === product._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { ...product, quantity }];
    });
  };
  const removeItem = (productId) => setItems(prev => prev.filter(p => p._id !== productId));
  const updateQty = (productId, qty) => setItems(prev => prev.map(p => p._id === productId ? { ...p, quantity: Math.max(1, qty) } : p));
  const clear = () => { setItems([]); setCoupon(null); };

  const subtotal = items.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const discount = coupon ? Math.floor(subtotal * (coupon.discountPercent / 100)) : 0;
  const total = Math.max(0, subtotal - discount);

  const value = useMemo(() => ({ items, addItem, removeItem, updateQty, clear, coupon, setCoupon, address, setAddress, subtotal, discount, total }), [items, coupon, address, subtotal, discount, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }


