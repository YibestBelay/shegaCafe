'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

const DEFAULT_CATEGORIES = ['Food', 'Drink', 'Dessert'] as const;
const NEW_CATEGORY_OPTION = 'add-new-category';

export function NewMenuItemForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',     // selected existing category
    newCategory: '',  // typed new category (when adding)
  });

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0] ?? null;
    setFile(chosen);
    if (chosen) setFilePreview(URL.createObjectURL(chosen));
    else setFilePreview(null);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic client-side validation
      if (!formData.name.trim()) throw new Error('Please provide a name');
      if (!formData.description.trim()) throw new Error('Please provide a description');

      const priceNum = Number(formData.price);
      if (!formData.price || Number.isNaN(priceNum) || priceNum < 0) {
        throw new Error('Please provide a valid price');
      }

      if (!file) throw new Error('Please upload an image');

      // Choose category: either the existing selected category or the typed newCategory
      const categoryToUse = showNewCategoryInput ? formData.newCategory.trim() : formData.category.trim();

      if (!categoryToUse) throw new Error('Please select or enter a category');

      // Build form data for multipart upload
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('description', formData.description.trim());
      payload.append('price', String(parseFloat(String(priceNum))));
      payload.append('category', categoryToUse);
      payload.append('isAvailable', 'true');

      if (file) payload.append('image', file);

      const response = await fetch('/api/items', {
        method: 'POST',
        body: payload, // multipart/form-data; server must handle this
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to add menu item');
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
        newCategory: ''
      });
      setShowNewCategoryInput(false);
      setFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

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

  const previewUrl = filePreview;

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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={showNewCategoryInput ? NEW_CATEGORY_OPTION : formData.category}
            // Only require when not adding new category
            onValueChange={(value) => {
              if (value === NEW_CATEGORY_OPTION) {
                setShowNewCategoryInput(true);
                setFormData(prev => ({ ...prev, category: '' }));
              } else {
                setShowNewCategoryInput(false);
                setFormData(prev => ({ ...prev, category: value }));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
              <SelectItem value={NEW_CATEGORY_OPTION}>
                + Add New Category
              </SelectItem>
            </SelectContent>
          </Select>

          {showNewCategoryInput && (
            <div className="mt-2">
              <Input
                type="text"
                name="newCategory"
                value={formData.newCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, newCategory: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                placeholder="Enter new category name"
                className="mt-2"
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file-upload">Menu Item Image</Label>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            id="file-upload"
            name="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-24 w-24 rounded-md object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-sm hover:bg-white/90"
                onClick={handleClickUpload}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleClickUpload}
              className="h-24 w-24 flex items-center justify-center"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
            </Button>
          )}
          <div className="text-sm text-muted-foreground">
            {previewUrl ? 'Click the icon to change' : 'Click to select an image'}
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Adding...' : 'Add Menu Item'}
      </Button>
    </form>
  );
}
