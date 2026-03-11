import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/mock-data";

export function FeaturedProductsSection() {
    const featured = products.filter((p) => p.featured).slice(0, 3);

    return (
        <section className="w-full bg-[#121212] pt-12 pb-16 border-b border-white/5">
            <div className="max-w-6xl mx-auto px-4 w-full space-y-10">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-white">
                    Featured Products
                </h2>
                {/* Responsive Grid/Carousel Container */}
                <div className="flex md:grid md:grid-cols-3 overflow-x-auto snap-x snap-mandatory gap-6 md:gap-8 pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                    {featured.map((product) => (
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
    );
}
