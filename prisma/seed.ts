// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {


  // Seed MenuItems
  const menuItems = [
    { name: 'Cappuccino', description: 'Classic espresso with steamed milk foam.', price: 3.50, category: 'Drink', imageId: 'cappuccino' },
    { name: 'Espresso', description: 'A strong shot of concentrated coffee.', price: 2.50, category: 'Drink', imageId: 'espresso' },
    { name: 'Iced Latte', description: 'Chilled espresso with milk over ice.', price: 4.00, category: 'Drink', imageId: 'iced-latte' },
    { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice.', price: 4.50, category: 'Drink', imageId: 'fresh-juice' },
    { name: 'Butter Croissant', description: 'Flaky and buttery, baked fresh.', price: 2.75, category: 'Food', imageId: 'croissant' },
    { name: 'Spaghetti Aglio e Olio', isAvailable: false, description: 'A timeless Italian classic, this pasta dish features spaghetti tossed with sautéed garlic in olive oil, red pepper flakes for a touch of heat, and fresh parsley. A simple yet profoundly flavorful meal.', price: 12.50, category: 'Food', imageId: 'pasta-aglio-e-olio' },
    { name: 'Club Sandwich', description: 'Triple-decker with chicken, bacon, and lettuce.', price: 10.50, category: 'Food', imageId: 'club-sandwich' },
    { name: 'Margherita Pizza', description: 'A true Italian classic, this pizza features a light tomato sauce, fresh mozzarella, aromatic basil leaves, and a drizzle of olive oil on a perfectly crisp crust. Simple, fresh, and delicious.', price: 14.00, category: 'Food', imageId: 'margherita-pizza' },
    { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey center.', price: 6.50, category: 'Dessert', imageId: 'chocolate-cake' },
    { name: 'NY Cheesecake', description: 'Creamy cheesecake with a graham cracker crust.', price: 5.75, category: 'Dessert', imageId: 'cheesecake' },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
  }

  // Seed Users
  const users = [
    { name: 'Yibe', role: 'Admin', email: 'yibestbelay@gmail.com' },
    { name: 'Alex', role: 'Waiter', email: 'waiter@shegacafe.com' },
    { name: 'Ben', role: 'Chef', email: 'chef@shegacafe.com' },
    { name: 'John Doe', role: 'Customer', email: 'customer@shegacafe.com' },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  // No orders seeded - orders table will remain empty

  console.log('Seeding completed. Orders are empty.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });