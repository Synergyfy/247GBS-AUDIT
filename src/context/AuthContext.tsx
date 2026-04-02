"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { refreshAccessToken } from "@/lib/auth";

interface User {
    email: string;
    name: string;
    avatar: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (userData: Partial<User> & { email: string }) => void;
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

    // Periodically refresh access token to keep session alive and notify listeners
    useEffect(() => {
        let mounted = true;
        const doRefresh = async () => {
            try {
                const token = await refreshAccessToken();
                if (!mounted) return;
                if (token) {
                    // Notify other hooks/components that token changed by dispatching a storage event
                    try {
                        const ev = new StorageEvent('storage', { key: '247gbs_token', newValue: token });
                        window.dispatchEvent(ev);
                    } catch (err) {
                        // Fallback: dispatch a generic event
                        window.dispatchEvent(new Event('247gbs_token_refreshed'));
                    }
                }
            } catch {
                // ignore
            }
        };

        // initial refresh and then every 60s
        doRefresh();
        const id = setInterval(doRefresh, 60 * 1000);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, []);

    const signIn = (userData: Partial<User> & { email: string }) => {
        const newUser: User = {
            email: userData.email,
            name: userData.name || userData.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            avatar: userData.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${userData.email}`,
            role: userData.role || 'User',
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
