// app/api/items/route.ts
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

async function uploadFileToCloudinary(file: File) {
  const maxBytes = 8 * 1024 * 1024; // 8 MB
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

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    let name: string | undefined;
    let description: string | undefined;
    let price: number | undefined;
    let category: string | undefined;
    let imageId: string | null = null;
    let imageUrl: string | null = null;
    let cloudinaryId: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = (formData.get("name") as string | null)?.trim() ?? undefined;
      description = (formData.get("description") as string | null)?.trim() ?? undefined;
      const priceRaw = formData.get("price") as string | null;
      price = priceRaw ? parseFloat(priceRaw) : undefined;
      category = (formData.get("category") as string | null) ?? undefined;
      imageId = (formData.get("imageId") as string | null) ?? null;
      const file = formData.get("image") as File | null;

      if (file && file.name) {
        const uploaded = await uploadFileToCloudinary(file);
        imageUrl = uploaded.secure_url;
        cloudinaryId = uploaded.public_id;
      } else if (imageId) {
        const placeholder = placeholderImages.find((p) => p.id === imageId);
        if (!placeholder) {
          return NextResponse.json({ error: "Invalid imageId" }, { status: 400 });
        }
        imageUrl = placeholder.imageUrl;
        cloudinaryId = null;
      }
    } else {
      const body = await request.json();
      name = body.name?.trim();
      description = body.description?.trim();
      price = typeof body.price === "number" ? body.price : (body.price ? parseFloat(body.price) : undefined);
      category = body.category;
      imageId = body.imageId ?? null;
      if (body.imageUrl) {
        imageUrl = body.imageUrl;
        cloudinaryId = body.cloudinaryId ?? null;
      } else if (imageId) {
        const placeholder = placeholderImages.find((p) => p.id === imageId);
        if (!placeholder) {
          return NextResponse.json({ error: "Invalid imageId" }, { status: 400 });
        }
        imageUrl = placeholder.imageUrl;
        cloudinaryId = null;
      }
    }

    // Validate
    if (!name || !description || typeof price !== "number" || Number.isNaN(price) || !category) {
      return NextResponse.json({ error: "Missing required fields or invalid types" }, { status: 400 });
    }
    const validCategories = ["Food", "Drink", "Dessert"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category. Must be one of: Food, Drink, Dessert" }, { status: 400 });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        category,
        imageUrl: imageUrl ?? null,
        cloudinaryId: cloudinaryId ?? null,
        imageId: imageId ?? null,
        isAvailable: true,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error("Error creating menu item:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A menu item with this name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
