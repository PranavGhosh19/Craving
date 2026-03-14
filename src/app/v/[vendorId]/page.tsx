
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Utensils, ArrowLeft, BadgeCheck, QrCode, Share2, MapPin, Star, Sparkles, Smartphone, Gift, Award, Zap, Wallet, Loader2, Plus, CreditCard } from 'lucide-react';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import { toast } from '@/hooks/use-toast';

export default function PublicMenuPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const vendorId = params.vendorId as string;
  const [origin, setOrigin] = useState('');
  const [isToppingUp, setIsToppingUp] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Ensure customer is signed in anonymously to track wallet
  useEffect(() => {
    if (auth && !user) {
      signInAnonymously(auth).catch(console.error);
    }
  }, [auth, user]);

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

  const strategiesQuery = useMemoFirebase(() => {
    if (!firestore || !vendorId) return null;
    return collection(firestore, 'vendors', vendorId, 'loyaltyPrograms');
  }, [firestore, vendorId]);

  const { data: strategies } = useCollection(strategiesQuery);
  const activeStrategies = strategies?.filter(s => s.isActive) || [];

  const walletRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !vendorId) return null;
    return doc(firestore, 'customers', user.uid, 'wallets', vendorId);
  }, [firestore, user?.uid, vendorId]);

  const { data: wallet, isLoading: isWalletLoading } = useDoc(walletRef);

  const publicUrl = vendor && origin ? `${origin}/v/${vendor.id}` : '';
  const qrCodeUrl = publicUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(publicUrl)}` : '';

  const handleTopUp = async (amount: number, bonus: number) => {
    if (!firestore || !user?.uid || !vendorId) return;
    setIsToppingUp(amount);

    try {
      const currentBalance = wallet?.balance || 0;
      const newBalance = currentBalance + amount + bonus;

      await setDoc(doc(firestore, 'customers', user.uid, 'wallets', vendorId), {
        id: vendorId,
        customerId: user.uid,
        vendorId: vendorId,
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: "Wallet Topped Up!",
        description: `Added ₹${amount} + ₹${bonus} bonus! Total: ₹${newBalance}`,
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Top up failed" });
    } finally {
      setIsToppingUp(null);
    }
  };

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

  const getStrategyIcon = (type: string) => {
    switch (type) {
      case 'Referral': return <Gift className="h-5 w-5" />;
      case 'BuyNGetMFree': return <Award className="h-5 w-5" />;
      case 'FoodWallet': return <Wallet className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
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
                {wallet && wallet.balance > 0 && (
                  <Badge className="bg-emerald-600 text-white font-bold px-4 py-1.5 shadow-xl border-none flex gap-2 items-center rounded-xl">
                    <Wallet className="h-4 w-4" />
                    Wallet: ₹{wallet.balance}
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl md:text-8xl font-black font-headline text-foreground drop-shadow-md tracking-tight leading-none uppercase italic">
                {vendor.name}
              </h1>
              <p className="flex items-center gap-2 text-foreground/80 font-bold text-lg"><MapPin className="h-6 w-6 text-primary" /> {vendor.locationDescription || 'Local Hub'}</p>
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
                  <div className="flex flex-col items-center gap-8">
                    <div className="p-6 bg-white rounded-[2.5rem] border-8 border-primary/5 shadow-inner">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Menu QR" className="w-64 h-64" />
                      ) : (
                        <Skeleton className="w-64 h-64 rounded-2xl" />
                      )}
                    </div>
                    <p className="text-center text-lg font-medium text-muted-foreground uppercase italic tracking-widest">Scan to Share</p>
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

      <main className="container mx-auto px-4 py-12">
        {/* Active Strategies Banner */}
        {activeStrategies.length > 0 && (
          <div className="mb-12 space-y-4">
            {activeStrategies.map((strat) => (
              <div 
                key={strat.id} 
                className={`border-2 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-in fade-in slide-in-from-top-4 ${strat.type === 'FoodWallet' ? 'bg-emerald-50 border-emerald-200' : 'bg-primary/10 border-primary/20'}`}
              >
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${strat.type === 'FoodWallet' ? 'bg-emerald-600' : 'bg-primary'}`}>
                    {getStrategyIcon(strat.type)}
                  </div>
                  <div>
                    <h4 className={`text-xl font-black uppercase italic tracking-tighter ${strat.type === 'FoodWallet' ? 'text-emerald-700' : 'text-primary'}`}>{strat.name}</h4>
                    <p className="text-muted-foreground font-medium">{strat.description}</p>
                  </div>
                </div>
                {strat.type === 'FoodWallet' ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="h-12 px-8 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 shrink-0">
                        Top Up Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] max-w-md bg-white border-none shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-black uppercase italic text-emerald-600 font-headline">Food Wallet Bonus</DialogTitle>
                        <DialogDescription className="text-lg">Prepay for your meals and get free bonus credits!</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-6">
                        {strat.walletTiers?.map((tier: any, i: number) => (
                          <Button 
                            key={i} 
                            onClick={() => handleTopUp(tier.amount, tier.bonus)}
                            disabled={isToppingUp !== null}
                            className="h-20 flex justify-between items-center px-8 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-900 group transition-all"
                            variant="ghost"
                          >
                            <div className="text-left">
                              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Pay Only</p>
                              <p className="text-2xl font-black italic">₹{tier.amount}</p>
                            </div>
                            <Plus className="h-6 w-6 text-emerald-300 group-hover:rotate-90 transition-transform" />
                            <div className="text-right">
                              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Get Credit</p>
                              <p className="text-2xl font-black italic">₹{tier.amount + tier.bonus}</p>
                            </div>
                            {isToppingUp === tier.amount && <Loader2 className="h-5 w-5 animate-spin ml-2" />}
                          </Button>
                        ))}
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-xl flex items-start gap-3">
                         <CreditCard className="h-5 w-5 text-emerald-600 mt-0.5" />
                         <p className="text-sm text-emerald-700 font-medium italic">Credits stay in your wallet and can be used for any future order at this stall!</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button className="h-12 px-8 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 shrink-0">
                    Claim Reward
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

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

              {wallet && wallet.balance > 0 && (
                <div className="p-8 bg-emerald-600 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  <Wallet className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 transform -rotate-12" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Available Credits</p>
                  <p className="text-5xl font-black italic mb-4">₹{wallet.balance}</p>
                  <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold rounded-xl h-10 text-xs uppercase italic tracking-widest">
                    Top Up More
                  </Button>
                </div>
              )}

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
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-16 border-b-4 border-primary/10 pb-8">
              <div className="space-y-2">
                <h2 className="text-5xl font-black font-headline uppercase italic tracking-tighter">Digital Menu</h2>
                <p className="text-muted-foreground text-lg font-medium">Daily specialties & local favorites</p>
              </div>
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
