"use client";

import { useEffect, useState } from "react";

export function AboutSection() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        const currentHour = new Date().getHours();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(currentHour >= 17 && currentHour < 24);
    }, []);

    return (
        <section className="w-full bg-[#121212] py-10 md:py-16 border-y border-white/5">
            <div className="max-w-6xl mx-auto px-4 w-full text-center space-y-8">
                <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                        Catsy Coffee
                    </h2>
                    <p className="text-zinc-400 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto">
                        The business offers a wide variety of beverages such as iced coffee, frappe, soda and pastries.
                        We are dedicated to serving you the finest flavors in a cozy atmosphere.
                    </p>
                </div>
                <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
                    <div className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white">
                        <span className="font-semibold text-zinc-300">Open 5:00 PM - 12:00 AM</span>
                        <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                            <span
                                className={`h-2.5 w-2.5 rounded-full animate-pulse ${isOpen
                                    ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                    : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                    }`}
                            />
                            <span
                                className={`font-bold uppercase tracking-wider text-sm ${isOpen ? "text-green-500" : "text-red-500"
                                    }`}
                            >
                                {isOpen ? "Open Now" : "Closed Now"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
