"use client";

import { useAuth } from "@/context/auth-context";
import { products } from "@/lib/mock-data";
import { LocationMap } from "@/components/location-map";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Coffee, Calendar, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  const featured = products.filter((p) => p.featured);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Full-width Hero Section */}
      <section className="relative w-full h-[28vh] md:h-[35vh] min-h-[210px]">
        <Image
          src="/hero-sectionbg.jpg"
          alt="Catsy Coffee Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex items-center justify-center py-6">
          <div className="relative h-[80%] aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-2">
            <div className="relative w-full h-full">
              <Image
                src="/logo.jpg"
                alt="Catsy Coffee Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Greeting and Quick Actions Container */}
      <section className="max-w-4xl mx-auto px-4 w-full space-y-6 md:space-y-12 mt-8">
        <div className="text-center space-y-4 py-4 md:py-8">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight">
            {greeting}
            {user ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto">
            Welcome to Catsy Coffee
          </p>
        </div>

        {/* Quick Actions - 2x2 on Mobile, 1-Row on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 pt-2 md:pt-4">
          <Link href="/reserve">
            <Button variant="outline" className="w-full h-auto py-3 md:py-8 flex flex-row items-center justify-center gap-1 md:gap-3 bg-background shadow-sm hover:shadow-md transition-all">
              <Calendar className="h-4 w-4 md:h-6 md:w-6 text-primary shrink-0" />
              <span className="text-[10px] md:text-sm lg:text-base font-semibold whitespace-nowrap">Reserve Table</span>
            </Button>
          </Link>
          <Link href="/order">
            <Button variant="outline" className="w-full h-auto py-3 md:py-8 flex flex-row items-center justify-center gap-1 md:gap-3 bg-background shadow-sm hover:shadow-md transition-all">
              <ShoppingBag className="h-4 w-4 md:h-6 md:w-6 text-primary shrink-0" />
              <span className="text-[10px] md:text-sm lg:text-base font-semibold whitespace-nowrap">Order Pick Up</span>
            </Button>
          </Link>
          <Link href="/menu">
            <Button variant="outline" className="w-full h-auto py-3 md:py-8 flex flex-row items-center justify-center gap-1 md:gap-3 bg-background shadow-sm hover:shadow-md transition-all">
              <Coffee className="h-4 w-4 md:h-6 md:w-6 text-primary shrink-0" />
              <span className="text-[10px] md:text-sm lg:text-base font-semibold whitespace-nowrap">View Products</span>
            </Button>
          </Link>
          <Link href="/rewards">
            <Button variant="outline" className="w-full h-auto py-3 md:py-8 flex flex-row items-center justify-center gap-1 md:gap-3 bg-background shadow-sm hover:shadow-md transition-all">
              <Star className="h-4 w-4 md:h-6 md:w-6 text-primary shrink-0" />
              <span className="text-[10px] md:text-sm lg:text-base font-semibold whitespace-nowrap">Get Rewards</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* About Business Section - Full-width Black theme */}
      <section className="w-full bg-[#121212] py-10 md:py-16 border-y border-white/5 mt-8">
        <div className="max-w-4xl mx-auto px-4 w-full text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">About Our Business</h2>
            <p className="text-zinc-400 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto">
              The business offers a wide variety of beverages such as iced coffee, frappe, soda and pastries.
              We are dedicated to serving you the finest flavors in a cozy atmosphere.
            </p>
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white">
              <span className="font-semibold text-zinc-300">Open 5:00 PM - 12:00 AM</span>
              <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                {(() => {
                  const currentHour = new Date().getHours();
                  const isOpen = currentHour >= 17 && currentHour < 24;
                  return (
                    <>
                      <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${isOpen ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"}`} />
                      <span className={`font-bold uppercase tracking-wider text-sm ${isOpen ? "text-green-500" : "text-red-500"}`}>
                        {isOpen ? "Open Now" : "Closed Now"}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Exactly 3 items, Mobile Carousel (1 per view) */}
      <section className="max-w-4xl mx-auto px-4 w-full space-y-8 pt-8 pb-10 mt-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center md:text-left">
          Featured Products
        </h2>
        {/* Responsive Grid/Carousel Container */}
        <div className="flex md:grid md:grid-cols-3 overflow-x-auto snap-x snap-mandatory gap-4 md:gap-8 pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {featured.slice(0, 3).map((product) => (
            <Card
              key={product.id}
              className="flex-none w-[calc(100%-2rem)] md:w-auto snap-center group overflow-hidden hover:shadow-xl transition-all duration-300 border-border aspect-[3/4] flex flex-col bg-background"
            >
              <CardContent className="p-0 flex flex-col h-full">
                {/* Product Image - top half */}
                <div className="relative flex-[1.5] bg-muted flex items-center justify-center overflow-hidden border-b border-border">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-contain transition-transform duration-500 group-hover:scale-110 p-6"
                  />
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs md:text-sm font-bold shadow-sm">
                    ₱{product.price.toFixed(0)}
                  </div>
                </div>
                {/* Product Name & Button - bottom half */}
                <div className="p-4 md:p-5 flex-1 flex flex-col justify-between text-center bg-background group-hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base md:text-lg lg:text-xl line-clamp-1">{product.name}</h3>
                  </div>
                  <Link href="/menu" className="w-full">
                    <Button size="sm" className="w-full h-10 md:h-12 text-xs md:text-sm gap-2 uppercase tracking-widest font-bold">
                      Order <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Full-width Location Section */}
      <section className="w-full relative">
        <LocationMap />
      </section>

      {/* Black Footer - Matched to design */}
      <footer className="w-full bg-black py-12 md:py-16 pb-28 md:pb-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 w-full text-center">
          <p className="text-zinc-500 text-[10px] md:text-sm tracking-[0.3em] font-medium uppercase font-sans whitespace-nowrap overflow-hidden text-ellipsis">
            © 2026 CATSY COFFEE • BREWED WITH PASSION
          </p>
        </div>
      </footer>
    </div>
  );
}
