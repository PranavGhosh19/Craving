
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Utensils, IndianRupee, ArrowLeft, Store, Info, QrCode, Share2, MapPin, Clock, BadgeCheck } from 'lucide-react';
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
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
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

  const publicUrl = vendor && origin ? `${origin}/v/${vendor.id}` : '';
  const qrCodeUrl = publicUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}` : '';

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
          <Skeleton className="h-40 w-full rounded-[3rem]" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-[2rem]" />
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
        <h1 className="text-3xl font-extrabold font-headline mb-2">Stall Not Found</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-sm">This vendor might be offline or the link is incorrect. Please check the QR code again.</p>
        <Button onClick={() => router.push('/browse')} size="lg" className="rounded-2xl px-8 font-bold">
          Browse Other Stalls
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      
      {/* Hero Header */}
      <div className="relative h-[350px] md:h-[450px] w-full bg-primary overflow-hidden">
        <Image 
          src={vendor.profileImageUrl || `https://picsum.photos/seed/${vendor.id}-stall/1200/600`} 
          alt={vendor.name}
          fill
          className="object-cover opacity-70 mix-blend-overlay"
          priority
          data-ai-hint="street food stall"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        
        <div className="absolute top-8 left-8">
          <Button 
            onClick={() => router.push('/browse')}
            variant="ghost" 
            className="bg-white/20 backdrop-blur-md text-white hover:bg-white/40 rounded-full h-12 w-12 p-0 border border-white/30"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className="bg-green-500 text-white font-bold px-3 py-1 shadow-lg border-none flex gap-1.5 items-center">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Open Now
                </Badge>
                <Badge variant="secondary" className="bg-white/90 text-primary font-bold shadow-lg border-none flex gap-1.5 items-center">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  FSSAI Verified
                </Badge>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold font-headline text-foreground drop-shadow-sm tracking-tight">{vendor.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground font-medium">
                <p className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {vendor.locationDescription || 'Local Favorite'}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  8:00 AM - 10:00 PM
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleShare} variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/10 hover:bg-white gap-2 rounded-2xl h-14 px-8 font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
                <Share2 className="h-5 w-5 text-primary" />
                Share
              </Button>
              <Button className="bg-primary text-white hover:bg-primary/90 gap-2 rounded-2xl h-14 px-8 font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                Call Vendor
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16">
        <div className="grid gap-16 lg:grid-cols-4">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-10">
            <Card className="rounded-[2.5rem] border-primary/5 overflow-hidden bg-white shadow-xl">
              <CardContent className="p-8 space-y-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" /> Our Story
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground italic">
                    &ldquo;{vendor.description || 'Serving authentic street food flavors, crafted with secret family recipes and the freshest ingredients since we opened our stall.'}&rdquo;
                  </p>
                </div>
                
                <div className="pt-8 border-t">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-primary" /> Scan & Share
                  </h3>
                  <div className="bg-muted/30 p-5 rounded-[2rem] border border-primary/5 shadow-inner mb-4 flex justify-center group cursor-pointer hover:bg-white transition-colors duration-500">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Stall QR" className="w-40 h-40 group-hover:scale-105 transition-transform" />
                    ) : (
                      <Skeleton className="w-40 h-40 rounded-2xl" />
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground px-4 leading-relaxed">
                    Others can scan this to see our full menu and prices instantly on their phones.
                  </p>
                </div>

                <div className="pt-8 border-t">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Credentials</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
                      <span className="text-muted-foreground font-medium">GSTIN</span>
                      <span className="font-bold text-primary">{vendor.gstNumber || 'PROIFIED'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
                      <span className="text-muted-foreground font-medium">FSSAI No.</span>
                      <span className="font-bold text-primary">{vendor.fssaiNumber || 'CERTIFIED'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-12 border-b pb-6">
              <div className="space-y-1">
                <h2 className="text-4xl font-extrabold font-headline">Full Menu</h2>
                <p className="text-muted-foreground">Freshly prepared for you</p>
              </div>
              <Badge variant="outline" className="rounded-xl bg-white px-6 py-2 text-lg font-bold shadow-sm border-primary/10">
                {menuItems?.length || 0} Specialties
              </Badge>
            </div>

            {isMenuLoading ? (
              <div className="grid gap-10 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-80 rounded-[2.5rem]" />)}
              </div>
            ) : menuItems && menuItems.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2">
                {menuItems.map((item) => (
                  <Card key={item.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white flex flex-col">
                    <div className="relative h-64 w-full overflow-hidden">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name}
                        fill
                        className={`object-cover group-hover:scale-110 transition-transform duration-700 ${!item.isAvailable ? 'grayscale blur-[2px] opacity-60' : ''}`}
                        data-ai-hint="street food dish"
                      />
                      <div className="absolute top-5 right-5">
                        <Badge className={`${item.isAvailable ? 'bg-white/95 text-primary hover:bg-white' : 'bg-destructive/90 text-white'} font-bold text-xl px-5 py-2 shadow-2xl rounded-2xl border-none`}>
                          {item.isAvailable ? `₹${item.price}` : 'Sold Out'}
                        </Badge>
                      </div>
                      {!item.isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                          <Badge variant="destructive" className="h-12 px-8 rounded-full text-sm font-bold uppercase tracking-widest shadow-2xl border-2 border-white/20">Currently Unavailable</Badge>
                        </div>
                      )}
                      <div className="absolute top-5 left-5">
                        <Badge className="bg-primary text-white font-bold px-4 py-1.5 rounded-xl shadow-lg border-none text-xs uppercase tracking-widest">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className={`text-2xl font-extrabold transition-colors font-headline leading-tight ${item.isAvailable ? 'group-hover:text-primary' : 'text-muted-foreground'}`}>
                          {item.name}
                        </h3>
                        <p className="text-base text-muted-foreground line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <Button 
                        disabled={!item.isAvailable}
                        className={`w-full mt-6 font-bold rounded-2xl h-14 text-lg transition-all shadow-xl active:scale-95 ${item.isAvailable ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20 group-hover:shadow-primary/40' : 'bg-muted text-muted-foreground shadow-none'}`}
                      >
                        {item.isAvailable ? 'Place Order' : 'Notify When Back'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-muted/20 rounded-[3rem] border-2 border-dashed border-primary/10">
                <Utensils className="mx-auto h-20 w-20 text-muted-foreground mb-6 opacity-10" />
                <h3 className="text-2xl font-bold text-muted-foreground">Our menu is coming soon</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">The vendor is currently busy preparing some delicious updates for you!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
