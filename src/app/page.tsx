'use client';

import { useState, useEffect } from 'react';
import { useCafe } from '@/context/CafeContext';
import MenuGrid from './components/customer/MenuGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerPage() {
  const { menuItems, loading } = useCafe();
  const [activeTab, setActiveTab] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  // Update categories and active tab when menuItems changes
  useEffect(() => {
    if (menuItems.length > 0) {
      const uniqueCategories = Array.from(new Set(menuItems.map(item => item.category)));
      setCategories(uniqueCategories);
      
      // Set active tab to "Food" if it exists, otherwise first category
      const defaultCategory = uniqueCategories.includes('Food') 
        ? 'Food' 
        : uniqueCategories[0] || '';
      setActiveTab(defaultCategory);
    }
  }, [menuItems]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">No menu items available</h2>
        <p className="text-muted-foreground mt-2">
          Please check back later or contact us for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Welcome to Shega Cafe
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Enjoy the taste of tradition. Browse our menu and place your order.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <MenuGrid
              items={menuItems.filter(item => item.category === category)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
