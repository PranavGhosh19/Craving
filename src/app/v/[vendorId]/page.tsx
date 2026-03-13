'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Utensils, IndianRupee, ArrowLeft, Store, Info, QrCode, Share2 } from 'lucide-react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';
import { toast } from '@/hooks/use-toast';

export default function PublicMenuPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const vendorId = params.vendorId as string;
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const vendorRef = useMemoFirebase(() => {
    if (!firestore || !vendorId) return null;
    return doc(firestore, 'vendors', vendorId);
  }, [firestore, vendorId]);

  const { data: vendor, isLoading: isVendorLoading } = useDoc(vendorRef);

  const menuItemsQuery = useMemoFirebase(() => {
    if (!firestore || !vendorId) return null;
    return collection(firestore, 'vendors', vendorId, 'menuItems');
  }, [firestore, vendorId]);

  const { data: menuItems, isLoading: isMenuLoading } = useCollection(menuItemsQuery);

  const publicUrl = vendor ? `${origin}/v/${vendor.id}` : '';
  const qrCodeUrl = publicUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}` : '';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vendor?.name || 'Craving Menu',
        text: `Check out the menu for ${vendor?.name} on Craving!`,
        url: publicUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(publicUrl);
      toast({
        title: "Link copied!",
        description: "The menu link has been copied to your clipboard.",
      });
    }
  };

  if (isVendorLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 space-y-8">
          <Skeleton className="h-40 w-full rounded-[2rem]" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Store className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
        <h1 className="text-2xl font-bold mb-2">Stall Not Found</h1>
        <p className="text-muted-foreground mb-6">This vendor might be offline or the link is incorrect.</p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 w-full bg-primary overflow-hidden">
        <Image 
          src={vendor.profileImageUrl || "https://picsum.photos/seed/stall/1200/400"} 
          alt={vendor.name}
          fill
          className="object-cover opacity-60 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-white/90 text-primary font-bold mb-2">
                Open Now
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-foreground">{vendor.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Store className="h-4 w-4" />
                {vendor.locationDescription || 'Local Street Stall'}
              </p>
            </div>
            <Button onClick={handleShare} variant="outline" className="bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/80 gap-2 rounded-xl h-12 px-6 font-bold">
              <Share2 className="h-4 w-4" />
              Share Menu
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="rounded-2xl border-primary/10 overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Info className="h-3.5 w-3.5" /> About
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {vendor.description || 'Welcome to our stall! We serve fresh, delicious street food made with love and secret spices.'}
                  </p>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <QrCode className="h-3.5 w-3.5 text-primary" /> Stall QR
                  </h3>
                  <div className="bg-white p-3 rounded-2xl border border-primary/5 shadow-inner mb-4 flex justify-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Stall QR" className="w-32 h-32" />
                    ) : (
                      <Skeleton className="w-32 h-32 rounded-lg" />
                    )}
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground px-2">
                    Scan this QR at the stall to open the digital menu anytime.
                  </p>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Certifications</h3>
                  <div className="space-y-2 text-xs">
                    <p className="flex justify-between"><span className="text-muted-foreground">GST:</span> <span className="font-medium">{vendor.gstNumber || 'Verified'}</span></p>
                    <p className="flex justify-between"><span className="text-muted-foreground">FSSAI:</span> <span className="font-medium">{vendor.fssaiNumber || 'Verified'}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-extrabold font-headline">Menu</h2>
              <Badge variant="outline" className="rounded-lg bg-white/50 px-4 py-1">{menuItems?.length || 0} Items</Badge>
            </div>

            {isMenuLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
              </div>
            ) : menuItems && menuItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {menuItems.map((item) => (
                  <Card key={item.id} className="group overflow-hidden rounded-2xl border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-primary hover:bg-white font-bold text-sm px-3 py-1 shadow-sm">
                          ₹{item.price}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{item.name}</h3>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tighter bg-primary/5 text-primary border-none">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-10">
                        {item.description}
                      </p>
                      <Button className="w-full mt-4 bg-primary text-white hover:bg-primary/90 font-bold rounded-xl h-11 transition-all shadow-lg shadow-primary/10 group-hover:shadow-primary/20">
                        Order Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed border-primary/10">
                <Utensils className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-10" />
                <h3 className="text-xl font-bold text-muted-foreground">No items available yet</h3>
                <p className="text-sm text-muted-foreground">The vendor is currently updating their menu.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}