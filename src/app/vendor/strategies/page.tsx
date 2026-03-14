'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Sparkles, 
  Target, 
  Users, 
  TrendingUp, 
  Plus, 
  Loader2, 
  Trash2, 
  Rocket, 
  CheckCircle2, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { collection, query, where, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { generateMarketingStrategy, GenerateStrategyOutput } from '@/ai/flows/generate-marketing-strategy';

export default function BusinessStrategiesPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [strategyGoal, setStrategyGoal] = useState<'retention' | 'new_customers' | 'average_order_value'>('retention');
  const [promoName, setPromoName] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [buyCount, setBuyCount] = useState(5);

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

  const { data: strategies, isLoading: isStrategiesLoading } = useCollection(strategiesQuery);

  const handleAiAssistant = async () => {
    if (!vendor) return;
    setIsAiLoading(true);
    try {
      const result = await generateMarketingStrategy({
        businessName: vendor.name,
        cuisine: vendor.description || 'Street Food',
        goal: strategyGoal
      });
      setPromoName(result.strategyName);
      setPromoDesc(result.description);
      if (result.suggestedBuyCount) setBuyCount(result.suggestedBuyCount);
      toast({
        title: "Strategy Generated!",
        description: "AI has drafted a new promotion for you.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Assistant Error",
        description: "Could not generate strategy ideas right now.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !vendor || !user) return;
    setIsSubmitting(true);

    const strategyId = `loyalty-${Date.now()}`;
    const strategyRef = doc(firestore, 'vendors', vendor.id, 'loyaltyPrograms', strategyId);
    
    const strategyData = {
      id: strategyId,
      vendorId: vendor.id,
      vendorOwnerId: user.uid, // Required for security rules
      name: promoName,
      description: promoDesc,
      type: 'BuyNGetMFree',
      buyCount: buyCount,
      getFreeCount: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDoc(strategyRef, strategyData)
      .then(() => {
        toast({
          title: "Strategy Launched!",
          description: `${promoName} is now live for your customers.`,
        });
        setPromoName('');
        setPromoDesc('');
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: strategyRef.path,
          operation: 'create',
          requestResourceData: strategyData,
        }));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = (id: string) => {
    if (!firestore || !vendor) return;
    const ref = doc(firestore, 'vendors', vendor.id, 'loyaltyPrograms', id);
    deleteDoc(ref).catch(err => {
      toast({ variant: "destructive", title: "Failed to end strategy" });
    });
  };

  if (isUserLoading || isVendorsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold font-headline tracking-tight">Business Strategies</h1>
              <p className="text-muted-foreground text-lg">Build loyalty and grow your daily earnings with smart promotions.</p>
            </div>
            <div className="flex gap-4 p-2 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-2 px-4 border-r border-primary/10">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-bold">Loyalty Enabled</span>
              </div>
              <div className="flex items-center gap-2 px-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-bold text-green-600">+24% Growth</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Strategy Builder */}
            <div className="lg:col-span-1 space-y-8">
              <Card className="shadow-2xl rounded-[2.5rem] border-primary/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Rocket className="w-32 h-32 text-primary" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                    <Zap className="h-6 w-6 text-primary" />
                    Launch New Strategy
                  </CardTitle>
                  <CardDescription>Define your goal and let AI help you build it.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      What is your goal?
                    </Label>
                    <Select 
                      value={strategyGoal} 
                      onValueChange={(v: any) => setStrategyGoal(v)}
                    >
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="retention">Reward Regular Customers</SelectItem>
                        <SelectItem value="new_customers">Attract New Foodies</SelectItem>
                        <SelectItem value="average_order_value">Increase Order Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-2xl border-2 border-primary text-primary hover:bg-primary/5 font-bold gap-2 group transition-all"
                    onClick={handleAiAssistant}
                    disabled={isAiLoading}
                  >
                    {isAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 group-hover:animate-pulse" />}
                    Use AI Strategy Assistant
                  </Button>

                  <form onSubmit={handleCreateStrategy} className="space-y-6 pt-4 border-t border-primary/10">
                    <div className="space-y-2">
                      <Label>Promotion Name</Label>
                      <Input 
                        placeholder="e.g. Regulars' Appreciation" 
                        value={promoName} 
                        onChange={e => setPromoName(e.target.value)} 
                        className="rounded-xl h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mouth-watering Description</Label>
                      <Textarea 
                        placeholder="Why should customers join?" 
                        value={promoDesc} 
                        onChange={e => setPromoDesc(e.target.value)}
                        className="rounded-xl min-h-[100px]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Loyalty Rule: Buy <span className="text-primary font-bold">{buyCount}</span> Get 1 Free</Label>
                      <Input 
                        type="number" 
                        value={buyCount} 
                        onChange={e => setBuyCount(Number(e.target.value))} 
                        className="rounded-xl h-12"
                        min={1}
                        max={20}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20"
                      disabled={isSubmitting || !promoName}
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Launch Strategy Now"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Active Strategies */}
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-2xl font-extrabold font-headline flex items-center gap-2">
                <Rocket className="h-6 w-6 text-primary" />
                Active Campaigns
              </h2>
              
              {isStrategiesLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
              ) : strategies && strategies.length > 0 ? (
                <div className="grid gap-6">
                  {strategies.map((strategy) => (
                    <Card key={strategy.id} className="overflow-hidden shadow-lg border-primary/5 hover:border-primary/20 transition-all rounded-[2rem] bg-white group">
                      <div className="flex flex-col sm:flex-row h-full">
                        <div className="w-full sm:w-1/3 bg-primary/10 p-8 flex flex-col items-center justify-center gap-4 text-center">
                          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg transform group-hover:scale-110 transition-transform">
                            <Trophy className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-primary/60">Reward Rule</p>
                            <p className="text-2xl font-black font-headline italic uppercase tracking-tighter">
                              Buy {strategy.buyCount} <br/> Get 1 Free
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 p-8 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div className="space-y-1">
                                <h3 className="text-2xl font-black font-headline uppercase italic tracking-tight group-hover:text-primary transition-colors">
                                  {strategy.name}
                                </h3>
                                <Badge variant="outline" className="rounded-lg bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> ACTIVE
                                </Badge>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:bg-destructive/5"
                                onClick={() => handleDelete(strategy.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-muted-foreground font-medium leading-relaxed italic">
                              &ldquo;{strategy.description}&rdquo;
                            </p>
                          </div>
                          <div className="mt-8 pt-6 border-t flex flex-wrap gap-6 items-center">
                             <div className="flex items-center gap-2 text-sm font-bold">
                               <Users className="h-4 w-4 text-muted-foreground" />
                               <span>24 Customers Participating</span>
                             </div>
                             <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                               <Rocket className="h-4 w-4" />
                               <span>5 Rewards Earned</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-muted/20 rounded-[3rem] border-4 border-dashed border-primary/10">
                  <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground shadow-sm">
                    <AlertCircle className="h-10 w-10 opacity-20" />
                  </div>
                  <h3 className="text-2xl font-bold text-muted-foreground">No Active Strategies</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                    Start by using our AI Strategy Assistant to build your first loyalty program.
                  </p>
                </div>
              )}

              {/* Tips Section */}
              <div className="p-10 bg-gradient-to-br from-primary to-accent rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 opacity-10">
                  <TrendingUp className="w-64 h-64" />
                </div>
                <div className="relative space-y-4">
                  <h4 className="text-3xl font-black font-headline uppercase italic tracking-tighter">Pro Strategy Tip</h4>
                  <p className="text-lg font-medium opacity-90 max-w-2xl leading-relaxed">
                    &ldquo;Buy 5 Get 1 Free&rdquo; is our most successful model for street food. It keeps customers coming back twice a week on average, increasing their monthly spending by up to 40%.
                  </p>
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl font-bold">
                    Read Success Stories
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
