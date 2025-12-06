import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageId?: string | null;
  isAvailable: boolean;
};

type EditMenuItemProps = {
  item: MenuItem;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

export function EditMenuItem({ item, onClose, onUpdated }: EditMenuItemProps) {
  const { toast } = useToast();
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [price, setPrice] = useState(item.price.toString());
  const [category, setCategory] = useState(item.category);
  const [imageId, setImageId] = useState(item.imageId ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);

    if (Number.isNaN(parsedPrice)) {
      toast({ variant: "destructive", title: "Invalid price value" });
      return;
    }

    try {
      setIsSaving(true);

      const res = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: parsedPrice,
          category,
          imageId: imageId || null,
          isAvailable: item.isAvailable,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update menu item");
      }

      toast({ title: "Menu item updated" });
      await onUpdated();
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      toast({
        variant: "destructive",
        title: err?.message || "Failed to update menu item",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Menu Item</h2>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onClose}
            disabled={isSaving}
          >
            ✕
          </Button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="price">Price (ETB)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Food, Drink, Dessert"
              />
            </div>
          </div>

          {/* <div className="space-y-1">
            <Label htmlFor="imageId">Image ID</Label>
            <Input
              id="imageId"
              value={imageId}
              onChange={(e) => setImageId(e.target.value)}
              placeholder="Optional image identifier"
            />
          </div> */}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


