// app/components/MenuItemCard.tsx
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCafe } from '@/context/CafeContext';
import { PlusCircle } from 'lucide-react';
import placeholderImagesData from '@/lib/placeholder-images.json';

interface MenuItemCardProps {
  item: MenuItem;
}

// Extract the placeholderImages array from the imported data
const placeholderImages = placeholderImagesData.placeholderImages;

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart } = useCafe();
  // Find the matching placeholder image based on item.imageId
  const placeholder = placeholderImages.find(p => p.id === item.imageId);
  
  // Log for debugging
  console.log('Item:', { id: item.id, name: item.name, imageId: item.imageId, imageUrl: item.imageUrl });
  console.log('Found placeholder:', placeholder);
  
  // Use item.imageUrl if it exists, otherwise use the placeholder's imageUrl
  const imageToRender =(placeholder ? placeholder.imageUrl : '') ||  item.imageUrl;
  console.log('Image to render:', imageToRender);

  // HIDE IF NOT AVAILABLE
  if (!item.isAvailable) return null;

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="p-0">
        <div className="relative aspect-[5/3] w-full">
          {imageToRender ? (
            <Image
              src={imageToRender}
              alt={item.name}
              fill
              className="object-cover"
              data-ai-hint={placeholder?.imageHint}
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
      </CardHeader>

      <CardContent className=" relative aspect-[5/3] p-4  overflow-auto scrollbar-hide">
        <CardTitle className="font-headline text-sm md:text-lg mb-2">{item.name}</CardTitle>
        <p className="text-sm text-muted-foreground ">{item.description}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center gap-2 ">
        <p className="text-sm font-bold text-primary">{item.price.toFixed(2)} ETB</p>
        <Button onClick={() => addToCart(item.id)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add to Order
        </Button>
      </CardFooter>
    </Card>
  );
}