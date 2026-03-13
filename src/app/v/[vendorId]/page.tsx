
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Utensils, ArrowLeft, BadgeCheck, QrCode, Share2, MapPin, Star, Sparkles, Smartphone, Download } from 'lucide-react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

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

  // The critical QR URL that points back to this exact page
  const publicUrl = vendor && origin ? `${origin}/v/${vendor.id}` : '';
  const qrCodeUrl = publicUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(publicUrl)}` : '';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vendor?.name || 'Craving Menu',
        text: `Check out the menu for ${vendor?.name}!`,
        url: publicUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(publicUrl);
      toast({ title: "Link copied!" });
    }
  };

  if (isVendorLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 space-y-8">
          <Skeleton className="h-64 w-full rounded-[3rem]" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-[2rem]" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Utensils className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
        <h1 className="text-3xl font-extrabold font-headline mb-4">Stall Offline</h1>
        <Button onClick={() => router.push('/browse')} size="lg" className="rounded-2xl px-10 font-bold">Discover More Flavors</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 font-body">
      <Navbar />
      
      <div className="relative h-[450px] md:h-[550px] w-full bg-primary overflow-hidden">
        <Image 
          src={vendor.profileImageUrl || `https://picsum.photos/seed/${vendor.id}-stall/1200/600`} 
          alt={vendor.name}
          fill
          className="object-cover opacity-80 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
        
        <div className="absolute top-8 left-8">
          <Button onClick={() => router.push('/browse')} variant="ghost" className="bg-white/20 backdrop-blur-md text-white hover:bg-white/40 rounded-full h-12 w-12 p-0 border border-white/30">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-500 text-white font-bold px-4 py-1.5 shadow-xl border-none flex gap-2 items-center rounded-xl">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Live Menu
                </Badge>
                <Badge variant="secondary" className="bg-white/90 text-primary font-bold shadow-xl border-none flex gap-2 items-center rounded-xl">
                  <BadgeCheck className="h-4 w-4" />
                  Verified Stall
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black font-headline text-foreground drop-shadow-md tracking-tight leading-none uppercase italic">
                {vendor.name}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-foreground/80 font-bold text-lg">
                <p className="flex items-center gap-2"><MapPin className="h-6 w-6 text-primary" /> {vendor.locationDescription || 'Local Hub'}</p>
                <div className="flex items-center gap-1 text-primary">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-current" />)}
                  <span className="ml-2 text-foreground font-medium text-base">4.9 Ratings</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white/95 backdrop-blur-sm border-none hover:bg-white gap-3 rounded-[1.5rem] h-16 px-10 font-bold shadow-2xl transition-all hover:scale-105 active:scale-95 text-primary text-lg">
                    <QrCode className="h-6 w-6" />
                    Stall QR
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[3rem] max-w-sm p-10 bg-white border-none shadow-2xl">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-center font-headline text-3xl font-black uppercase italic text-primary">SCAN TO ACCESS</DialogTitle>
                    <DialogDescription className="text-center text-lg font-medium text-muted-foreground">
                      Point your camera here to see {vendor.name}&apos;s digital menu.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-8">
                    <div className="p-6 bg-white rounded-[2.5rem] border-8 border-primary/5 shadow-inner">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Menu QR" className="w-64 h-64" />
                      ) : (
                        <Skeleton className="w-64 h-64 rounded-2xl" />
                      )}
                    </div>
                    <Button className="w-full h-16 rounded-2xl font-bold bg-primary text-white text-xl shadow-lg shadow-primary/30 uppercase italic tracking-widest" asChild>
                      <a href={qrCodeUrl} download={`${vendor.name}-Menu-QR.png`}>Save Stall QR</a>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handleShare} className="bg-foreground text-white hover:bg-foreground/90 gap-3 rounded-[1.5rem] h-16 px-10 font-bold shadow-2xl transition-all hover:scale-105 active:scale-95 text-lg">
                <Share2 className="h-6 w-6" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-20">
        <div className="grid gap-20 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-black uppercase italic tracking-tighter text-primary flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> About the Stall
                </h3>
                <p className="text-xl leading-relaxed text-muted-foreground font-medium italic">
                  &ldquo;{vendor.description || 'Serving authentic street flavors prepared fresh with local ingredients daily.'}&rdquo;
                </p>
              </div>

              <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-6">
                 <h4 className="font-black uppercase tracking-tight flex items-center gap-2">
                   <Smartphone className="h-5 w-5 text-primary" /> Scan to Order
                 </h4>
                 <div className="flex justify-center bg-white p-4 rounded-[1.5rem] shadow-sm">
                   {qrCodeUrl ? (
                     <img src={qrCodeUrl} alt="Quick Access QR" className="w-32 h-32" />
                   ) : (
                     <Skeleton className="w-32 h-32 rounded-xl" />
                   )}
                 </div>
                 <p className="text-sm text-center text-muted-foreground font-medium italic">
                   Share this screen to let friends browse the menu!
                 </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-16 border-b-4 border-primary/10 pb-8">
              <div className="space-y-2">
                <h2 className="text-5xl font-black font-headline uppercase italic tracking-tighter">Digital Menu</h2>
                <p className="text-muted-foreground text-lg font-medium">Daily specialties & local favorites</p>
              </div>
              <Badge variant="outline" className="rounded-2xl bg-white px-8 py-3 text-xl font-black shadow-xl border-primary/20 text-primary italic">
                {menuItems?.length || 0} ITEMS
              </Badge>
            </div>

            {isMenuLoading ? (
              <div className="grid gap-12 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-96 rounded-[3rem]" />)}
              </div>
            ) : menuItems && menuItems.length > 0 ? (
              <div className="grid gap-10 sm:grid-cols-2">
                {menuItems.map((item) => (
                  <Card key={item.id} className="group overflow-hidden rounded-[3rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white flex flex-col border border-primary/5">
                    <div className="relative h-72 w-full overflow-hidden">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name}
                        fill
                        className={`object-cover group-hover:scale-110 transition-transform duration-1000 ${!item.isAvailable ? 'grayscale blur-sm opacity-50' : ''}`}
                      />
                      <div className="absolute top-6 right-6">
                        <Badge className={`${item.isAvailable ? 'bg-white/95 text-primary' : 'bg-destructive/90 text-white'} font-black text-2xl px-6 py-2 shadow-2xl rounded-2xl border-none italic`}>
                          {item.isAvailable ? `₹${item.price}` : 'OUT'}
                        </Badge>
                      </div>
                      {!item.isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md">
                          <Badge variant="destructive" className="h-14 px-10 rounded-full text-lg font-black uppercase italic tracking-widest shadow-2xl">SOLD OUT</Badge>
                        </div>
                      )}
                      <div className="absolute bottom-6 left-6">
                        <Badge className="bg-primary text-white font-black px-6 py-2 rounded-xl shadow-2xl border-none text-xs uppercase tracking-widest italic">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-10 space-y-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className={`text-3xl font-black transition-colors font-headline leading-none uppercase italic ${item.isAvailable ? 'group-hover:text-primary' : 'text-muted-foreground'}`}>
                          {item.name}
                        </h3>
                        <p className="text-lg text-muted-foreground line-clamp-3 leading-relaxed font-medium">
                          {item.description}
                        </p>
                      </div>
                      <Button 
                        disabled={!item.isAvailable}
                        className={`w-full mt-8 font-black rounded-[1.5rem] h-16 text-xl uppercase italic tracking-widest transition-all shadow-2xl active:scale-95 ${item.isAvailable ? 'bg-primary text-white hover:bg-primary/90' : 'bg-muted text-muted-foreground'}`}
                      >
                        {item.isAvailable ? 'Order Now' : 'Sold Out'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-40 bg-muted/20 rounded-[4rem] border-4 border-dashed border-primary/10">
                <Utensils className="mx-auto h-20 w-20 text-muted-foreground mb-8 opacity-10" />
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-muted-foreground">Menu Loading</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-4 text-lg font-medium">Stall is currently updating their digital board.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
