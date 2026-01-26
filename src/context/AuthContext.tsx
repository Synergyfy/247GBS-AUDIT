"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    email: string;
    name: string;
    avatar: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (email: string) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check localStorage on mount for persisted auth state
    useEffect(() => {
        const storedUser = localStorage.getItem("247gbs_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("247gbs_user");
            }
        }
        setIsLoading(false);
    }, []);

    const signIn = (email: string) => {
        const newUser: User = {
            email,
            name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${email}`
        };
        setUser(newUser);
        localStorage.setItem("247gbs_user", JSON.stringify(newUser));
    };

    const signOut = () => {
        setUser(null);
        localStorage.removeItem("247gbs_user");
    };

    // Don't render children until we've checked localStorage
    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
