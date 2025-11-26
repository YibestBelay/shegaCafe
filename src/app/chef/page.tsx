// app/chef/page.tsx
'use client';

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useCafe } from '@/context/CafeContext';
import OrderCard from '../components/waiter/OrderCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Package, Check, Plus, Pencil, Trash2 } from 'lucide-react';
import { NewMenuItemForm } from '@/app/components/chef/NewMenuItemForm';
import { EditMenuItem } from '@/app/components/chef/EditMenuItem';
export default function ChefPage() {
  const { data: session, status } = useSession();
  const { orders } = useCafe();

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen"><p>Loading...</p></div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-semibold mb-4">Please log in with a Chef Account</h2>
        <button onClick={() => signIn("google")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!['chef', 'Chef'].includes(session.user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">You are not authorized to view the Chef Dashboard.</p>
        <button onClick={() => signIn("google")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Sign in with a Chef Account
        </button>
      </div>
    );
  }

  const kitchenOrders = orders
    .filter(order => ['Received', 'Sent to Chef', 'Preparing', 'Ready'].includes(order.status) && order.status !== 'Cancelled')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const completedOrders = orders
    .filter(order => order.status === 'Delivered' && order.paymentStatus === 'Paid')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold flex items-center justify-center gap-3">
          <ChefHat className="h-12 w-12 text-orange-600" />
          Chef Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage kitchen and menu availability.</p>
      </div>

      <Tabs defaultValue="kitchen" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-lg mx-auto gap-2">
          <TabsTrigger value="kitchen" className="flex items-center gap-1">
            <ChefHat className="h-4 w-4" />
            Kitchen
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            Menu Control
          </TabsTrigger>
          <TabsTrigger value="completed">
            <Check className="h-4 w-4" />
            Completed</TabsTrigger>
          <TabsTrigger value="newMenuItem">
            <Plus className="h-4 w-4" />
            Add NewItem</TabsTrigger>
        </TabsList>

        {/* KITCHEN ORDERS */}
        <TabsContent value="kitchen">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {kitchenOrders.length > 0 ? (
              kitchenOrders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-10">
                No orders in the kitchen.
              </p>
            )}
          </div>
        </TabsContent>

        {/* MENU CONTROL (TOGGLE ITEMS) */}
        <TabsContent value="menu">
          <div className="mt-6">
            <p className="text-center text-muted-foreground mb-6">
              Toggle items as <strong>Sold Out</strong> for the day.
            </p>
            <MenuControlTab />
          </div>
        </TabsContent>

        {/* COMPLETED ORDERS */}
        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {completedOrders.length > 0 ? (
              completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-10">
                No completed orders.
              </p>
            )}
          </div>
        </TabsContent>
        {/* Add item to menu */}
        <TabsContent value="newMenuItem" className="space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <h2 className="text-2xl font-bold">Add New Menu Item</h2>
            <p className="text-muted-foreground">
              Fill out the form below to add a new item to the menu.
            </p>
          </div>
          <NewMenuItemForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ──────────────────────────────
// MENU CONTROL TAB (REUSABLE)
// ──────────────────────────────
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function MenuControlTab() {
  const { menuItems, toggleMenuItem, refetch } = useCafe();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const handleToggle = async (id: number, current: boolean) => {
    try {
      await toggleMenuItem(id, !current);
    } catch (err: any) {
      toast({ variant: 'destructive', title: err.message || 'Failed to update availability' });
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingItem(item);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete menu item');
      }

      toast({ title: 'Menu item deleted' });
      await refetch();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: err?.message || 'Failed to delete menu item',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map((item) => (
        <Card key={item.id} className="shadow-md">
          <CardHeader>
            <CardTitle className="flex justify-between items-center text-lg">
              {item.name}
              <Badge variant={item.isAvailable ? 'default' : 'destructive'}>
                {item.isAvailable ? 'Available' : 'Sold Out'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold">{item.price.toFixed(2)} ETB</span>
              <div className="flex items-center space-x-2">
                {item.isAvailable ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-green-500" />
                )}
                <Switch
                  checked={item.isAvailable}
                  onCheckedChange={() => handleToggle(item.id, item.isAvailable)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartEdit(item)}
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this menu item?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delte <strong>{item.name}</strong> from the menu.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600"
                      onClick={() => handleDelete(item.id)}
                    >
                      Yes, delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}

      {editingItem && (
        <EditMenuItem
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdated={async () => {
            await refetch();
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}