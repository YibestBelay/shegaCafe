// app/(waiter)/OrderCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCafe } from '@/context/CafeContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Clock, CreditCard, User, Hash, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from 'next-auth/react';

const statusColors: Record<string, string> = {
  Received: 'bg-blue-500',
  'Sent to Chef': 'bg-orange-500',
  Preparing: 'bg-yellow-500 text-black',
  Ready: 'bg-green-500',
  Delivered: 'bg-gray-500',
  Cancelled: 'bg-red-500',
};

export default function OrderCard({ order }: { order: any }) {
  const { updateOrderStatus, updatePaymentStatus } = useCafe();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);

  const userRole = session?.user?.role;
  const isChef = ['Chef', 'chef'].includes(userRole || '');
  const isWaiter = ['Waiter', 'waiter'].includes(userRole || '');
  const isAdmin = ['Admin', 'admin'].includes(userRole || '');

  // CHEF: Only allow Preparing → Ready
  const chefAllowedStatuses = ['Preparing', 'Ready'];
  const waiterAllowedStatuses = ['Received', 'Sent to Chef', 'Delivered', 'Cancelled'];
  const allStatuses = ['Received', 'Sent to Chef', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

  const allowedStatuses = isChef 
    ? chefAllowedStatuses 
    : (isWaiter || isAdmin) 
      ? allStatuses 
      : [];

  const handleStatusChange = async (newStatus: string) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await updateOrderStatus(order.id, newStatus as any);
      toast({ title: `Status → ${newStatus}` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: err.message || 'Update failed' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePayment = async () => {
    if (!isWaiter && !isAdmin) return;
    try {
      await updatePaymentStatus(order.id, 'Paid');
      toast({ title: 'Paid!', description: 'Customer paid.' });
    } catch {
      toast({ variant: 'destructive', title: 'Payment failed' });
    }
  };

  const isFinal = ['Delivered', 'Cancelled'].includes(order.status);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
            <div className="text-sm text-muted-foreground mt-1 space-y-1">
              <div className="flex items-center gap-2"><User className="w-4 h-4" />{order.customerName}</div>
              <div className="flex items-center gap-2"><Hash className="w-4 h-4" />Table {order.tableNumber}</div>
            </div>
          </div>
          <Badge className={cn("text-white", statusColors[order.status])}>{order.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        {order.notes && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 mb-3 bg-muted rounded border border-dashed border-primary/30 flex gap-2">
                  <MessageSquare className="w-4 h-4 mt-0.5" />
                  <p className="text-sm italic">{order.notes}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent><p>{order.notes}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <ul className="space-y-1 text-sm">
          {order.items.map((i: any) => (
            <li key={i.menuItem.id} className="flex justify-between">
              <span>{i.menuItem.name}</span>
              <span className="text-muted-foreground">×{i.quantity}</span>
            </li>
          ))}
        </ul>

        <div className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {formatDistanceToNow(new Date(order.timestamp), { addSuffix: true })}
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3 border-t pt-3">
        <div className="w-full flex justify-between items-center">
          <span className="text-lg font-bold text-primary">
            {order.total.toFixed(2)} ETB
          </span>
          <Badge variant={order.paymentStatus === 'Paid' ? 'secondary' : 'destructive'}>
            {order.paymentStatus}
          </Badge>
        </div>

        {/* PAYMENT BUTTON — WAITER & ADMIN ONLY */}
        {(isWaiter || isAdmin) && order.paymentStatus === 'Pending' && (
          <Button onClick={handlePayment} className="w-full" disabled={isUpdating}>
            <CreditCard className="mr-2 h-4 w-4" />
            Mark as Paid
          </Button>
        )}

        {/* STATUS SELECT — ROLE-BASED OPTIONS */}
        {allowedStatuses.length > 0 && !isFinal && (
          <Select
            onValueChange={handleStatusChange}
            value={order.status}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedStatuses.map(s => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* FINAL STATUS — NO CHANGES */}
        {isFinal && (
          <div className="w-full text-center text-muted-foreground text-sm">
            Order is {order.status.toLowerCase()}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}