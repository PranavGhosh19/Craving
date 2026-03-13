
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Utensils, IndianRupee, Image as ImageIcon, Sparkles, Plus, Loader2, Trash2, Tag } from 'lucide-react';
import { collection, query, where, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { generateDishDescription } from '@/ai/flows/generate-dish-description';

const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  description: z.string().min(10, "Description should be at least 10 characters."),
  category: z.string().min(2, "Category is required."),
  imageUrl: z.string().url("Please enter a valid image URL.").optional().or(z.literal('')),
});

type MenuItemValues = z.infer<typeof menuItemSchema>;

export default function MenuManagement() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // 1. Find the vendor document for this user
  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'vendors'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: vendors, isLoading: isVendorsLoading } = useCollection(vendorsQuery);
  const vendor = vendors?.[0];

  // 2. Get menu items for this vendor
  const menuItemsQuery = useMemoFirebase(() => {
    if (!firestore || !vendor?.id) return null;
    return collection(firestore, 'vendors', vendor.id, 'menuItems');
  }, [firestore, vendor?.id]);

  const { data: menuItems, isLoading: isMenuLoading } = useCollection(menuItemsQuery);

  const form = useForm<MenuItemValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      category: "Snacks",
      imageUrl: "",
    },
  });

  async function handleGenerateDescription() {
    const dishName = form.getValues('name');
    if (!dishName) {
      toast({
        variant: "destructive",
        title: "Missing Name",
        description: "Please enter a dish name first to generate a description.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateDishDescription({ dishName });
      form.setValue('description', result.dishDescription);
      toast({
        title: "AI Description Generated!",
        description: "A mouth-watering description has been added.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: "Could not generate description at this time.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSubmit(values: MenuItemValues) {
    if (!firestore || !vendor?.id) return;
    setIsAdding(true);

    try {
      const itemId = `item-${Date.now()}`;
      const itemRef = doc(firestore, 'vendors', vendor.id, 'menuItems', itemId);

      await setDoc(itemRef, {
        id: itemId,
        vendorId: vendor.id,
        name: values.name,
        price: values.price,
        description: values.description,
        category: values.category,
        imageUrl: values.imageUrl || `https://picsum.photos/seed/${itemId}/400/300`,
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Item Added",
        description: `${values.name} has been added to your menu.`,
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add item",
        description: error.message,
      });
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(itemId: string) {
    if (!firestore || !vendor?.id) return;
    try {
      await deleteDoc(doc(firestore, 'vendors', vendor.id, 'menuItems', itemId));
      toast({ title: "Item deleted" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Delete failed", description: error.message });
    }
  }

  if (isUserLoading || isVendorsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!vendor && !isVendorsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Vendor Profile Not Found</h1>
        <Button onClick={() => router.push('/register/vendor')}>Register as Vendor</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Add Item Form */}
          <div className="w-full lg:w-1/3">
            <Card className="shadow-xl rounded-[2rem] border-primary/10 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-6 w-6 text-primary" />
                  Add Menu Item
                </CardTitle>
                <CardDescription>Create a new dish for your stall.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dish Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Masala Dosa" {...field} className="rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="number" {...field} className="pl-9 rounded-xl" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Snacks" {...field} className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center mb-1">
                            <FormLabel>Description</FormLabel>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs font-bold text-primary gap-1 hover:text-primary hover:bg-primary/10"
                              onClick={handleGenerateDescription}
                              disabled={isGenerating}
                            >
                              {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                              AI Help
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the flavors..." 
                              {...field} 
                              className="rounded-xl min-h-[100px]" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="https://..." {...field} className="pl-9 rounded-xl" />
                            </div>
                          </FormControl>
                          <FormDescription>Leave blank for a placeholder.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={isAdding}>
                      {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      Add to Menu
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items List */}
          <div className="w-full lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold font-headline">{vendor?.name}&apos;s Menu</h2>
                <p className="text-muted-foreground">{menuItems?.length || 0} items currently listed</p>
              </div>
              <Tag className="h-8 w-8 text-primary/20" />
            </div>

            {isMenuLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
              </div>
            ) : menuItems && menuItems.length > 0 ? (
              <div className="grid gap-6">
                {menuItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow border-primary/5 group">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden">
                        <Image 
                          src={item.imageUrl || `https://picsum.photos/seed/${item.id}/400/300`}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-primary shadow-sm border border-primary/10">
                          {item.category}
                        </div>
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">{item.name}</h3>
                            <p className="text-lg font-extrabold text-primary">₹{item.price}</p>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-lg text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-[2rem] bg-muted/30">
                <Utensils className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-muted-foreground">Your menu is empty</h3>
                <p className="text-muted-foreground">Start by adding your first dish using the form.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
