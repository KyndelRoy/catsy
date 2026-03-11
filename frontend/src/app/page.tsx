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
    <div className="w-full flex flex-col min-h-screen space-y-8 pb-10">
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
      <section className="max-w-4xl mx-auto px-4 w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {greeting}
            {user ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome to Catsy Coffee
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <Link href="/reserve">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-background shadow-sm hover:shadow-md transition-all">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xs md:text-sm font-semibold">Reserve Table</span>
            </Button>
          </Link>
          <Link href="/order">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-background shadow-sm hover:shadow-md transition-all">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xs md:text-sm font-semibold">Order Pick Up</span>
            </Button>
          </Link>
          <Link href="/menu">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-background shadow-sm hover:shadow-md transition-all">
              <Coffee className="h-6 w-6 text-primary" />
              <span className="text-xs md:text-sm font-semibold">View Products</span>
            </Button>
          </Link>
          <Link href="/rewards">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-background shadow-sm hover:shadow-md transition-all">
              <Star className="h-6 w-6 text-primary" />
              <span className="text-xs md:text-sm font-semibold">Get Rewards</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-4xl mx-auto px-4 w-full space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Featured Products
        </h2>
        {/* Horizontal scroll container (3 items row) */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {featured.slice(0, 3).map((product) => (
            <Card
              key={product.id}
              className="flex-none w-[280px] sm:w-[calc(33.333%-11px)] snap-start group overflow-hidden hover:shadow-lg transition-all duration-300 border-border"
            >
              <CardContent className="p-0 flex flex-col h-full">
                <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold">
                      ₱{product.price.toFixed(2)}
                    </span>
                    <Link href="/menu">
                      <Button size="sm" variant="secondary" className="gap-1 px-3">
                        Order <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Full-width Location Section */}
      <section className="w-full relative mt-8">
        <LocationMap />
      </section>
    </div>
  );
}
