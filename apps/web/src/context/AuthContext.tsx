"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { refreshAccessToken, SESSION_EXPIRED_EVENT } from "@/lib/auth";

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
        let invalidSession = false;

        const invalidateStaleSession = () => {
            invalidSession = true;
            localStorage.removeItem("247gbs_user");
            localStorage.removeItem("auth_token");
            localStorage.removeItem("247gbs_token");
            setUser(null);
        };

        const redirectToSignIn = () => {
            try {
                const current = window.location.pathname;
                if (current.startsWith("/auth/")) return; // already on an auth screen
                // Only redirect from authenticated areas. Public pages (/, /pricing,
                // /solutions, /services, /funding, /support, /audit/*, ...) must NEVER
                // bounce to sign-in just because an old/expired session token exists —
                // the stale session is silently cleared by invalidateStaleSession.
                if (!current.startsWith("/dashboard") && !current.startsWith("/admin")) return;
                window.location.assign("/auth/signin?reason=session-expired");
            } catch {
                // ignore
            }
        };

        const onSessionExpired = () => {
            if (!mounted) return;
            if (invalidSession) return;
            invalidateStaleSession();
            redirectToSignIn();
        };

        const onStorageChange = (e: StorageEvent) => {
            // Sign-out (or removal) in another tab invalidates this tab too.
            if (e.key === "247gbs_user" && e.newValue === null) {
                if (mounted) invalidateStaleSession();
            }
        };

        window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
        window.addEventListener("storage", onStorageChange);

        const doRefresh = async () => {
            try {
                const token = await refreshAccessToken();
                if (token === false) {
                    if (mounted) invalidateStaleSession();
                    return; // onSessionExpired (dispatched by the refresh) redirects
                }
                if (!mounted || !token) return;
                try {
                    const ev = new StorageEvent('storage', { key: 'auth_token', newValue: token });
                    window.dispatchEvent(ev);
                } catch {
                    window.dispatchEvent(new Event('auth_token_refreshed'));
                }
            } catch {
                // ignore
            }
        };

        // Only attempt refresh if there's a stored session (skip on auth pages, fresh visits)
        const hasSession = localStorage.getItem("247gbs_user") || localStorage.getItem("auth_token");
        if (!hasSession) {
            // Still listen for expirations driven by other tabs/API callers.
        } else {
            doRefresh();
        }
        // Heartbeat keeps the access token fresh well below its expiry. The
        // 60s cadence rotated the refresh cookie unnecessarily often; 5 minutes
        // is comfortably inside the default 15-minute access-token window.
        const id = setInterval(() => {
            if (!invalidSession) doRefresh();
        }, 5 * 60 * 1000);
        return () => {
            mounted = false;
            window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
            window.removeEventListener("storage", onStorageChange);
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
