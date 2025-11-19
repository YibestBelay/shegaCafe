// app/api/admin/pdf/route.ts
import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const { orders } = await req.json();

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
  page.drawText(`Total Orders: ${orders.length}`, {
    x: 50,
    y,
    size: 14,
    font: fontBold,
  });

  // Table Header
  y -= 30;
  const headers = ['ID', 'Customer', 'Table', 'Total', 'Status', 'Paid', 'Time'];
  headers.forEach((h, i) => {
    page.drawText(h, { x: 50 + i * 70, y, size: 10, font: fontBold });
  });

  // Table Rows
  y -= 20;
  for (const o of orders) {
    const row = [
      `#${o.id}`,
      o.customerName.slice(0, 10),
      o.tableNumber,
      `${o.total.toFixed(2)} ETB`,
      o.status,
      o.paymentStatus,
      new Date(o.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    ];
    row.forEach((cell, i) => {
      page.drawText(cell, { x: 50 + i * 70, y, size: 9, font });
    });
    y -= 18;
    if (y < 100) {
      page = pdfDoc.addPage([600, 800]);
      ({ width, height } = page.getSize());
      y = height - 50;
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