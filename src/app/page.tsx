
import Link from 'next/link';
import Image from 'next/image';
import { QrCode, Smartphone, CreditCard, Award, Utensils, Store, ArrowRight, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-food');

  return (
    <div className="flex min-h-screen flex-col font-body bg-background selection:bg-primary selection:text-white">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="space-y-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-2 border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-500">
                  <Store className="h-4 w-4" />
                  Empowering 500+ Local Vendors
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl font-headline leading-[1.1] animate-in fade-in slide-in-from-left-4 duration-700">
                  Digitizing Street Food <br />
                  <span className="text-primary italic relative">
                    One Plate at a Time
                    <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                    </svg>
                  </span>
                </h1>
                <p className="mx-auto max-w-2xl text-xl text-muted-foreground lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-left-4 duration-1000">
                  Craving helps street food stalls simplify ordering and payments. 
                  Scan, order, and pay seamlessly with our smart QR-based platform.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start pt-4">
                  <Link href="/browse">
                    <Button size="lg" className="w-full h-16 px-10 bg-primary hover:bg-primary/90 sm:w-auto font-bold text-xl rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group">
                      Order Food Now
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/register/vendor">
                    <Button variant="outline" size="lg" className="w-full h-16 px-10 sm:w-auto font-bold text-xl border-2 border-primary text-primary hover:bg-primary/5 rounded-2xl transition-all">
                      Register as Vendor
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center lg:justify-start gap-4 pt-8 text-sm text-muted-foreground">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-background overflow-hidden">
                        <Image 
                          src={`https://picsum.photos/seed/user-${i}/40/40`} 
                          alt="User" 
                          width={40} 
                          height={40} 
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <div className="flex text-primary">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <p className="font-medium text-foreground">Loved by 10k+ foodies</p>
                  </div>
                </div>
              </div>
              
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none group">
                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white transform transition-transform duration-500 group-hover:scale-[1.02]">
                  <Image 
                    src={heroImage?.imageUrl || "https://picsum.photos/seed/food1/1200/800"} 
                    alt="Food Stall Experience" 
                    width={1200}
                    height={800}
                    className="object-cover h-[450px] lg:h-[600px]"
                    priority
                    data-ai-hint="street food"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-10 left-10 right-10 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-xs font-bold uppercase tracking-widest opacity-80">Live Now</p>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold leading-tight">Bombay Street Bites <br/><span className="text-primary font-medium text-xl">Stall #24, Bengaluru</span></p>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />

                {/* Floating UI Cards */}
                <div className="absolute -bottom-8 -left-8 rounded-[1.5rem] bg-white p-5 shadow-2xl flex items-center gap-4 border border-border animate-in slide-in-from-left-8 duration-700 delay-300 transform transition-transform hover:-translate-y-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground leading-tight">Smart QR Ordering</p>
                    <p className="text-sm text-muted-foreground leading-tight">Scan stall to begin</p>
                  </div>
                </div>
                
                <div className="absolute top-12 -right-12 rounded-[1.5rem] bg-white p-5 shadow-2xl hidden md:flex items-center gap-4 border border-border animate-in slide-in-from-right-8 duration-1000 delay-500 transform transition-transform hover:-translate-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                    <Award className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground leading-tight">Loyalty Rewards</p>
                    <p className="text-sm text-muted-foreground leading-tight">Buy 4, Get 1 Free</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
             <Utensils className="w-96 h-96 text-primary" />
          </div>
          <div className="container mx-auto px-4 relative">
            <div className="mb-24 text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent border border-accent/20 uppercase tracking-widest">
                <Sparkles className="h-4 w-4" />
                Modern Solutions
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-headline text-foreground">Everything You Need to Succeed</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">Powerful digital tools designed specifically for the unique pace of street food vendors and the expectations of modern customers.</p>
            </div>
            
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<QrCode className="h-8 w-8" />}
                title="Dynamic QR Menus"
                description="Custom QR codes for every stall. Update your availability and prices in real-time without reprints. No app download required for customers."
                color="bg-primary/10"
              />
              <FeatureCard 
                icon={<Smartphone className="h-8 w-8" />}
                title="Mobile Ordering"
                description="Intuitive interface for customers to browse, customize, and place orders directly. Reduces queue congestion and wait times."
                color="bg-blue-500/10"
              />
              <FeatureCard 
                icon={<CreditCard className="h-8 w-8" />}
                title="Seamless Payments"
                description="Secure cashless transactions integrated with UPI and major wallets. Instant settlement and clear digital receipts for every sale."
                color="bg-green-500/10"
              />
              <FeatureCard 
                icon={<Award className="h-8 w-8" />}
                title="Automated Loyalty"
                description="Built-in 'Buy 4, Get 1 Free' program linked to phone numbers. Reward your regulars effortlessly and keep them coming back."
                color="bg-accent/10"
              />
              <FeatureCard 
                icon={<Sparkles className="h-8 w-8" />}
                title="AI Dish Assistant"
                description="Struggling with menu copy? Our GenAI helps write mouth-watering descriptions that sell your dishes instantly."
                color="bg-purple-500/10"
              />
              <FeatureCard 
                icon={<Store className="h-8 w-8" />}
                title="Vendor Dashboard"
                description="Track daily sales, peak hours, and your most popular menu items. Make data-driven decisions to grow your stall."
                color="bg-amber-500/10"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-24">
          <div className="container mx-auto px-4">
             <div className="bg-white rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full" />
                <div className="max-w-xl space-y-6 relative">
                  <h2 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight">Ready to transform <br/> your food stall?</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">Join hundreds of vendors who have increased their daily sales by 30% using Craving's digital platform.</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/register/vendor">
                      <Button size="lg" className="bg-primary text-white h-14 px-10 font-bold rounded-2xl hover:scale-105 transition-transform">Get Started Free</Button>
                    </Link>
                    <Link href="/contact">
                      <Button variant="outline" size="lg" className="h-14 px-10 font-bold rounded-2xl border-2">Request Demo</Button>
                    </Link>
                  </div>
                </div>
                <div className="relative w-full max-w-sm">
                   <div className="rounded-[2rem] bg-background border p-6 shadow-xl space-y-4">
                      <div className="flex items-center gap-3 border-b pb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">SP</div>
                        <div>
                          <p className="font-bold">Bombay Street Bites</p>
                          <p className="text-xs text-muted-foreground">Stall #24 • Active Now</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-muted-foreground">Today's Sales</span>
                           <span className="font-bold text-green-600">₹8,450.00</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-muted-foreground">Orders Pending</span>
                           <span className="font-bold text-primary">3 Orders</span>
                         </div>
                         <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-primary w-4/5" />
                         </div>
                      </div>
                      <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 font-bold">Open Dashboard</Button>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="space-y-6 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <Utensils className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold font-headline tracking-tight">Craving</span>
              </Link>
              <p className="text-base text-muted-foreground leading-relaxed">
                Revolutionizing street food commerce with smart digital solutions for modern vendors. Digitizing flavor, one plate at a time.
              </p>
              <div className="flex gap-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map(social => (
                  <div key={social} className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-current opacity-20" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-4 text-base text-muted-foreground">
                <li><Link href="/browse" className="hover:text-primary transition-colors">Browse Stall Menus</Link></li>
                <li><Link href="/register/vendor" className="hover:text-primary transition-colors">Vendor Registration</Link></li>
                <li><Link href="/vendors/pricing" className="hover:text-primary transition-colors">Pricing Plans</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Customer Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-4 text-base text-muted-foreground">
                <li><Link href="/faq" className="hover:text-primary transition-colors">Help Center / FAQ</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/feedback" className="hover:text-primary transition-colors">Give Feedback</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-bold text-lg mb-6">Get the App</h4>
              <div className="space-y-3">
                 <div className="h-14 w-full bg-foreground text-white rounded-xl flex items-center px-4 gap-3 cursor-pointer hover:bg-foreground/90 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/20" />
                    <div>
                      <p className="text-[10px] font-medium opacity-70 leading-none">Download on the</p>
                      <p className="text-lg font-bold leading-none">App Store</p>
                    </div>
                 </div>
                 <div className="h-14 w-full bg-foreground text-white rounded-xl flex items-center px-4 gap-3 cursor-pointer hover:bg-foreground/90 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/20" />
                    <div>
                      <p className="text-[10px] font-medium opacity-70 leading-none">GET IT ON</p>
                      <p className="text-lg font-bold leading-none">Google Play</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
          <div className="border-t pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 Craving Tech Solutions India Pvt Ltd. All rights reserved.</p>
            <div className="flex gap-8">
              <span className="hover:text-primary cursor-pointer">Bengaluru, India</span>
              <span className="hover:text-primary cursor-pointer">+91 98765 43210</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="group rounded-[2.5rem] border bg-card p-10 transition-all hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 relative overflow-hidden">
      <div className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl ${color} text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform group-hover:rotate-6 shadow-sm`}>
        {icon}
      </div>
      <h3 className="mb-4 text-2xl font-extrabold group-hover:text-primary transition-colors font-headline leading-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-base">{description}</p>
      <div className="mt-6 pt-6 border-t opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-primary font-bold text-sm">
        Learn more <ArrowRight className="ml-2 h-4 w-4" />
      </div>
    </div>
  );
}
