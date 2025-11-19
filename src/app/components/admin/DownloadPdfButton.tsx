// app/components/admin/DownloadPdfButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DownloadPdfButton({ orders }: { orders: any[] }) {
  const { toast } = useToast();

  const generatePDF = async () => {
    toast({ title: 'Generating PDF...' });

    const res = await fetch('/api/admin/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders }),
    });

    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Failed to generate PDF' });
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShegaCafe_Sales_${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: 'PDF Downloaded!', description: 'Check your Downloads folder' });
  };

  return (
    <Button onClick={generatePDF} className="gap-2">
      <Download className="h-4 w-4" />
      Download PDF Report
    </Button>
  );
}