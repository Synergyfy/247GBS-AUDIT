"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from "react";
import CookieConsent from "./CookieConsent";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            {children}
            <CookieConsent />
        </AuthProvider>
    );
}
