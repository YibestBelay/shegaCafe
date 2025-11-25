// app/api/admin/pdf/route.ts
import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type PdfOrder = {
  id: number;
  customerName: string;
  tableNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  timestamp: string;
  items?: {
    menuItemId: number;
    quantity: number;
    menuItem?: { id: number; name: string };
  }[];
};

function wrapText(text: string, maxChars: number) {
  if (!text) return ['-'];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  words.forEach(word => {
    if ((current + word).length <= maxChars) {
      current = current ? `${current} ${word}` : word;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const { orders } = await req.json();
  const typedOrders = (orders as PdfOrder[]) ?? [];

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let { width, height } = page.getSize();
  let y = height - 50;

  // Title
  page.drawText('SHEGA CAFE - SALES REPORT', {
    x: 50,
    y,
    size: 24,
    font: fontBold,
    color: rgb(0.2, 0.4, 0.8),
  });

  y -= 40;
  page.drawText(`Generated: ${new Date().toLocaleString('en-ET')}`, {
    x: 50,
    y,
    size: 12,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  y -= 30;
  page.drawText(`Total Orders: ${typedOrders.length}`, {
    x: 50,
    y,
    size: 14,
    font: fontBold,
  });

  // Table Header
  y -= 30;
  const columns = [
    { label: 'Customer', width: 90, getValue: (o: PdfOrder) => o.customerName },
    {
      label: 'Items',
      width: 220,
      getValue: (o: PdfOrder) =>
        o.items?.length ? o.items.map(item => `${item.quantity}x ${item.menuItem?.name ?? `Item #${item.menuItemId}`}`).join(', ') : '-',
    },
    { label: 'Table', width: 60, getValue: (o: PdfOrder) => o.tableNumber },
    { label: 'Total', width: 70, getValue: (o: PdfOrder) => `${o.total.toFixed(2)} ETB` },
    {
      label: 'Time',
      width: 70,
      getValue: (o: PdfOrder) => new Date(o.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    },
  ] as const;

  let currentX = 50;
  const columnPositions = columns.map(col => {
    const pos = currentX;
    currentX += col.width;
    return pos;
  });

  const itemColumnIndex = columns.findIndex(col => col.label === 'Items');
  if (itemColumnIndex === -1) {
    throw new Error('Items column definition missing');
  }

  columns.forEach((col, idx) => {
    page.drawText(col.label, { x: columnPositions[idx], y, size: 10, font: fontBold });
  });

  const lineHeight = 14;

  // Table Rows
  y -= 18;
  for (const o of typedOrders) {
    const itemsText = columns[itemColumnIndex].getValue(o);
    const itemLines = wrapText(itemsText, 50);
    const rowLines = Math.max(1, itemLines.length);
    const rowHeight = rowLines * lineHeight;

    columns.forEach((col, idx) => {
      const value = col.label === 'Items' ? null : col.getValue(o);
      if (idx === itemColumnIndex) {
        itemLines.forEach((line, lineIdx) => {
          page.drawText(line, {
            x: columnPositions[idx],
            y: y - lineIdx * lineHeight,
            size: 9,
            font,
          });
        });
      } else {
        page.drawText(value ?? '-', {
          x: columnPositions[idx],
          y,
          size: 9,
          font,
        });
      }
    });

    y -= rowHeight + 6;
    if (y < 100) {
      page = pdfDoc.addPage([600, 800]);
      ({ width, height } = page.getSize());
      y = height - 50;
      columns.forEach((col, idx) => {
        page.drawText(col.label, { x: columnPositions[idx], y, size: 10, font: fontBold });
      });
      y -= 18;
    }
  }

  // Footer
  page.drawText('Thank you for choosing Shega Cafe!', {
    x: 50,
    y: 50,
    size: 10,
    font,
    color: rgb(0.7, 0.7, 0.7),
  });

  const pdfBytes = await pdfDoc.save();
  const view = new Uint8Array(pdfBytes.length);
  view.set(pdfBytes);
  const blob = new Blob([view.buffer], { type: 'application/pdf' });
  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=sales-report.pdf',
    },
  });
}