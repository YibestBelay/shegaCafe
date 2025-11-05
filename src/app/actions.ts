// src/app/actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { OrderStatus, PaymentStatus, MenuItem } from '@/lib/types';

// ------------------------------------------------------------------
// Helper: get logged-in user (SAFE — returns null if not logged in)
// ------------------------------------------------------------------
async function getUserOrNull() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, name: true },
    });
    return user;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// 1. MENU — FILTERED BY ROLE (CHEF & ADMIN SEE ALL)
// ------------------------------------------------------------------
export async function getMenuItems(userRole?: string): Promise<MenuItem[]> {
  const rows = await prisma.menuItem.findMany({
    orderBy: { id: 'asc' },
  });

  const CATEGORY_VALUES = ['Food', 'Drink', 'Dessert'] as const;
  function isCategory(x: string): x is MenuItem['category'] {
    return (CATEGORY_VALUES as readonly string[]).includes(x);
  }

  // CHEF & ADMIN: See all items (including hidden)
  const isStaff = userRole && ['chef', 'admin'].includes(userRole.toLowerCase());
  
  // STRICT FILTER: ONLY SHOW isAvailable === true FOR NON-STAFF
  const filtered = isStaff ? rows : rows.filter(r => r.isAvailable === true);

  return filtered.map(r => ({
    ...r,
    category: isCategory(r.category) ? r.category : 'Food',
  }));
}

// ------------------------------------------------------------------
// 2. TOGGLE ITEM AVAILABILITY (Chef & Admin only)
// ------------------------------------------------------------------
export async function toggleMenuItemAvailability(itemId: number, isAvailable: boolean) {
  const user = await getUserOrNull();
  if (!user || !['chef', 'admin'].includes(user.role.toLowerCase())) {
    throw new Error('Chef or Admin only');
  }

  return prisma.menuItem.update({
    where: { id: itemId },
    data: { isAvailable },
  });
}

// ------------------------------------------------------------------
// 3. USERS (Admin only)
// ------------------------------------------------------------------
export async function getUsers() {
  const user = await getUserOrNull();
  if (!user || user.role.toLowerCase() !== 'admin') throw new Error('Admin only');

  return prisma.user.findMany({
    select: { id: true, name: true, role: true, email: true },
  });
}

// ------------------------------------------------------------------
// 4. ORDERS (PUBLIC READ)
// ------------------------------------------------------------------
export async function getOrders() {
  return prisma.order.findMany({
    include: {
      items: {
        include: { menuItem: true },
        orderBy: { id: 'asc' },
      },
    },
    orderBy: { timestamp: 'desc' },
  });
}

// ──────────────────────────────────────────────────────────────
// 5. PLACE ORDER → GUEST + CUSTOMER + WAITER (NOT Chef/Admin)
// ──────────────────────────────────────────────────────────────
export async function createOrder(data: {
  customerName: string;
  tableNumber: string;
  items: { menuItemId: number; quantity: number }[];
  total: number;
  notes?: string;
}) {
  const user = await getUserOrNull();

  // Block Chef & Admin from placing orders
  if (user && ['chef', 'admin'].includes(user.role.toLowerCase())) {
    throw new Error('Chefs & Admins cannot place orders');
  }

  return prisma.order.create({
    data: {
      customerName: data.customerName,
      tableNumber: data.tableNumber,
      notes: data.notes,
      total: data.total,
      paymentStatus: 'Pending',
      status: 'Received',
      items: {
        create: data.items.map(i => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: { include: { menuItem: true } } },
  });
}

// ------------------------------------------------------------------
// 6. UPDATE STATUS → Waiter, Chef, Admin
// ------------------------------------------------------------------
export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  const user = await getUserOrNull();
  if (!user) throw new Error('Login required');
  if (!['waiter', 'chef', 'admin'].includes(user.role.toLowerCase())) {
    throw new Error('Only Waiter, Chef, or Admin can update status');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status, timestamp: new Date() },
  });
}

// ------------------------------------------------------------------
// 7. UPDATE PAYMENT → Waiter & Admin only
// ------------------------------------------------------------------
export async function updatePaymentStatus(orderId: number, status: PaymentStatus) {
  const user = await getUserOrNull();
  if (!user) throw new Error('Login required');
  if (!['waiter', 'admin'].includes(user.role.toLowerCase())) {
    throw new Error('Only Waiter or Admin can update payment');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: status },
  });
}

// ------------------------------------------------------------------
// 8. CLEAR COMPLETED ORDERS (Admin only)
// ------------------------------------------------------------------
export async function clearCompletedOrders() {
  const user = await getUserOrNull();
  if (!user || user.role.toLowerCase() !== 'admin') throw new Error('Admin only');

  await prisma.orderItem.deleteMany({
    where: {
      order: {
        status: { in: ['Delivered', 'Cancelled'] },
        paymentStatus: 'Paid',
      },
    },
  });

  await prisma.order.deleteMany({
    where: {
      status: { in: ['Delivered', 'Cancelled'] },
      paymentStatus: 'Paid',
    },
  });
}
// src/app/actions.ts
export async function deleteOrder(orderId: number) {
  const user = await getUserOrNull();
  if (!user || user.role.toLowerCase() !== 'admin') {
    throw new Error('Admin only');
  }

  // Delete order items first
  await prisma.orderItem.deleteMany({
    where: { orderId },
  });

  // Then delete order
  await prisma.order.delete({
    where: { id: orderId },
  });
}