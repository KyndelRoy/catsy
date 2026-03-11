"use client";

import { useAuth } from "@/context/auth-context";
import { products } from "@/lib/mock-data";
import { LocationMap } from "@/components/location-map";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Coffee } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  const featured = products.filter((p) => p.featured);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Greeting */}
      <section className="text-center space-y-2">
        <Coffee className="h-10 w-10 mx-auto mb-2" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {greeting}
          {user ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome to Kape Tayo
        </p>
      </section>

      {/* Location Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <h2 className="text-lg font-semibold tracking-tight">Our Location</h2>
        </div>
        <LocationMap />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            196 Bonifacio St, Tagum, Davao del Norte
          </p>
          <a
            href="https://maps.google.com/?q=7.4484,125.8094"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1">
              View on Map
              <ArrowRight className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Featured Products
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border"
            >
              <CardContent className="p-0">
                <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-bold">
                      ₱{product.price.toFixed(2)}
                    </span>
                    <Link href="/menu">
                      <Button size="sm" className="gap-1">
                        View Menu
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
