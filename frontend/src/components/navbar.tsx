"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, BookOpen, Star, User, Coffee } from "lucide-react";

const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/order", label: "Order", icon: ShoppingBag },
    { href: "/menu", label: "Menu", icon: BookOpen },
    { href: "/rewards", label: "Rewards", icon: Star },
    { href: "/account", label: "Account", icon: User },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#121212] backdrop-blur-sm sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="relative h-8 w-8 rounded-full bg-white flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-12">
                    <Image src="/logo.jpg" alt="Catsy Coffee" fill className="object-contain p-0.5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Catsy Coffee</span>
            </Link>
            <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}
