// app/components/admin/SalesReport.tsx
'use client';

import { useEffect, useState } from 'react'; // ← ADD THIS
import DownloadPdfButton from './DownloadPdfButton';
import { useCafe } from '@/context/CafeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

export default function SalesReport() {
  const { orders, clearSalesData } = useCafe();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false); // ← FIX HYDRATION

  useEffect(() => {
    setMounted(true);
  }, []);

  const completedOrders = orders.filter(o => o.status === 'Delivered' && o.paymentStatus === 'Paid');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = completedOrders.length;

  const handleDelete = async () => {
    await clearSalesData();
    toast({ title: "Deleted!", description: `${totalOrders} orders gone forever.`, variant: "destructive" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-3xl">Sales Report</CardTitle>
            <CardDescription>
              {totalOrders} paid orders • {totalRevenue.toFixed(0)} ETB
            </CardDescription>
          </div>

          {/* ← ONLY RENDER BUTTONS AFTER MOUNT */}
          {mounted && (
            <div className="flex gap-3">
              <DownloadPdfButton orders={completedOrders} />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={totalOrders === 0}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Forever?</AlertDialogTitle>
                    <AlertDialogDescription>
                      <strong>{totalOrders} orders</strong> and <strong>{totalRevenue.toFixed(0)} ETB</strong> will vanish.
                      <br />Download PDF first!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                      Yes, Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {totalOrders === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-xl">
            No sales yet. First customer incoming! ☕
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedOrders.map(o => (
                <TableRow key={o.id}>
                  <TableCell>#{o.id}</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell>{new Date(o.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{o.total.toFixed(2)} ETB</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="font-bold text-lg">
                <TableCell colSpan={2}>TOTAL</TableCell>
                <TableCell>{totalOrders} orders</TableCell>
                <TableCell className="text-right text-primary">
                  {totalRevenue.toFixed(2)} ETB
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}