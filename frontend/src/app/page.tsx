"use client";
import { useEffect, useState } from "react";

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
  const [clientHour, setClientHour] = useState<number | null>(null);

  useEffect(() => {
    setClientHour(new Date().getHours());
  }, []);

  const greeting = clientHour === null
    ? "Welcome"
    : clientHour < 12 ? "Good morning" : clientHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#121212]">
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

      {/* Greeting and Quick Actions Container - Dark Theme matched to design */}
      <section className="w-full bg-[#121212] py-12 md:py-20 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 w-full space-y-8 md:space-y-16">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-none text-white">
              {greeting}, {user ? user.name : "Customer"}!
            </h1>
            <p className="text-zinc-400 text-xl md:text-3xl lg:text-4xl max-w-4xl mx-auto font-medium tracking-tight">
              Welcome to Catsy Coffee
            </p>
          </div>

          {/* Quick Actions - 2x2 on Mobile, 1-Row on Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <Link href="/reserve">
              <Button variant="outline" className="w-full h-auto py-5 md:py-10 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group rounded-2xl">
                <Calendar className="h-6 w-6 md:h-8 md:w-8 text-white group-hover:scale-110 transition-transform" />
                <span className="text-xs md:text-lg font-bold text-white uppercase tracking-widest">Reserve Table</span>
              </Button>
            </Link>
            <Link href="/order">
              <Button variant="outline" className="w-full h-auto py-5 md:py-10 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group rounded-2xl">
                <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-white group-hover:scale-110 transition-transform" />
                <span className="text-xs md:text-lg font-bold text-white uppercase tracking-widest">Order Pick Up</span>
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline" className="w-full h-auto py-5 md:py-10 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group rounded-2xl">
                <Coffee className="h-6 w-6 md:h-8 md:w-8 text-white group-hover:scale-110 transition-transform" />
                <span className="text-xs md:text-lg font-bold text-white uppercase tracking-widest">View Products</span>
              </Button>
            </Link>
            <Link href="/rewards">
              <Button variant="outline" className="w-full h-auto py-5 md:py-10 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group rounded-2xl">
                <Star className="h-6 w-6 md:h-8 md:w-8 text-white group-hover:scale-110 transition-transform" />
                <span className="text-xs md:text-lg font-bold text-white uppercase tracking-widest">Get Rewards</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Business Section - Full-width Black theme */}
      <section className="w-full bg-[#121212] py-10 md:py-16 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 w-full text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">Catsy Coffee</h2>
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

      {/* Featured Products - Exactly 3 items, Mobile Carousel (1 per view) - White Square Cards on Dark Background */}
      <section className="w-full bg-[#121212] pt-12 pb-16 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 w-full space-y-10">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-white">
            Featured Products
          </h2>
          {/* Responsive Grid/Carousel Container */}
          <div className="flex md:grid md:grid-cols-3 overflow-x-auto snap-x snap-mandatory gap-6 md:gap-8 pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {featured.slice(0, 3).map((product) => (
              <Card
                key={product.id}
                className="flex-none w-[calc(100%-2rem)] md:w-auto snap-center group overflow-hidden hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)] transition-all duration-300 border-none aspect-square flex flex-col bg-white rounded-3xl"
              >
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Row 1: Product Image */}
                  <div className="relative flex-[1.4] bg-white flex items-center justify-center overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={220}
                      height={220}
                      className="object-contain transition-transform duration-500 group-hover:scale-105 p-6 md:p-8"
                    />
                    <div className="absolute top-4 right-4 bg-[#121212] px-3 py-1 rounded-full text-[10px] md:text-xs font-black text-white shadow-xl">
                      ₱{product.price.toFixed(0)}
                    </div>
                  </div>

                  {/* Row 2: Name and Order Button */}
                  <div className="p-4 md:p-6 flex-none bg-white border-t border-zinc-100 flex items-center justify-between gap-4">
                    <h3 className="font-black text-sm md:text-lg lg:text-xl text-black truncate flex-1 uppercase tracking-tight">
                      {product.name}
                    </h3>
                    <Link href="/menu">
                      <Button className="h-10 md:h-12 px-6 bg-[#121212] text-white hover:bg-zinc-800 rounded-xl font-bold text-[10px] md:text-xs tracking-[0.15em] uppercase transition-all active:scale-95 shadow-lg">
                        Order
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width Location Section */}
      <section className="w-full relative">
        <LocationMap />
      </section>

      {/* Black Footer - Matched to design */}
      <footer className="w-full bg-black py-12 md:py-16 pb-28 md:pb-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 w-full text-center">
          <p className="text-zinc-500 text-[10px] md:text-sm tracking-[0.3em] font-medium uppercase font-sans whitespace-nowrap overflow-hidden text-ellipsis">
            © 2026 CATSY COFFEE • BREWED WITH PASSION
          </p>
        </div>
      </footer>
    </div>
  );
}
