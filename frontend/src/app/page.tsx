"use client";

import { HeroSection } from "@/components/home/hero-section";
import { GreetingSection } from "@/components/home/greeting-section";
import { AboutSection } from "@/components/home/about-section";
import { FeaturedProductsSection } from "@/components/home/featured-products-section";
import { LocationMap } from "@/components/location-map";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-[#121212]">
      <HeroSection />
      <GreetingSection />
      <AboutSection />
      <FeaturedProductsSection />

      {/* Full-width Location Section */}
      <section className="w-full relative">
        <LocationMap />
      </section>

      <Footer />
    </div>
  );
}
