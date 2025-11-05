// app/cafe-provider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { CartItem, OrderStatus, PaymentStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// REAL SERVER ACTIONS
import {
  getMenuItems,
  getOrders,
  createOrder,
  updateOrderStatus as serverUpdateOrderStatus,
  updatePaymentStatus as serverUpdatePaymentStatus,
  clearCompletedOrders,
} from '@/app/actions';

// Only import getUsers when needed
import { getUsers } from '@/app/actions';

type UsersType = Awaited<ReturnType<typeof getUsers>>;
type MenuItemsType = Awaited<ReturnType<typeof getMenuItems>>;
type OrdersType = Awaited<ReturnType<typeof getOrders>>;

interface CafeContextType {
  menuItems: MenuItemsType;
  users: UsersType;
  orders: OrdersType;
  cart: CartItem[];
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  placeOrder: (name: string, table: string, notes?: string) => Promise<void>;
  updateOrderStatus: (id: number, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (id: number, status: PaymentStatus) => Promise<void>;
  clearSalesData: () => Promise<void>;
  cartItemCount: number;
  loading: boolean;
  refetch: () => Promise<void>;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export function CafeProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const [menuItems, setMenuItems] = useState<MenuItemsType>([] as any);
  const [users, setUsers] = useState<UsersType>([] as any);
  const [orders, setOrders] = useState<OrdersType>([] as any);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Always fetch menu & orders
      const [menu, orderList] = await Promise.all([
        getMenuItems(),
        getOrders(),
      ]);
      setMenuItems(menu);
      setOrders(orderList);

      // Only fetch users if we're in admin context
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user?.role === 'Admin') {
        setIsAdmin(true);
        try {
          const userList = await getUsers();
          setUsers(userList);
        } catch (err) {
          console.warn('getUsers failed (expected for non-admin)');
          setUsers([]);
        }
      } else {
        setIsAdmin(false);
        setUsers([]);
      }
    } catch (err) {
      console.error('fetchAll error:', err);
      toast({ variant: 'destructive', title: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const refetch = async () => {
    await fetchAll();
  };

  // CART
  const addToCart = (id: number) => {
    setCart(prev => {
      const exists = prev.find(i => i.menuItemId === id);
      return exists
        ? prev.map(i => i.menuItemId === id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { menuItemId: id, quantity: 1 }];
    });
    const item = menuItems.find(i => i.id === id);
    toast({ title: `${item?.name} added` });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const exists = prev.find(i => i.menuItemId === id);
      if (!exists) return prev;
      if (exists.quantity === 1) return prev.filter(i => i.menuItemId !== id);
      return prev.map(i => i.menuItemId === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => cart.reduce((sum, c) => {
    const item = menuItems.find(m => m.id === c.menuItemId);
    return sum + (item?.price || 0) * c.quantity;
  }, 0);

  // PLACE ORDER
  const placeOrder = async (name: string, table: string, notes?: string) => {
    if (cart.length === 0) toast({ variant: 'destructive', title: 'Cart empty' });
    if (!name || !table) toast({ variant: 'destructive', title: 'Fill name & table' });

    try {
      await createOrder({
        customerName: name,
        tableNumber: table,
        notes,
        items: cart.map(c => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
        total: getCartTotal(),
      });
      clearCart();
      await refetch();
      toast({ title: 'Order sent to kitchen!' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to place order' });
    }
  };

  // REAL DB STATUS UPDATES
  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      await serverUpdateOrderStatus(orderId, status);
      await refetch();
      toast({ title: `Status → ${status}` });
    } catch {
      toast({ variant: 'destructive', title: 'Status update failed' });
    }
  };

  const updatePaymentStatus = async (orderId: number, status: PaymentStatus) => {
    try {
      await serverUpdatePaymentStatus(orderId, status);
      await refetch();
      toast({ title: 'Payment → Paid' });
    } catch {
      toast({ variant: 'destructive', title: 'Payment update failed' });
    }
  };

  const clearSalesData = async () => {
    try {
      await clearCompletedOrders();
      await refetch();
      toast({ title: 'Old orders cleared' });
    } catch {
      toast({ variant: 'destructive', title: 'Clear failed' });
    }
  };

  const cartItemCount = useMemo(() => cart.reduce((n, i) => n + i.quantity, 0), [cart]);

  const value: CafeContextType = {
    menuItems,
    users,
    orders,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    placeOrder,
    updateOrderStatus,
    updatePaymentStatus,
    clearSalesData,
    cartItemCount,
    loading,
    refetch,
  };

  return <CafeContext.Provider value={value}>{children}</CafeContext.Provider>;
}

export const useCafe = () => {
  const ctx = useContext(CafeContext);
  if (!ctx) throw new Error('useCafe must be inside CafeProvider');
  return ctx;
};