// app/admin/reports/UnpaidOrdersReport.tsx
'use client';

import { useCafe } from '@/context/CafeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { deleteOrder } from '@/app/actions';

export default function UnpaidOrdersReport() {
  const { orders, refetch } = useCafe();
  const { toast } = useToast();

  const unpaidOrders = orders
    .filter(
      (order) => (order.status === 'Delivered' || order.status === 'Cancelled') && order.paymentStatus === 'Pending'
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalUnpaidRevenue = unpaidOrders.reduce((sum, order) => sum + order.total, 0);

  const handleDelete = async (orderId: number) => {
    if (!confirm('Delete this unpaid order permanently?')) return;

    try {
      await deleteOrder(orderId);
      await refetch();
      toast({ title: 'Order deleted', description: `Order #${orderId} removed.` });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to delete order' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Unpaid Orders</CardTitle>
        <CardDescription>
          A list of all completed or cancelled orders that are still pending payment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unpaidOrders.length > 0 ? (
              unpaidOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(order.timestamp), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">{order.total.toFixed(2)} ETB</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(order.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No unpaid orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>
                <span className="font-bold">Total Unpaid Orders: {unpaidOrders.length}</span>
              </TableCell>
              <TableCell className="text-right font-bold">Total Unpaid</TableCell>
              <TableCell className="text-right font-bold text-destructive">
                {totalUnpaidRevenue.toFixed(2)} ETB
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}