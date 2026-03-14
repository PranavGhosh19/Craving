'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  TrendingUp, 
  Loader2, 
  Rocket, 
  Sparkles,
  Gift,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import { collection, query, where, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

export default function BusinessStrategiesPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'vendors'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: vendors, isLoading: isVendorsLoading } = useCollection(vendorsQuery);
  const vendor = vendors?.[0];

  const strategiesQuery = useMemoFirebase(() => {
    if (!firestore || !vendor?.id) return null;
    return collection(firestore, 'vendors', vendor.id, 'loyaltyPrograms');
  }, [firestore, vendor?.id]);

  const { data: activeStrategies, isLoading: isStrategiesLoading } = useCollection(strategiesQuery);

  const isStrategyActive = (type: string) => {
    return activeStrategies?.some(s => s.type === type && s.isActive);
  };

  const getStrategyDoc = (type: string) => {
    return activeStrategies?.find(s => s.type === type);
  };

  const toggleStrategy = async (strategyConfig: { id: string, name: string, description: string, type: string, buyCount?: number }) => {
    if (!firestore || !vendor || !user) return;
    
    const existing = getStrategyDoc(strategyConfig.type);
    const strategyId = existing?.id || `strat-${strategyConfig.type}-${Date.now()}`;
    const strategyRef = doc(firestore, 'vendors', vendor.id, 'loyaltyPrograms', strategyId);
    
    setIsUpdating(strategyConfig.type);

    try {
      if (existing && existing.isActive) {
        // Disable strategy
        await updateDoc(strategyRef, {
          isActive: false,
          updatedAt: new Date().toISOString()
        });
        toast({ title: `${strategyConfig.name} Disabled` });
      } else {
        // Enable or Create strategy
        await setDoc(strategyRef, {
          id: strategyId,
          vendorId: vendor.id,
          vendorOwnerId: user.uid,
          name: strategyConfig.name,
          description: strategyConfig.description,
          type: strategyConfig.type,
          buyCount: strategyConfig.buyCount || 0,
          getFreeCount: 1,
          isActive: true,
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        toast({ title: `${strategyConfig.name} Activated!` });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Action failed", description: "Please check your connection." });
    } finally {
      setIsUpdating(null);
    }
  };

  if (isUserLoading || isVendorsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 selection:bg-primary selection:text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b-4 border-primary/10 pb-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary border border-primary/20">
                <TrendingUp className="h-4 w-4" />
                Growth Dashboard
              </div>
              <h1 className="text-5xl font-black font-headline tracking-tighter uppercase italic leading-none">
                Business <span className="text-primary">Strategies</span>
              </h1>
              <p className="text-muted-foreground text-xl font-medium italic">
                Toggle high-performance marketing tools to skyrocket your daily sales.
              </p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-primary/5 flex items-center gap-6">
               <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Active Tools</p>
                 <p className="text-3xl font-black text-primary font-headline italic">
                   {activeStrategies?.filter(s => s.isActive).length || 0}
                 </p>
               </div>
               <div className="h-10 w-px bg-primary/10" />
               <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Est. Growth</p>
                 <p className="text-3xl font-black text-green-600 font-headline italic">+28%</p>
               </div>
            </div>
          </div>

          {/* Strategy Toggles */}
          <div className="grid gap-8">
            {/* Referral Strategy */}
            <StrategyToggleCard 
              icon={<Gift className="h-8 w-8" />}
              title="Referral Rewards"
              description="Viral Growth: Refer a friend and get ₹30 for you and your friend once they place their first order."
              isActive={isStrategyActive('Referral')}
              isUpdating={isUpdating === 'Referral'}
              onToggle={() => toggleStrategy({
                id: 'referral',
                type: 'Referral',
                name: 'Refer & Earn ₹30',
                description: 'Refer a friend and get ₹30 for you and your friend once they place their first order.'
              })}
              accentColor="bg-blue-500"
            />

            {/* Loyalty Strategy */}
            <StrategyToggleCard 
              icon={<Award className="h-8 w-8" />}
              title="Loyalty Club"
              description="Customer Retention: Automated 'Buy 5 Get 1 Free' digital punch card for your regulars."
              isActive={isStrategyActive('BuyNGetMFree')}
              isUpdating={isUpdating === 'BuyNGetMFree'}
              onToggle={() => toggleStrategy({
                id: 'loyalty',
                type: 'BuyNGetMFree',
                name: 'Buy 5 Get 1 Free',
                description: 'A classic reward system for your most loyal customers. Buy 5 items and get the 6th one free!',
                buyCount: 5
              })}
              accentColor="bg-orange-500"
            />

            {/* Smart Upsell Strategy */}
            <StrategyToggleCard 
              icon={<Zap className="h-8 w-8" />}
              title="Smart Upsell"
              description="Increase Ticket Size: AI-powered dish recommendations displayed during the customer's browsing experience."
              isActive={isStrategyActive('Upsell')}
              isUpdating={isUpdating === 'Upsell'}
              onToggle={() => toggleStrategy({
                id: 'upsell',
                type: 'Upsell',
                name: 'AI Smart Upsell',
                description: 'Boost your average order value by suggesting popular pairings to your customers.'
              })}
              accentColor="bg-purple-500"
            />
          </div>

          {/* Pro Tip Section */}
          <div className="p-10 bg-primary rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 transform transition-transform group-hover:scale-110 duration-700">
               <Rocket className="w-48 h-48" />
            </div>
            <div className="relative space-y-6 max-w-2xl">
              <h4 className="text-3xl font-black font-headline uppercase italic tracking-tighter">Pro Growth Secret</h4>
              <p className="text-xl font-medium opacity-90 leading-relaxed italic">
                "Referral programs are the #1 way street food stalls expand their radius. By offering ₹30 to both parties, you're essentially buying a lifetime customer for the price of a single snack."
              </p>
              <div className="flex gap-4 pt-4">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-bold py-1.5 px-4 rounded-xl">Verified Case Study</Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-bold py-1.5 px-4 rounded-xl">4.9x ROI</Badge>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StrategyToggleCard({ icon, title, description, isActive, onToggle, isUpdating, accentColor }: any) {
  return (
    <Card className={`group overflow-hidden rounded-[2.5rem] border-4 transition-all duration-500 shadow-xl ${isActive ? 'border-primary bg-white ring-8 ring-primary/5' : 'border-primary/5 bg-muted/20 grayscale-[0.5]'}`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-stretch">
          <div className={`w-full sm:w-1/4 p-10 flex flex-col items-center justify-center gap-4 transition-colors duration-500 ${isActive ? accentColor : 'bg-muted'} text-white`}>
            <div className={`h-20 w-20 rounded-[1.5rem] flex items-center justify-center shadow-2xl transform transition-transform group-hover:rotate-6 duration-500 ${isActive ? 'bg-white text-primary' : 'bg-white/50 text-muted-foreground'}`}>
              {icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Campaign</p>
          </div>
          
          <div className="flex-1 p-10 flex flex-col justify-center space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">
                <h3 className={`text-3xl font-black font-headline uppercase italic tracking-tighter transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {title}
                </h3>
                <div className="flex gap-2">
                  {isActive ? (
                    <Badge className="bg-green-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg animate-pulse">Live & Promoting</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">Paused</Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Switch 
                  checked={isActive} 
                  onCheckedChange={onToggle}
                  disabled={isUpdating}
                  className="data-[state=checked]:bg-primary scale-125"
                />
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </div>
            </div>
            
            <p className={`text-lg leading-relaxed font-medium italic transition-colors ${isActive ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
              {description}
            </p>

            {isActive && (
              <div className="pt-6 border-t border-primary/10 flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm font-black uppercase italic tracking-tighter">14 Participants</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm font-black uppercase italic tracking-tighter">3 conversions</span>
                 </div>
                 <div className="ml-auto flex items-center gap-1 text-primary font-black uppercase italic tracking-tighter text-xs group-hover:translate-x-1 transition-transform cursor-pointer">
                   View Analytics <ArrowRight className="h-4 w-4" />
                 </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
