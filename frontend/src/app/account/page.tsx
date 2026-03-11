"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Edit,
    CreditCard,
    Bell,
    HelpCircle,
    LogOut,
    LogIn,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
    { label: "Edit Profile", icon: Edit, href: "#" },
    { label: "Payment Methods", icon: CreditCard, href: "#" },
    { label: "Notification Settings", icon: Bell, href: "#" },
    { label: "Help & Support", icon: HelpCircle, href: "#" },
];

export default function AccountPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    if (!user) {
        return (
            <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <User className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Sign In Required</h1>
                    <p className="text-muted-foreground">
                        Please sign in to view your account
                    </p>
                </div>
                <Link href="/login">
                    <Button className="gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign In
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            {/* Profile Header */}
            <div className="text-center space-y-3">
                <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                    {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                </div>
                <div>
                    <h1 className="text-xl font-bold">{user.name}</h1>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <Separator />

            {/* Menu Items */}
            <div className="space-y-1">
                {menuItems.map((item) => (
                    <Link key={item.label} href={item.href}>
                        <Card className="border-0 shadow-none hover:bg-muted transition-colors duration-150">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <item.icon className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <Separator />

            {/* Logout */}
            <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                    logout();
                    router.push("/login");
                }}
            >
                <LogOut className="h-4 w-4" />
                Logout
            </Button>

            {/* Dev Info */}
            <p className="text-xs text-muted-foreground text-center">
                Dev Account: dev@catsy.coffee / catsy123
            </p>
        </div>
    );
}
