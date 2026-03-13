'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Store, Phone, FileText, BadgeCheck, Loader2, Key, CheckCircle } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useFirestore, useAuth } from '@/firebase';
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
import { Label } from '@/components/ui/label';
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
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, {
    message: "Phone number must be in E.164 format (e.g., +919876543210).",
  }),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

export default function VendorSignUp() {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [auth]);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      businessName: "",
      gstNumber: "",
      fssaiNumber: "",
      phoneNumber: "+91",
    },
  });

  async function onSendOTP(values: VendorFormValues) {
    if (!auth || !window.recaptchaVerifier) return;
    setIsSubmitting(true);

    try {
      const confirmation = await signInWithPhoneNumber(
        auth, 
        values.phoneNumber, 
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      toast({
        title: "OTP Sent!",
        description: `A verification code has been sent to ${values.phoneNumber}`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: error.message || "Please ensure the phone number is correct and try again.",
      });
      // Reset reCAPTCHA if it fails
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
          if (window.grecaptcha) {
             window.grecaptcha.reset(widgetId);
          }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onVerifyOTP() {
    if (!confirmationResult || !firestore) return;
    setIsVerifying(true);

    try {
      const userCredential = await confirmationResult.confirm(verificationCode);
      const user = userCredential.user;
      const values = form.getValues();

      const vendorId = `vendor-${user.uid}`;
      const vendorRef = doc(firestore, 'vendors', vendorId);

      await setDoc(vendorRef, {
        id: vendorId,
        ownerId: user.uid,
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
        title: "Verification Error",
        description: error.message || "Invalid OTP. Please try again.",
      });
    } finally {
      setIsVerifying(false);
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
              {confirmationResult 
                ? "Enter the code sent to your phone." 
                : "Join Craving and start accepting digital orders today."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!confirmationResult ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSendOTP)} className="space-y-6">
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
                          Phone Number (E.164)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+919876543210" {...field} className="rounded-xl h-12" />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Include country code (e.g., +91 for India).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div id="recaptcha-container"></div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    Enter 6-digit OTP
                  </Label>
                  <Input 
                    type="text" 
                    placeholder="123456" 
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="rounded-xl h-14 text-center text-2xl tracking-[0.5em] font-bold"
                    maxLength={6}
                  />
                </div>
                <Button 
                  onClick={onVerifyOTP} 
                  className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 bg-green-600 hover:bg-green-700 hover:scale-[1.02] transition-all" 
                  disabled={isVerifying || verificationCode.length !== 6}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Verify & Complete
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setConfirmationResult(null)} 
                  className="w-full text-muted-foreground"
                >
                  Edit Details
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="pb-8 pt-2 flex justify-center text-sm text-muted-foreground">
            By registering, you agree to our Terms of Service.
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    grecaptcha: any;
  }
}
