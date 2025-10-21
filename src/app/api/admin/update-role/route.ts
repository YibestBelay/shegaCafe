import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// ✅ GET: Fetch all users
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { createdAt: 'desc' }
    });
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
  }
}

// ✅ POST: Add a new user or update existing user's role
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }

  const { userId, name, email, role } = await req.json();

  if ((!email && !userId) || !role) {
    return new Response(JSON.stringify({ error: "Missing userId/email or role" }), { status: 400 });
  }

  try {
    if (userId) {
      // Update role of existing user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role, name },
      });
      return new Response(JSON.stringify(updatedUser), { status: 200 });
    }

    // Add new user if email is provided and userId is not
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Update role if user already exists
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role, name: name || existingUser.name },
      });
      return new Response(JSON.stringify(updatedUser), { status: 200 });
    }

    const newUser = await prisma.user.create({
      data: { email, name, role },
    });
    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to add/update user" }), { status: 500 });
  }
}

// ✅ DELETE: Remove a user
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
    }

    // Prevent admin from deleting themselves accidentally
    if (session.user.id === userId) {
      return new Response(JSON.stringify({ error: "You cannot delete your own account." }), { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return new Response(JSON.stringify({ message: "User deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to delete user" }), { status: 500 });
  }
}
