"use client";

import Link from "next/link";
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
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2 group">
                <Coffee className="h-7 w-7 transition-transform group-hover:rotate-12" />
                <span className="text-xl font-bold tracking-tight">Kape Tayo</span>
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
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
