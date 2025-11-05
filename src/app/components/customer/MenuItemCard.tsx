// app/components/MenuItemCard.tsx
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCafe } from '@/context/CafeContext';
import placeholderImagesData from '@/lib/placeholder-images.json';
import { PlusCircle } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
}

const { placeholderImages } = placeholderImagesData;

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart } = useCafe();
  const placeholder = placeholderImages.find(p => p.id === item.imageId);

  // HIDE IF NOT AVAILABLE
  if (!item.isAvailable) return null;

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] w-full">
          {placeholder && (
            <Image
              src={placeholder.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              data-ai-hint={placeholder.imageHint}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-2">{item.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">{item.price.toFixed(2)} ETB</p>
        <Button onClick={() => addToCart(item.id)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add to Order
        </Button>
      </CardFooter>
    </Card>
  );
}