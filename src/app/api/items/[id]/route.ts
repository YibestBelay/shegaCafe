// app/api/items/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import placeholderImagesData from "@/lib/placeholder-images.json";

const { placeholderImages } = placeholderImagesData;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type Context = { params: { id: string } };

async function uploadFileToCloudinary(file: File) {
  const maxBytes = 8 * 1024 * 1024; // 8MB
  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > maxBytes) {
    throw new Error("File too large (max 8 MB)");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type. Only images are allowed.");
  }
  const buffer = Buffer.from(arrayBuffer);
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUri,
      {
        folder: "menu-items",
        resource_type: "image",
        transformation: [{ width: 1200, height: 1200, crop: "limit" }],
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export async function GET(_request: Request, context: Context) {
  try {
    const id = parseInt(context.params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return NextResponse.json({ error: "Failed to fetch menu item" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    const id = parseInt(context.params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Fetch existing item so we can delete old cloudinary image if needed
    const existing = await prisma.menuItem.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        imageId: true,
        imageUrl: true,
        cloudinaryId: true,
        isAvailable: true
      }
    });
    if (!existing) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const contentType = request.headers.get("content-type") ?? "";

    let name: string | undefined;
    let description: string | undefined;
    let price: number | undefined;
    let category: string | undefined;
    let isAvailable: boolean | undefined;
    let imageId: string | null = null;
    let imageUrl: string | null = existing.imageUrl ?? null;
    // Removed cloudinaryId as we're using imageId instead

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = (formData.get("name") as string | null)?.trim() ?? existing.name;
      description = (formData.get("description") as string | null)?.trim() ?? existing.description;
      const priceRaw = formData.get("price") as string | null;
      price = priceRaw ? parseFloat(priceRaw) : existing.price;
      category = (formData.get("category") as string | null) ?? existing.category;
      isAvailable = (formData.get("isAvailable") as string | null) ? (formData.get("isAvailable") === "true") : existing.isAvailable;
      imageId = (formData.get("imageId") as string | null) ?? null;
      const file = formData.get("image") as File | null;

      if (file && file.name) {
        // upload new file
        const uploaded = await uploadFileToCloudinary(file);
        imageUrl = uploaded.secure_url;
        imageId = uploaded.public_id;

        // delete old cloudinary image if it exists
        if (existing.imageId) {
          try {
            await cloudinary.uploader.destroy(existing.imageId);
          } catch (err) {
            console.warn("Failed to delete old cloudinary image:", err);
          }
        }
      } else if (imageId) {
        const placeholder = placeholderImages.find((p) => p.id === imageId);
        if (!placeholder) {
          return NextResponse.json({ error: "Invalid imageId" }, { status: 400 });
        }
        imageUrl = placeholder.imageUrl;
        // If switching to placeholder, delete old cloudinary image if present
        if (existing.imageId) {
          try {
            await cloudinary.uploader.destroy(existing.imageId);
          } catch (err) {
            console.warn("Failed to delete old cloudinary image:", err);
          }
        }
      }
    } else {
      const body = await request.json();
      name = body.name?.trim() ?? existing.name;
      description = body.description?.trim() ?? existing.description;
      price = typeof body.price === "number" ? body.price : (body.price ? parseFloat(body.price) : existing.price);
      category = body.category ?? existing.category;
      isAvailable = typeof body.isAvailable === "boolean" ? body.isAvailable : existing.isAvailable;
      imageId = body.imageId ?? null;

      if (body.imageUrl) {
        imageUrl = body.imageUrl;
        // If replacing an image with a new one, attempt deletion of existing
        if (existing.imageId && body.imageId && existing.imageId !== body.imageId) {
          try {
            await cloudinary.uploader.destroy(existing.imageId);
          } catch (err) {
            console.warn("Failed to delete old cloudinary image:", err);
          }
        }
      } else if (imageId) {
        const placeholder = placeholderImages.find((p) => p.id === imageId);
        if (!placeholder) {
          return NextResponse.json({ error: "Invalid imageId" }, { status: 400 });
        }
        imageUrl = placeholder.imageUrl;
        if (existing.imageId) {
          try {
            await cloudinary.uploader.destroy(existing.imageId);
          } catch (err) {
            console.warn("Failed to delete old cloudinary image:", err);
          }
        }
      }
    }

    // Validate category if provided
    const validCategories = ["Food", "Drink", "Dessert"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category. Must be one of: Food, Drink, Dessert" }, { status: 400 });
    }

    // Update in DB
    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price,
        category,
        isAvailable,
        imageUrl: imageUrl ?? null,
        imageId: imageId ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating menu item:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A menu item with this name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const id = parseInt(context.params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // fetch existing to know imageId
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // delete cloudinary image if present
    if (existing.imageId) {
      try {
        await cloudinary.uploader.destroy(existing.imageId);
      } catch (err) {
        console.warn("Failed to delete cloudinary image on item delete:", err);
      }
    }

    await prisma.menuItem.delete({ where: { id } });

    return NextResponse.json({ message: "Menu item deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting menu item:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}
