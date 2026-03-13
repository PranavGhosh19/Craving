'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Loader2, Key, CheckCircle, ArrowLeft } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (auth && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            toast({
              variant: "destructive",
              title: "Verification Expired",
              description: "Please try sending the code again.",
            });
          }
        });
      } catch (error) {
        console.error("reCAPTCHA initialization failed", error);
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [auth]);

  async function onSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!auth || !recaptchaVerifierRef.current) {
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Verification system not ready. Please refresh.",
      });
      return;
    }

    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number in E.164 format (e.g., +919876543210).",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const confirmation = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        recaptchaVerifierRef.current
      );
      setConfirmationResult(confirmation);
      toast({
        title: "OTP Sent!",
        description: `A verification code has been sent to ${phoneNumber}`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: error.message || "Please ensure the phone number is correct.",
      });
      
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onVerifyOTP() {
    if (!confirmationResult) return;
    setIsVerifying(true);

    try {
      await confirmationResult.confirm(verificationCode);
      toast({
        title: "Welcome Back!",
        description: "You have successfully logged in.",
      });
      router.push('/vendor/menu'); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "Invalid OTP. Please try again.",
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
              <Phone className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-extrabold font-headline">Vendor Login</CardTitle>
            <CardDescription className="text-base">
              {confirmationResult 
                ? "Enter the 6-digit code sent to your mobile." 
                : "Enter your registered mobile number to continue."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!confirmationResult ? (
              <form onSubmit={onSendOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Mobile Number
                  </Label>
                  <Input 
                    id="phone"
                    placeholder="+919876543210" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-xl h-12" 
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Include country code (e.g., +91 for India).
                  </p>
                </div>
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
                    "Send Login Code"
                  )}
                </Button>
                <div className="text-center">
                  <Link href="/register/vendor" className="text-sm text-primary hover:underline font-medium">
                    New vendor? Register your stall here
                  </Link>
                </div>
              </form>
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
                      Verify & Login
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setConfirmationResult(null)} 
                  className="w-full text-muted-foreground gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change Number
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="pb-8 pt-2 flex justify-center text-sm text-muted-foreground">
            By logging in, you agree to our terms.
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
