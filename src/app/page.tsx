'use client';

import { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import MenuGrid from './components/customer/MenuGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CustomerPage() {
  const { menuItems } = useCafe();
  
  // Get all unique categories from menu items
  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  
  // Make "Food" default if it exists, otherwise use first available
  const defaultCategory = categories.includes("Food") ? "Food" : categories[0] || "";

  const [activeTab, setActiveTab] = useState(defaultCategory);
  
  // Filter items by active tab
  const filteredItems = menuItems.filter((item) => item.category === activeTab);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Welcome to Shega Cafe</h1>
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
            <MenuGrid items={menuItems.filter(item => item.category === category)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
