
"use client";

import Link from 'next/link';
import { Utensils, Menu, X, LogOut, LayoutDashboard, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message,
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-headline tracking-tight">Craving</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/browse" className="text-sm font-medium hover:text-primary transition-colors">Browse Food</Link>
          
          {!isUserLoading && user ? (
            <>
              <Link href="/vendor/menu" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                Menu
              </Link>
              <Link href="/vendor/profile" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5">
                <UserCircle className="h-4 w-4" />
                Stall Profile
              </Link>
              <div className="flex items-center gap-3 ml-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-destructive gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/vendors" className="text-sm font-medium hover:text-primary transition-colors">For Vendors</Link>
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register/vendor">
                  <Button size="sm" className="bg-primary text-white hover:bg-primary/90 rounded-full px-5 font-bold shadow-lg shadow-primary/10">
                    Join as Vendor
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b bg-background p-4 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-4">
            <Link href="/browse" className="text-lg font-medium py-2" onClick={() => setIsOpen(false)}>Browse Food</Link>
            
            {!isUserLoading && user ? (
              <>
                <Link href="/vendor/menu" className="text-lg font-medium py-2 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  Manage Menu
                </Link>
                <Link href="/vendor/profile" className="text-lg font-medium py-2 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <UserCircle className="h-5 w-5 text-primary" />
                  Stall Profile
                </Link>
                <hr className="my-2" />
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 border-destructive text-destructive hover:bg-destructive/5" 
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/vendors" className="text-lg font-medium py-2" onClick={() => setIsOpen(false)}>For Vendors</Link>
                <hr className="my-2" />
                <Link href="/login" className="w-full" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/register/vendor" className="w-full" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-primary font-bold">Join as Vendor</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
