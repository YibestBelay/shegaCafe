'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import placeholderImagesData from '@/lib/placeholder-images.json';

const { placeholderImages } = placeholderImagesData;

const CATEGORIES = ['Food', 'Drink', 'Dessert'] as const;

export function NewMenuItemForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          isAvailable: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add menu item');
      }

      toast({
        title: 'Success!',
        description: 'Menu item added successfully',
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        imageId: ''
      });

      // Refresh the page to show the new item
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add menu item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-6 bg-card rounded-lg shadow">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Margherita Pizza"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="A delicious pizza with..."
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (ETB)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 12.99"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Select an Image</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {placeholderImages.map((img) => (
            <div
              key={img.id}
              className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                formData.imageId === img.id ? 'ring-2 ring-primary' : 'border-border'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, imageId: img.id }))}
            >
              <img
                src={img.imageUrl}
                alt={img.description}
                className="w-full h-24 object-cover"
              />
              <div className="p-2 text-xs text-center truncate">{img.id}</div>
            </div>
          ))}
        </div>
        {!formData.imageId && (
          <p className="text-sm text-destructive">Please select an image</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Adding...' : 'Add Menu Item'}
      </Button>
    </form>
  );
}
