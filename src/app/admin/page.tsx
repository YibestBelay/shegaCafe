'use client';

import { useSession, signIn } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesReport from '../components/admin/SalesReport';
import UserManagement from '../components/admin/UserManagement';
import UnpaidOrdersReport from '../components/admin/UnpaidOrdersReport';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();

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
      <div className=" flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <h2 className="text-2xl font-semibold mb-4">Please log in with an Admin Account to continue</h2>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // Signed in but not an admin
  if (session.user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-gray-600 mb-4">
          You are not authorized to view the Admin Dashboard.
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Sign in with an Admin Account
        </button>
      </div>
    );
  }

  // ✅ Authorized admin — show dashboard
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage users and view sales reports.</p>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid Orders</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <SalesReport />
        </TabsContent>
        <TabsContent value="unpaid">
          <UnpaidOrdersReport />
        </TabsContent>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>      
    </div>
  );
}
