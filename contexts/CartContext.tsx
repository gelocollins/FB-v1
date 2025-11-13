import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabase/client';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  totalPrice: number;
  loading: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchDbCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('cart')
      .select('quantity, products(*)')
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error fetching DB cart:", error);
    } else {
      const fetchedItems: CartItem[] = data
        .map(item => item.products ? { product: item.products, quantity: item.quantity } : null)
        .filter((item): item is CartItem => item !== null);
      setCartItems(fetchedItems);
    }
    setLoading(false);
  }, [user]);

  const mergeAndFetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const localCartString = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      const localCart: CartItem[] = localCartString ? JSON.parse(localCartString) : [];

      if (localCart.length > 0) {
        const { data: dbCartData, error: fetchError } = await supabase
          .from('cart')
          .select('product_id, quantity')
          .eq('user_id', user.id);

        if (fetchError) throw fetchError;
        
        const dbCartMap = new Map((dbCartData || []).map(item => [item.product_id, item.quantity]));

        const upserts = localCart.map(item => {
            // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'.
            const existingQty = Number(dbCartMap.get(item.product.id)) || 0;
            return {
                user_id: user.id,
                product_id: item.product.id,
                quantity: existingQty + item.quantity
            };
        });
        
        const { error: upsertError } = await supabase.from('cart').upsert(upserts, { onConflict: 'user_id,product_id' });
        if (upsertError) throw upsertError;
        
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Error merging cart:", e);
    } finally {
      await fetchDbCart();
    }
  }, [user, fetchDbCart]);
  
  useEffect(() => {
    if (user) {
      mergeAndFetchCart();
    } else {
      const localCartString = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      setCartItems(localCartString ? JSON.parse(localCartString) : []);
    }
  }, [user, mergeAndFetchCart]);

  const addToCart = async (product: Product, quantity: number) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    const newQuantity = (existingItem?.quantity || 0) + quantity;
    
    if (user) {
        const { error } = await supabase.from('cart').upsert({
            user_id: user.id,
            product_id: product.id,
            quantity: newQuantity
        }, { onConflict: 'user_id,product_id' });
        if (error) console.error("Error adding to cart:", error);
        else await fetchDbCart();
    } else {
        let updatedCart;
        if(existingItem) {
            updatedCart = cartItems.map(item => item.product.id === product.id ? {...item, quantity: newQuantity} : item);
        } else {
            updatedCart = [...cartItems, { product, quantity }];
        }
        setCartItems(updatedCart);
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = async (productId: string) => {
    if (user) {
        const { error } = await supabase.from('cart').delete().match({ user_id: user.id, product_id: productId });
        if (error) console.error("Error removing from cart:", error);
        else await fetchDbCart();
    } else {
        const updatedCart = cartItems.filter(item => item.product.id !== productId);
        setCartItems(updatedCart);
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCart));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
        await removeFromCart(productId);
        return;
    }

    if (user) {
        const { error } = await supabase.from('cart').update({ quantity }).match({ user_id: user.id, product_id: productId });
        if (error) console.error("Error updating quantity:", error);
        else await fetchDbCart();
    } else {
        const updatedCart = cartItems.map(item => item.product.id === productId ? { ...item, quantity } : item);
        setCartItems(updatedCart);
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCart));
    }
  };

  const clearCart = async () => {
    if (user) {
        const { error } = await supabase.from('cart').delete().eq('user_id', user.id);
        if (error) console.error("Error clearing cart:", error);
        else setCartItems([]);
    } else {
        setCartItems([]);
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = cartItems.reduce((acc, item) => {
      const price = item.product.discount 
        ? item.product.price - (item.product.price * (item.product.discount / 100))
        : item.product.price;
      return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalPrice, loading }}>
      {children}
    </CartContext.Provider>
  );
};
