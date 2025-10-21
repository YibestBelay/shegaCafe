'use client';

import { useSession, signIn } from "next-auth/react";
import { useCafe } from '@/context/CafeContext';
import KitchenOrderView from '../components/chef/KitchenOrderView';

export default function ChefPage() {
  const { data: session, status } = useSession();
  const { orders } = useCafe();

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Not signed in
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <h2 className="text-2xl font-semibold mb-4">Please log in with a Chef Account to continue</h2>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // Signed in but not a chef
  if (session.user.role !== "chef") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-gray-600 mb-4">
          You are not authorized to view the Chef Dashboard.
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Sign in with a Chef Account
        </button>
      </div>
    );
  }

  // ✅ Authorized chef — show kitchen orders
  const ordersForKitchen = orders
    .filter((order) => ['Sent to Chef', 'Preparing'].includes(order.status))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Kitchen Orders</h1>
        <p className="mt-2 text-lg text-muted-foreground">Current orders for preparation.</p>
      </div>
      {ordersForKitchen.length > 0 ? (
        <KitchenOrderView orders={ordersForKitchen} />
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No orders in the kitchen right now.</p>
        </div>
      )}
    </div>
  );
}
