export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'Food' | 'Drink' | 'Dessert';
  imageId: string;
  imageUrl?: string;
  isAvailable: boolean;
};

export type OrderItem = {
  menuItem: MenuItem;
  quantity: number;
};

export type OrderStatus = 'Received' | 'Sent to Chef' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid';

export type Order = {
  id: number;
  customerName: string; 
  tableNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: string;
  total: number;
  paymentStatus: PaymentStatus;
  notes?: string;
};

export type UserRole = 'USER' | 'WAITER' | 'CHEF' | 'ADMIN';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  }
}

// Extend the built-in JWT types
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

export interface AppUser {
  id: number;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
}

export type CartItem = {
  menuItemId: number;
  quantity: number;
};
