// app/api/items/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: { id: string };
};

export async function GET(_request: Request, context: Context) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: parseInt(context.params.id) },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    const body = await request.json();
    const { name, description, price, category, imageId, isAvailable } = body;
    const id = parseInt(context.params.id);

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

    // Update the menu item
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price,
        category,
        imageId,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A menu item with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const id = parseInt(context.params.id);

    // Hard delete: remove the record from the database
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Menu item deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}