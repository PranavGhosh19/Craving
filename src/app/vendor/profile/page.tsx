
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Store, MapPin, FileText, BadgeCheck, Upload, X, Loader2, Save, ExternalLink } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const profileSchema = z.object({
  name: z.string().min(2, "Stall name must be at least 2 characters."),
  description: z.string().min(10, "Description should be informative."),
  locationDescription: z.string().min(5, "Tell customers where to find you."),
  gstNumber: z.string().min(15).max(15),
  fssaiNumber: z.string().min(14).max(14),
  profileImageUrl: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function VendorProfilePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const vendorId = user ? `vendor-${user.uid}` : null;
  const vendorRef = useMemoFirebase(() => {
    if (!firestore || !vendorId) return null;
    return doc(firestore, 'vendors', vendorId);
  }, [firestore, vendorId]);

  const { data: vendor, isLoading: isVendorLoading } = useDoc(vendorRef);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      description: "",
      locationDescription: "",
      gstNumber: "",
      fssaiNumber: "",
      profileImageUrl: "",
    },
  });

  useEffect(() => {
    if (vendor) {
      form.reset({
        name: vendor.name || "",
        description: vendor.description || "",
        locationDescription: vendor.locationDescription || "",
        gstNumber: vendor.gstNumber || "",
        fssaiNumber: vendor.fssaiNumber || "",
        profileImageUrl: vendor.profileImageUrl || "",
      });
      if (vendor.profileImageUrl) {
        setImagePreview(vendor.profileImageUrl);
      }
    }
  }, [vendor, form]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Max 1MB allowed for profile photo.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        form.setValue('profileImageUrl', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: ProfileValues) {
    if (!firestore || !vendorId) return;
    setIsUpdating(true);

    try {
      await updateDoc(doc(firestore, 'vendors', vendorId), {
        ...values,
        updatedAt: new Date().toISOString(),
      });
      toast({
        title: "Profile Updated",
        description: "Your stall details have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save profile changes. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  if (isUserLoading || isVendorLoading) {
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
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold font-headline">Stall Profile</h1>
            {vendorId && (
              <Link href={`/v/${vendorId}`} target="_blank">
                <Button variant="outline" className="gap-2 rounded-xl">
                  <ExternalLink className="h-4 w-4" />
                  View Public Menu
                </Button>
              </Link>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card className="shadow-xl rounded-[2rem] border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <CardTitle className="text-xl">Business Information</CardTitle>
                  <CardDescription>This information is visible to your customers.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="space-y-4">
                      <Label>Profile Photo</Label>
                      {imagePreview ? (
                        <div className="relative h-40 w-40 rounded-[2rem] overflow-hidden border-4 border-white shadow-lg group">
                          <Image src={imagePreview} alt="Stall Photo" fill className="object-cover" />
                          <button 
                            type="button" 
                            onClick={() => {
                              setImagePreview(null);
                              form.setValue('profileImageUrl', '');
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="h-40 w-40 rounded-[2rem] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 transition-all bg-muted/30"
                        >
                          <Upload className="h-6 w-6 text-primary" />
                          <span className="text-xs font-bold text-muted-foreground">Upload Photo</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>

                    <div className="flex-1 space-y-6 w-full">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Store className="h-4 w-4 text-primary" />
                              Stall Name
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Bombay Street Bites" {...field} className="rounded-xl h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="locationDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              Location Details
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Stall #24, Near City Park Main Gate" {...field} className="rounded-xl h-12" />
                            </FormControl>
                            <FormDescription>Help customers find your stall easily.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stall Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell your story. What makes your food special?" 
                            {...field} 
                            className="rounded-xl min-h-[120px]" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-xl rounded-[2rem] border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <CardTitle className="text-xl">Compliance & Legal</CardTitle>
                  <CardDescription>Verified business details for platform trust.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="gstNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          GST Number
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl h-12 uppercase" maxLength={15} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fssaiNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4 text-primary" />
                          FSSAI Number
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl h-12" maxLength={14} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="bg-muted/30 pt-6 pb-6 border-t">
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 gap-2" 
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    Save Profile Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
