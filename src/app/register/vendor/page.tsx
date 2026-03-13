'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Store, Phone, FileText, BadgeCheck, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase/provider';
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

const vendorFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  gstNumber: z.string().min(15, {
    message: "GST Number must be 15 characters.",
  }).max(15),
  fssaiNumber: z.string().min(14, {
    message: "FSSAI Number must be 14 characters.",
  }).max(14),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

export default function VendorSignUp() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      businessName: "",
      gstNumber: "",
      fssaiNumber: "",
      phoneNumber: "",
    },
  });

  async function onSubmit(values: VendorFormValues) {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      // Check if user is already logged in
      let currentUser = auth.currentUser;

      if (!currentUser) {
        initiateAnonymousSignIn(auth);
        toast({
          title: "Signing you in...",
          description: "Please wait while we set up your secure session.",
        });
        
        // Wait up to 3 seconds for the user to be signed in
        let attempts = 0;
        while (!auth.currentUser && attempts < 15) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }
        currentUser = auth.currentUser;
      }

      if (!currentUser) {
         throw new Error("Anonymous Auth failed. Please ensure 'Anonymous' sign-in is enabled in your Firebase Console (Authentication > Sign-in method).");
      }

      const vendorId = `vendor-${currentUser.uid}`;
      const vendorRef = doc(firestore, 'vendors', vendorId);

      await setDoc(vendorRef, {
        id: vendorId,
        ownerId: currentUser.uid,
        name: values.businessName,
        gstNumber: values.gstNumber,
        fssaiNumber: values.fssaiNumber,
        contactPhone: values.phoneNumber,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Registration Successful!",
        description: "Your stall is ready. Now let's build your menu!",
      });
      
      router.push(`/vendor/menu`); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: error.message || "Failed to create vendor profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 flex justify-center items-center">
        <Card className="w-full max-w-md shadow-2xl rounded-[2rem] border-primary/10 overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="space-y-4 pt-8 text-center">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Store className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-extrabold font-headline">Vendor Registration</CardTitle>
            <CardDescription className="text-base">
              Join Craving and start accepting digital orders today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        Business Name
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
                  name="gstNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        GST Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="15-character GSTIN" {...field} className="rounded-xl h-12 uppercase" />
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
                        FSSAI License Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="14-digit FSSAI number" {...field} className="rounded-xl h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit mobile number" {...field} className="rounded-xl h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    "Join as Vendor"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="pb-8 pt-2 flex justify-center text-sm text-muted-foreground">
            By registering, you agree to our Terms of Service.
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
