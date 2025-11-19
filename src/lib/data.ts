import type { MenuItem, AppUser, Order } from './types';

export const menuItems: MenuItem[] = [
  { id: 1, name: 'Cappuccino', description: 'Classic espresso with steamed milk foam.', price: 3.50, category: 'Drink', imageId: 'cappuccino' },
  { id: 2, name: 'Espresso', description: 'A strong shot of concentrated coffee.', price: 2.50, category: 'Drink', imageId: 'espresso' },
  { id: 3, name: 'Iced Latte', description: 'Chilled espresso with milk over ice.', price: 4.00, category: 'Drink', imageId: 'iced-latte' },
  { id: 4, name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice.', price: 4.50, category: 'Drink', imageId: 'fresh-juice' },
  { id: 5, name: 'Butter Croissant', description: 'Flaky and buttery, baked fresh.', price: 2.75, category: 'Food', imageId: 'croissant' },
  { id: 6, name: 'Spaghetti Aglio e Olio', description: 'A timeless Italian classic, this pasta dish features spaghetti tossed with sautéed garlic in olive oil, red pepper flakes for a touch of heat, and fresh parsley. A simple yet profoundly flavorful meal.', price: 12.50, category: 'Food', imageId: 'pasta-aglio-e-olio' },
  { id: 7, name: 'Club Sandwich', description: 'Triple-decker with chicken, bacon, and lettuce.', price: 10.50, category: 'Food', imageId: 'club-sandwich' },
  { id: 10, name: 'Margherita Pizza', description: 'A true Italian classic, this pizza features a light tomato sauce, fresh mozzarella, aromatic basil leaves, and a drizzle of olive oil on a perfectly crisp crust. Simple, fresh, and delicious.', price: 14.00, category: 'Food', imageId: 'margherita-pizza'},
  { id: 8, name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey center.', price: 6.50, category: 'Dessert', imageId: 'chocolate-cake' },
  { id: 9, name: 'NY Cheesecake', description: 'Creamy cheesecake with a graham cracker crust.', price: 5.75, category: 'Dessert', imageId: 'cheesecake' },
];

export const users: AppUser[] = [
  { id: 1, name: 'Admin User', role: 'ADMIN', phone: '+11234567890', email: 'admin@shegacafe.com' },
  { id: 2, name: 'Alex', role: 'WAITER', phone: '+12345678901', email: 'waiter@shegacafe.com' },
  { id: 3, name: 'Ben', role: 'CHEF', phone: '+13456789012', email: 'chef@shegacafe.com' },
  { id: 4, name: 'John Doe', role: 'USER', phone: '+14567890123', email: 'customer@shegacafe.com' },
];

export const initialOrders: Order[] = [
  { 
    id: 1, 
    customerName: 'Alice', 
    tableNumber: '5',
    items: [
      { menuItem: menuItems[0], quantity: 1 }, 
      { menuItem: menuItems[5], quantity: 1 }
    ], 
    status: 'Received', 
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(), 
    total: 16.00,
    paymentStatus: 'Pending'
  },
  { 
    id: 2, 
    customerName: 'Bob', 
    tableNumber: '2',
    items: [
      { menuItem: menuItems[2], quantity: 2 }, 
    ], 
    status: 'Sent to Chef', 
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    total: 8.00,
    paymentStatus: 'Pending'
  },
  { 
    id: 3, 
    customerName: 'Charlie (Takeaway)', 
    tableNumber: '-',
    items: [
      { menuItem: menuItems[6], quantity: 1 }, 
      { menuItem: menuItems[8], quantity: 1 }
    ], 
    status: 'Preparing', 
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    total: 17.00,
    paymentStatus: 'Paid'
  },
  { 
    id: 4, 
    customerName: 'Diana', 
    tableNumber: '8',
    items: [
      { menuItem: menuItems[7], quantity: 1 }, 
    ], 
    status: 'Ready', 
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    total: 6.50,
    paymentStatus: 'Pending'
  },
    { 
    id: 5, 
    customerName: 'Eve', 
    tableNumber: '3',
    items: [
      { menuItem: menuItems[1], quantity: 1 },
      { menuItem: menuItems[4], quantity: 1 },
    ], 
    status: 'Delivered', 
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    total: 5.25,
    paymentStatus: 'Paid'
  },
];
