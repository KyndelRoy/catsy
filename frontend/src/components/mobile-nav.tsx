"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, BookOpen, Star, User } from "lucide-react";

const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/order", label: "Order", icon: ShoppingBag },
    { href: "/menu", label: "Menu", icon: BookOpen },
    { href: "/rewards", label: "Rewards", icon: Star },
    { href: "/account", label: "Account", icon: User },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#121212] backdrop-blur-sm">
            <div className="flex items-center justify-around py-2 px-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${isActive
                                    ? "text-white"
                                    : "text-zinc-500"
                                }`}
                        >
                            <item.icon
                                className={`h-5 w-5 transition-all duration-200 ${isActive ? "scale-110" : ""
                                    }`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span>{item.label}</span>
                            {isActive && (
                                <span className="absolute -bottom-0 w-8 h-0.5 bg-white rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
