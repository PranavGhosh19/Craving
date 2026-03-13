
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Store, MapPin, Star, ArrowRight, Utensils, Loader2 } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';

export default function BrowseVendorsPage() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');

  const activeVendorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'vendors'), where('isActive', '==', true));
  }, [firestore]);

  const { data: vendors, isLoading } = useCollection(activeVendorsQuery);

  const filteredVendors = vendors?.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.locationDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">
              Discover Local <span className="text-primary">Flavors</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find the best street food stalls in your neighborhood and order digitally.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by stall name or location..." 
              className="pl-12 h-14 rounded-2xl text-lg shadow-lg border-primary/10 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Vendor Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredVendors && filteredVendors.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {filteredVendors.map((vendor) => (
                <Link key={vendor.id} href={`/v/${vendor.id}`}>
                  <Card className="group overflow-hidden rounded-[2.5rem] border-none shadow-md hover:shadow-2xl transition-all duration-500 bg-white h-full">
                    <div className="relative h-56 w-full">
                      <Image 
                        src={vendor.profileImageUrl || `https://picsum.photos/seed/${vendor.id}/600/400`} 
                        alt={vendor.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        data-ai-hint="street food stall"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                        <Badge className="bg-white/90 text-primary font-bold shadow-sm">
                          Open Now
                        </Badge>
                        <div className="flex items-center gap-1 bg-primary px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg">
                          <Star className="h-3 w-3 fill-current" />
                          4.8
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-8 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-extrabold group-hover:text-primary transition-colors font-headline">
                            {vendor.name}
                          </h3>
                          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                            <MapPin className="h-4 w-4 text-primary" />
                            {vendor.locationDescription || 'Local Favorite'}
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <ArrowRight className="h-6 w-6" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {vendor.description || 'Authentic flavors served hot and fresh daily at this beloved local stall.'}
                      </p>
                      <div className="flex gap-2 pt-2">
                         {['Quick Service', 'Hygienic', 'Legendary'].map(tag => (
                           <Badge key={tag} variant="secondary" className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                             {tag}
                           </Badge>
                         ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-muted/20 rounded-[3rem] border-2 border-dashed border-primary/10">
              <Store className="mx-auto h-16 w-16 text-muted-foreground mb-6 opacity-20" />
              <h3 className="text-2xl font-bold text-muted-foreground">No stalls found</h3>
              <p className="text-muted-foreground mt-2">Try searching for something else or check back later.</p>
              <Button 
                variant="link" 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary font-bold"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Quick Info Section */}
      <section className="bg-primary/5 py-24 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto text-primary">
                <Utensils className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold font-headline">Quality Guaranteed</h4>
              <p className="text-muted-foreground text-sm">We only partner with verified vendors who meet strict hygiene standards.</p>
            </div>
            <div className="space-y-4">
              <div className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto text-primary">
                <Search className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold font-headline">Smart Search</h4>
              <p className="text-muted-foreground text-sm">Easily find specific cuisines or stalls currently open near you.</p>
            </div>
            <div className="space-y-4">
              <div className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto text-primary">
                <Star className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold font-headline">Customer Reviews</h4>
              <p className="text-muted-foreground text-sm">Real feedback from local foodies to help you choose your next meal.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
