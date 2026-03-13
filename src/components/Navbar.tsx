
"use client";

import Link from 'next/link';
import { Utensils, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="hidden md:flex items-center gap-8">
          <Link href="/browse" className="text-sm font-medium hover:text-primary transition-colors">Browse Food</Link>
          <Link href="/vendors" className="text-sm font-medium hover:text-primary transition-colors">For Vendors</Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">Our Story</Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/register/vendor">
              <Button size="sm" className="bg-primary text-white hover:bg-primary/90 rounded-full px-5">Join as Vendor</Button>
            </Link>
          </div>
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
            <Link href="/browse" className="text-lg font-medium py-2">Browse Food</Link>
            <Link href="/vendors" className="text-lg font-medium py-2">For Vendors</Link>
            <Link href="/about" className="text-lg font-medium py-2">Our Story</Link>
            <hr className="my-2" />
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">Login</Button>
            </Link>
            <Link href="/register/vendor" className="w-full">
              <Button className="w-full bg-primary">Join as Vendor</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
