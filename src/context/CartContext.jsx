import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FREE_SHIPPING_OVER, SHIPPING_FLAT } from '../lib/format';

const CartContext = createContext(null);
const KEY = 'shop_cart';

const lineKey = (productId, color = '', size = '') => `${productId}|${color}|${size}`;

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const add = (product, quantity = 1, { color = '', size = '' } = {}) => {
    const key = lineKey(product.id, color, size);
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      const max = product.stock ?? 99;
      if (found) return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(max, i.quantity + quantity) } : i));
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          shopName: product.shopName || '',
          stock: max,
          color,
          size,
          quantity: Math.min(max, quantity),
        },
      ];
    });
    setOpen(true);
  };

  const update = (key, quantity) =>
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(i.stock ?? 99, quantity)) } : i))
    );
  const remove = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clear = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
    return { subtotal, shipping, total: subtotal + shipping, count: items.reduce((s, i) => s + i.quantity, 0) };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, add, update, remove, clear, open, setOpen, ...totals }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
