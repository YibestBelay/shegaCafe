// app/api/chef/menu-toggle/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !['Chef', 'chef', 'Admin', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Chef or Admin only' }, { status: 403 });
  }

  const { itemId, isAvailable } = await req.json();

  try {
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}