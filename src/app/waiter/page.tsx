'use client';

import { useSession, signIn } from "next-auth/react";
import { useCafe } from '@/context/CafeContext';
import OrderCard from '../components/waiter/OrderCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function WaiterPage() {
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
        <h2 className="text-2xl font-semibold mb-4">Please log in with a Waiter Account to continue</h2>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // Signed in but not a waiter
  if (session.user.role !== "waiter") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        
        <p className="text-gray-600 mb-4">
          You are not authorized to view the Waiter Dashboard.
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Sign in with a Waiter Account
        </button>
      </div>
    );
  }

  // ✅ Authorized waiter — show dashboard
  const activeOrders = orders
    .filter(order => !(order.paymentStatus === 'Paid' && order.status === 'Delivered') && order.status !== 'Cancelled')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const completedOrders = orders
    .filter(order => order.paymentStatus === 'Paid' && order.status === 'Delivered')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Waiter Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage incoming and active orders.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {activeOrders.length > 0 ? (
              activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-10">No active orders.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {completedOrders.length > 0 ? (
              completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-10">No completed orders.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
