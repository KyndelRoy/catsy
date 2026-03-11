"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DEV_ACCOUNT } from "@/lib/mock-data";

interface User {
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for existing session
        const stored = localStorage.getItem("catsy_user");
        if (stored) {
            setUser(JSON.parse(stored));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Simulate API delay
        await new Promise((r) => setTimeout(r, 500));

        if (email === DEV_ACCOUNT.email && password === DEV_ACCOUNT.password) {
            const u = { email: DEV_ACCOUNT.email, name: DEV_ACCOUNT.name };
            setUser(u);
            localStorage.setItem("catsy_user", JSON.stringify(u));
            return true;
        }
        return false;
    };

    const signup = async (
        name: string,
        email: string,
        password: string
    ): Promise<boolean> => {
        // For dev: any signup succeeds and creates a session
        await new Promise((r) => setTimeout(r, 500));
        const u = { email, name };
        setUser(u);
        localStorage.setItem("catsy_user", JSON.stringify(u));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("catsy_user");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
