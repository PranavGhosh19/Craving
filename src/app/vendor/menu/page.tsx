
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Utensils, IndianRupee, Sparkles, Plus, Loader2, Trash2, Tag, Upload, X, Eye, Store, QrCode, Download, Share2 } from 'lucide-react';
import { collection, query, where, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { generateDishDescription } from '@/ai/flows/generate-dish-description';

const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  description: z.string().min(10, "Description should be at least 10 characters."),
  category: z.string().min(2, "Category is required."),
  imageUrl: z.string().min(1, "Please upload an image."),
});

type MenuItemValues = z.infer<typeof menuItemSchema>;

export default function MenuManagement() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'vendors'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: vendors, isLoading: isVendorsLoading } = useCollection(vendorsQuery);
  const vendor = vendors?.[0];

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Max 1MB allowed.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        form.setValue('imageUrl', base64String);
        form.clearErrors('imageUrl');
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    form.setValue('imageUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function handleGenerateDescription() {
    const dishName = form.getValues('name');
    if (!dishName) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Enter a dish name first.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateDishDescription({ dishName });
      form.setValue('description', result.dishDescription);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSubmit(values: MenuItemValues) {
    if (!firestore || !vendor?.id || !user?.uid) return;
    setIsAdding(true);

    const itemId = `item-${Date.now()}`;
    const itemRef = doc(firestore, 'vendors', vendor.id, 'menuItems', itemId);
    const itemData = {
      id: itemId,
      vendorId: vendor.id,
      vendorOwnerId: user.uid,
      name: values.name,
      price: values.price,
      description: values.description,
      category: values.category,
      imageUrl: values.imageUrl,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDoc(itemRef, itemData)
      .then(() => {
        toast({ title: "Item Added" });
        form.reset();
        setImagePreview(null);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: itemRef.path,
          operation: 'create',
          requestResourceData: itemData,
        }));
      })
      .finally(() => setIsAdding(false));
  }

  const publicUrl = vendor && origin ? `${origin}/v/${vendor.id}` : '';
  const qrCodeUrl = publicUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(publicUrl)}` : '';

  if (isUserLoading || isVendorsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 space-y-8">
            {vendor && (
              <Card className="shadow-xl rounded-[2rem] border-primary/10 overflow-hidden bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl font-headline">
                    <QrCode className="h-6 w-6 text-primary" />
                    Stall QR Access
                  </CardTitle>
                  <CardDescription>Scan to open: {publicUrl}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 p-6">
                  <div className="relative p-4 bg-white rounded-3xl border-4 border-primary/5 shadow-inner">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Stall QR" className="w-48 h-48" />
                    ) : (
                      <div className="w-48 h-48 bg-muted rounded-xl animate-pulse" />
                    )}
                  </div>
                  <div className="w-full space-y-3">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-primary text-primary hover:bg-primary/5 gap-2" asChild>
                      <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        Download QR
                      </a>
                    </Button>
                    <Link href={`/v/${vendor.id}`} target="_blank" className="block w-full">
                      <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-primary gap-2">
                        <Eye className="h-4 w-4" />
                        View Live Menu
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-primary gap-2"
                      onClick={() => {
                        navigator.clipboard.writeText(publicUrl);
                        toast({ title: "Link Copied!" });
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      Copy Menu Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-xl rounded-[2rem] border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Plus className="h-6 w-6 text-primary" />
                  Add Dish
                </CardTitle>
                <CardDescription>Expand your digital menu.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dish Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Pani Puri" {...field} className="rounded-xl h-12" />
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
                                <Input type="number" {...field} className="pl-9 rounded-xl h-12" />
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
                              <Input placeholder="Snacks" {...field} className="rounded-xl h-12" />
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
                              className="h-7 text-xs font-bold text-primary gap-1"
                              onClick={handleGenerateDescription}
                              disabled={isGenerating}
                            >
                              {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                              AI Help
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea {...field} className="rounded-xl min-h-[100px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-4">
                      <Label>Dish Image</Label>
                      {imagePreview ? (
                        <div className="relative rounded-xl overflow-hidden aspect-video border-2 border-primary/20 group">
                          <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                          <button type="button" onClick={clearImage} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-primary/20 rounded-xl aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 transition-colors">
                          <Upload className="h-6 w-6 text-primary" />
                          <p className="text-sm font-bold">Upload Image</p>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20" disabled={isAdding}>
                      {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save to Menu"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-2/3">
            <h2 className="text-3xl font-extrabold font-headline mb-8">Dish Management</h2>
            {isMenuLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
            ) : menuItems && menuItems.length > 0 ? (
              <div className="grid gap-6">
                {menuItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden shadow-md border-primary/5 group">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden">
                        <Image src={item.imageUrl} alt={item.name} fill className={`object-cover ${!item.isAvailable ? 'grayscale opacity-50' : ''}`} />
                        {!item.isAvailable && <div className="absolute inset-0 flex items-center justify-center bg-black/20 font-bold text-white text-xs uppercase tracking-widest">Out of Stock</div>}
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">{item.name}</h3>
                            <p className="text-lg font-extrabold text-primary">₹{item.price}</p>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t mt-4">
                          <div className="flex items-center gap-3">
                            <Switch checked={item.isAvailable} onCheckedChange={() => {
                              const ref = doc(firestore, 'vendors', vendor.id, 'menuItems', item.id);
                              updateDoc(ref, { isAvailable: !item.isAvailable, updatedAt: new Date().toISOString() });
                            }} />
                            <Label className="text-sm">Available</Label>
                          </div>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/5" onClick={() => deleteDoc(doc(firestore, 'vendors', vendor.id, 'menuItems', item.id))}>
                            <Trash2 className="h-4 w-4" />
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
                <h3 className="text-xl font-bold text-muted-foreground">Empty Menu</h3>
                <p className="text-muted-foreground">Add your specialties to start accepting orders.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
