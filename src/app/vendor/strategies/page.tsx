
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
  ArrowRight,
  Settings2,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { collection, query, where, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

interface StrategyConfig {
  id: string;
  name: string;
  description: string;
  type: string;
  buyCount?: number;
  rewardValue?: number;
  walletTiers?: { amount: number; bonus: number }[];
  isActive?: boolean;
}

export default function BusinessStrategiesPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<StrategyConfig | null>(null);

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

  const getStrategyByType = (type: string) => {
    return activeStrategies?.find(s => s.type === type);
  };

  const handleToggle = async (type: string, defaultConfig: StrategyConfig) => {
    if (!firestore || !vendor || !user) return;
    
    const existing = getStrategyByType(type);
    const strategyId = existing?.id || `strat-${type}-${Date.now()}`;
    const strategyRef = doc(firestore, 'vendors', vendor.id, 'loyaltyPrograms', strategyId);
    
    setIsUpdating(type);

    try {
      if (existing && existing.isActive) {
        await updateDoc(strategyRef, {
          isActive: false,
          updatedAt: new Date().toISOString()
        });
        toast({ title: "Strategy Paused" });
      } else {
        const configToSave = existing || {
          ...defaultConfig,
          id: strategyId,
          vendorId: vendor.id,
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        await setDoc(strategyRef, {
          ...configToSave,
          isActive: true,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        toast({ title: "Strategy Activated!" });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Update failed" });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!firestore || !vendor || !editingStrategy) return;
    
    const existing = getStrategyByType(editingStrategy.type);
    const strategyId = existing?.id || `strat-${editingStrategy.type}-${Date.now()}`;
    const strategyRef = doc(firestore, 'vendors', vendor.id, 'loyaltyPrograms', strategyId);

    try {
      await setDoc(strategyRef, {
        ...editingStrategy,
        id: strategyId,
        vendorId: vendor.id,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      toast({ title: "Settings Saved" });
      setEditingStrategy(null);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Save failed" });
    }
  };

  if (isUserLoading || isVendorsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const defaultReferral = {
    id: 'referral',
    type: 'Referral',
    name: 'Refer & Earn ₹30',
    description: 'Refer a friend and get ₹30 for you and your friend once they place their first order.',
    rewardValue: 30
  };

  const defaultLoyalty = {
    id: 'loyalty',
    type: 'BuyNGetMFree',
    name: 'Buy 5 Get 1 Free',
    description: 'Classic reward system. Buy 5 items and get the 6th one free!',
    buyCount: 5
  };

  const defaultWallet = {
    id: 'wallet',
    type: 'FoodWallet',
    name: 'Food Wallet Bonus',
    description: 'Prepay and get bonus credits. Pay ₹200, Get ₹220!',
    walletTiers: [
      { amount: 100, bonus: 10 },
      { amount: 200, bonus: 25 },
      { amount: 500, bonus: 75 }
    ]
  };

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
                Toggle and customize marketing tools to skyrocket your daily sales.
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
                 <p className="text-3xl font-black text-green-600 font-headline italic">+35%</p>
               </div>
            </div>
          </div>

          {/* Strategy Toggles */}
          <div className="grid gap-8">
            <StrategyToggleCard 
              icon={<Wallet className="h-8 w-8" />}
              title="Food Wallet Bonus"
              isActive={!!getStrategyByType('FoodWallet')?.isActive}
              isUpdating={isUpdating === 'FoodWallet'}
              description={getStrategyByType('FoodWallet')?.description || defaultWallet.description}
              onToggle={() => handleToggle('FoodWallet', defaultWallet)}
              onEdit={() => setEditingStrategy(getStrategyByType('FoodWallet') || defaultWallet)}
              accentColor="bg-emerald-600"
            />

            <StrategyToggleCard 
              icon={<Gift className="h-8 w-8" />}
              title="Referral Rewards"
              isActive={!!getStrategyByType('Referral')?.isActive}
              isUpdating={isUpdating === 'Referral'}
              description={getStrategyByType('Referral')?.description || defaultReferral.description}
              onToggle={() => handleToggle('Referral', defaultReferral)}
              onEdit={() => setEditingStrategy(getStrategyByType('Referral') || defaultReferral)}
              accentColor="bg-blue-600"
            />

            <StrategyToggleCard 
              icon={<Award className="h-8 w-8" />}
              title="Loyalty Club"
              isActive={!!getStrategyByType('BuyNGetMFree')?.isActive}
              isUpdating={isUpdating === 'BuyNGetMFree'}
              description={getStrategyByType('BuyNGetMFree')?.description || defaultLoyalty.description}
              onToggle={() => handleToggle('BuyNGetMFree', defaultLoyalty)}
              onEdit={() => setEditingStrategy(getStrategyByType('BuyNGetMFree') || defaultLoyalty)}
              accentColor="bg-orange-600"
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
                "The Food Wallet is a game changer. When customers have credit, they don't look at prices—they look at flavors. It guarantees you upfront revenue and ensures they come back until the last rupee is spent."
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingStrategy} onOpenChange={() => setEditingStrategy(null)}>
        <DialogContent className="rounded-[2.5rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tight font-headline">Edit Strategy</DialogTitle>
            <DialogDescription>Customize how this program works for your customers.</DialogDescription>
          </DialogHeader>
          {editingStrategy && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input 
                  value={editingStrategy.name} 
                  onChange={(e) => setEditingStrategy({...editingStrategy, name: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={editingStrategy.description} 
                  onChange={(e) => setEditingStrategy({...editingStrategy, description: e.target.value})}
                  className="rounded-xl min-h-[100px]"
                />
              </div>
              {editingStrategy.type === 'FoodWallet' && (
                <div className="space-y-4">
                  <Label>Bonus Tiers</Label>
                  {editingStrategy.walletTiers?.map((tier, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1">
                        <Label className="text-[10px] uppercase">Pay Amount</Label>
                        <Input 
                          type="number" 
                          value={tier.amount} 
                          onChange={(e) => {
                            const newTiers = [...(editingStrategy.walletTiers || [])];
                            newTiers[idx].amount = Number(e.target.value);
                            setEditingStrategy({...editingStrategy, walletTiers: newTiers});
                          }}
                          className="h-10 rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] uppercase">Bonus Credit</Label>
                        <Input 
                          type="number" 
                          value={tier.bonus} 
                          onChange={(e) => {
                            const newTiers = [...(editingStrategy.walletTiers || [])];
                            newTiers[idx].bonus = Number(e.target.value);
                            setEditingStrategy({...editingStrategy, walletTiers: newTiers});
                          }}
                          className="h-10 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {editingStrategy.type === 'Referral' && (
                <div className="space-y-2">
                  <Label>Reward Value (₹)</Label>
                  <Input 
                    type="number"
                    value={editingStrategy.rewardValue} 
                    onChange={(e) => setEditingStrategy({...editingStrategy, rewardValue: Number(e.target.value)})}
                    className="rounded-xl h-12"
                  />
                </div>
              )}
              {editingStrategy.type === 'BuyNGetMFree' && (
                <div className="space-y-2">
                  <Label>Items to Buy for Reward</Label>
                  <Input 
                    type="number"
                    value={editingStrategy.buyCount} 
                    onChange={(e) => setEditingStrategy({...editingStrategy, buyCount: Number(e.target.value)})}
                    className="rounded-xl h-12"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStrategy(null)} className="rounded-xl h-12 font-bold">Cancel</Button>
            <Button onClick={handleSaveEdit} className="rounded-xl h-12 font-bold bg-primary text-white gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StrategyToggleCard({ icon, title, description, isActive, onToggle, onEdit, isUpdating, accentColor }: any) {
  return (
    <Card className={`group overflow-hidden rounded-[2.5rem] border-4 transition-all duration-500 shadow-xl ${isActive ? 'border-primary bg-white ring-8 ring-primary/5' : 'border-primary/5 bg-muted/20'}`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-stretch">
          <div className={`w-full sm:w-1/4 p-10 flex flex-col items-center justify-center gap-4 transition-colors duration-500 ${isActive ? accentColor : 'bg-muted'} text-white`}>
            <div className={`h-20 w-20 rounded-[1.5rem] flex items-center justify-center shadow-2xl transform transition-transform group-hover:rotate-6 duration-500 ${isActive ? 'bg-white text-primary' : 'bg-white/50 text-muted-foreground'}`}>
              {icon}
            </div>
          </div>
          
          <div className="flex-1 p-10 flex flex-col justify-center space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">
                <h3 className={`text-3xl font-black font-headline uppercase italic tracking-tighter transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {title}
                </h3>
                <div className="flex gap-2">
                  {isActive ? (
                    <Badge className="bg-green-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg animate-pulse">Live</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">Paused</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onEdit}
                  className="rounded-full hover:bg-primary/10 text-primary"
                >
                  <Settings2 className="h-6 w-6" />
                </Button>
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
            </div>
            
            <p className={`text-lg leading-relaxed font-medium italic transition-colors ${isActive ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
