// app/chef/menu/page.tsx
'use client';

import { useSession, signIn } from "next-auth/react";
import { useCafe } from '@/context/CafeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ChefHat } from 'lucide-react';
import { toggleMenuItemAvailability } from '@/app/actions'; // ← DIRECT SERVER ACTION

export default function ChefMenuManagement() {
  const { data: session, status } = useSession();
  const { menuItems: allItems, refetch } = useCafe();
  const { toast } = useToast();

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
        <p className="text-gray-600 mb-4">Chef access only.</p>
        <button onClick={() => signIn("google")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Sign in as Chef
        </button>
      </div>
    );
  }

  const toggleAvailability = async (itemId: number, currentAvailable: boolean) => {
    try {
      // USE SERVER ACTION DIRECTLY (NO API ROUTE NEEDED)
      await toggleMenuItemAvailability(itemId, !currentAvailable);
      await refetch();
      toast({
        title: 'Updated!',
        description: !currentAvailable ? 'Item is now available' : 'Item hidden (sold out)',
      });
    } catch (err: any) {
      toast({ variant: 'destructive', title: err.message || 'Failed to update' });
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold flex items-center justify-center gap-3">
          <ChefHat className="h-12 w-12 text-orange-600" />
          Menu Control
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Toggle items as sold out for the day.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allItems.map((item) => (
          <Card key={item.id} className="shadow-md">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {item.name}
                <Badge variant={item.isAvailable ? 'default' : 'destructive'}>
                  {item.isAvailable ? 'Available' : 'Sold Out'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{item.price.toFixed(2)} ETB</span>
                <div className="flex items-center space-x-2">
                  {item.isAvailable ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-green-500" />
                  )}
                  <Switch
                    checked={item.isAvailable}
                    onCheckedChange={() => toggleAvailability(item.id, item.isAvailable)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}