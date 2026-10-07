"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { refreshAccessToken, SESSION_EXPIRED_EVENT, USER_UPDATED_EVENT, isProtectedRoute, clearSession, normalizeUser, buildSessionUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";

type User = SessionUser;

export { normalizeUser, buildSessionUser };
export type { SessionUser };

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (userData: Partial<User> & { email: string }) => void;
    signOut: () => void;
    refreshUserFromProfile: (profile: Record<string, unknown>) => void;
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
                const parsed = JSON.parse(storedUser);
                if (parsed?.email) {
                    const normalized = normalizeUser(parsed);
                    setUser(normalized);
                    localStorage.setItem("247gbs_user", JSON.stringify(normalized));
                } else {
                    localStorage.removeItem("247gbs_user");
                }
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
            clearSession();
            setUser(null);
        };

        const redirectToSignIn = () => {
            try {
                const current = window.location.pathname;
                if (current.startsWith("/auth/")) return; // already on an auth screen
                // Only redirect from genuinely protected customer routes.
                // Public pages (/, /pricing, /solutions, /services, /funding,
                // /support, /audit/*, ...) and the temporarily-public /admin/*
                // pages must NEVER bounce to sign-in just because an old/expired
                // session token exists — the stale session is silently cleared
                // by invalidateStaleSession.
                if (!isProtectedRoute(current)) return;
                if (current.startsWith("/admin")) {
                    window.location.assign("/admin/login?reason=session-expired");
                } else {
                    window.location.assign("/auth/signin?reason=session-expired");
                }
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
            if (e.key === "247gbs_user") {
                if (e.newValue === null) {
                    if (mounted) invalidateStaleSession();
                } else if (mounted) {
                    try {
                        const parsed = JSON.parse(e.newValue);
                        if (parsed?.email) setUser(normalizeUser(parsed));
                    } catch {
                        // ignore
                    }
                }
            }
        };

        const onUserUpdated = () => {
            if (!mounted) return;
            const stored = localStorage.getItem("247gbs_user");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed?.email) setUser(normalizeUser(parsed));
                } catch {
                    // ignore
                }
            }
        };

        const onTokenRefreshed = () => {
            // Access token rotated — no user change needed. Kept for compat with
            // legacy 'auth_token_refreshed' dispatches.
        };

        window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
        window.addEventListener("storage", onStorageChange);
        window.addEventListener(USER_UPDATED_EVENT, onUserUpdated);
        window.addEventListener("247gbs:user-updated", onUserUpdated);
        window.addEventListener("auth_token_refreshed", onTokenRefreshed);

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
        const hasSession = localStorage.getItem("247gbs_user") || localStorage.getItem("247gbs_token") || localStorage.getItem("auth_token");
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
            window.removeEventListener(USER_UPDATED_EVENT, onUserUpdated);
            window.removeEventListener("247gbs:user-updated", onUserUpdated);
            window.removeEventListener("auth_token_refreshed", onTokenRefreshed);
            clearInterval(id);
        };
    }, []);

    const signIn = (userData: Partial<User> & { email: string }) => {
        const newUser = normalizeUser(userData);
        setUser(newUser);
        try {
            localStorage.setItem("247gbs_user", JSON.stringify(newUser));
            window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT));
        } catch {
            // ignore
        }
    };

    // Sync context from a freshly fetched profile (e.g. /users/profile) when
    // context is null/stale but token is valid. Merges firstName/lastName into
    // display name instead of leaving header as Guest.
    const refreshUserFromProfile = (profile: Record<string, unknown>) => {
        const built = buildSessionUser(profile);
        if (!built) return;
        setUser((prev) => {
            if (prev && prev.email === built.email && prev.name === built.name && prev.role === built.role) {
                return prev;
            }
            try {
                localStorage.setItem("247gbs_user", JSON.stringify(built));
            } catch {
                // ignore
            }
            return built;
        });
    };

    const signOut = () => {
        // Best-effort server logout (invalidates DB refresh hash + clears HttpOnly cookies).
        try {
            const token = localStorage.getItem("247gbs_token") || localStorage.getItem("auth_token");
            fetch(`${API_BASE_URL}/auth/logout`, {
                method: "GET",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                credentials: "include",
            }).catch(() => {});
        } catch {
            // ignore
        }
        setUser(null);
        clearSession();
    };

    // Don't render children until we've checked localStorage
    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut, refreshUserFromProfile }}>
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
