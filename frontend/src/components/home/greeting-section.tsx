"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, ShoppingBag, Coffee, Star } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function GreetingSection() {
    const { user } = useAuth();
    const [clientHour, setClientHour] = useState<number | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setClientHour(new Date().getHours());
    }, []);

    const greeting =
        clientHour === null
            ? "Welcome"
            : clientHour < 12
                ? "Good morning"
                : clientHour < 18
                    ? "Good afternoon"
                    : "Good evening";

    return (
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

                {/* Quick Actions - 2x2 on Mobile, 4-Cols on Tablet/Web with optimized sizing */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                    <Link href="/reserve">
                        <Button
                            variant="outline"
                            className="w-full h-auto py-5 md:py-8 lg:py-10 flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group rounded-2xl"
                        >
                            <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-white group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] md:text-sm lg:text-lg font-bold text-white uppercase tracking-widest whitespace-nowrap px-1">
                                Reserve Table
                            </span>
                        </Button>
                    </Link>
                    <Link href="/order">
                        <Button
                            variant="outline"
                            className="w-full h-auto py-5 md:py-8 lg:py-10 flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group rounded-2xl"
                        >
                            <ShoppingBag className="h-6 w-6 lg:h-8 lg:w-8 text-white group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] md:text-sm lg:text-lg font-bold text-white uppercase tracking-widest whitespace-nowrap px-1">
                                Order Pick Up
                            </span>
                        </Button>
                    </Link>
                    <Link href="/menu">
                        <Button
                            variant="outline"
                            className="w-full h-auto py-5 md:py-8 lg:py-10 flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group rounded-2xl"
                        >
                            <Coffee className="h-6 w-6 lg:h-8 lg:w-8 text-white group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] md:text-sm lg:text-lg font-bold text-white uppercase tracking-widest whitespace-nowrap px-1">
                                View Products
                            </span>
                        </Button>
                    </Link>
                    <Link href="/rewards">
                        <Button
                            variant="outline"
                            className="w-full h-auto py-5 md:py-8 lg:py-10 flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group rounded-2xl"
                        >
                            <Star className="h-6 w-6 lg:h-8 lg:w-8 text-white group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] md:text-sm lg:text-lg font-bold text-white uppercase tracking-widest whitespace-nowrap px-1">
                                Get Rewards
                            </span>
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
