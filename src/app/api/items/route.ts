// app/api/items/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MenuItem } from "@/lib/types";

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, category, imageId } = body;

    // Input validation
    if (!name || !description || typeof price !== 'number' || !category || !imageId) {
      return NextResponse.json(
        { error: 'Missing required fields or invalid types' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['Food', 'Drink', 'Dessert'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: Food, Drink, Dessert' },
        { status: 400 }
      );
    }

    // Create new menu item
    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        category,
        imageId,
        isAvailable: true,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A menu item with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}