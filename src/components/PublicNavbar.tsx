"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, ChevronDown, Menu, X } from "lucide-react";

export function PublicNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, signOut } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Ensure hooks are consistent
    console.log("PublicNavbar Render path:", pathname);

    // Handle click outside to close dropdown - MUST be before any early returns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Do not show on dashboard or admin pages - AFTER all hooks
    if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
        return null;
    }

    const handleSignOut = () => {
        signOut();
        setIsDropdownOpen(false);
        router.push("/auth/signin");
    };

    const handleViewProfile = () => {
        setIsDropdownOpen(false);
        router.push("/dashboard/profile");
    };

    const handleGotoDashboard = () => {
        setIsDropdownOpen(false);
        router.push("/dashboard");
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                        A
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">247GBS Audit</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
                    <a href="/#comparison" className="hover:text-orange-500 transition-colors">Compare Audits</a>
                    <a href="/#why" className="hover:text-orange-500 transition-colors">Why Seasonal?</a>

                    {isAuthenticated && user ? (
                        /* Avatar Dropdown for Authenticated Users */
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 group cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden border-2 border-orange-200 group-hover:border-orange-500 transition-colors">
                                    <img src={user.avatar} alt="Avatar" />
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`text-slate-400 group-hover:text-orange-500 transition-all duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                                >
                                    {/* User Info Header */}
                                    <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-orange-50 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden border-2 border-orange-200">
                                                <img src={user.avatar} alt="Avatar" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{user.name}</div>
                                                <div className="text-[10px] text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <button
                                            onClick={handleGotoDashboard}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors group"
                                        >
                                            <div className="w-8 h-8 bg-slate-100 group-hover:bg-orange-100 rounded-lg flex items-center justify-center transition-colors">
                                                <svg className="w-4 h-4 text-slate-500 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                            </div>
                                            <span className="font-semibold">Dashboard</span>
                                        </button>

                                        <button
                                            onClick={handleViewProfile}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors group"
                                        >
                                            <div className="w-8 h-8 bg-slate-100 group-hover:bg-orange-100 rounded-lg flex items-center justify-center transition-colors">
                                                <User size={16} className="text-slate-500 group-hover:text-orange-600" />
                                            </div>
                                            <span className="font-semibold">My Profile</span>
                                        </button>

                                        <div className="mx-4 my-1 border-t border-slate-100" />

                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
                                        >
                                            <div className="w-8 h-8 bg-slate-100 group-hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                                                <LogOut size={16} className="text-slate-500 group-hover:text-red-600" />
                                            </div>
                                            <span className="font-semibold">Sign Out</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        /* Auth Buttons for Unauthenticated Users */
                        <>
                            <Link
                                href="/auth/signin"
                                className="text-slate-600 hover:text-orange-500 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-600 hover:text-orange-500"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-white border-t border-orange-100 px-6 py-4 space-y-4"
                >
                    <a href="/#comparison" className="block py-2 text-sm font-semibold hover:text-orange-500 transition-colors">Compare Audits</a>
                    <a href="/#why" className="block py-2 text-sm font-semibold hover:text-orange-500 transition-colors">Why Seasonal?</a>

                    {isAuthenticated && user ? (
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <div className="flex items-center gap-3 py-2">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden border-2 border-orange-200">
                                    <img src={user.avatar} alt="Avatar" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">{user.name}</div>
                                    <div className="text-[10px] text-slate-500">{user.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 pt-2">
                            <Link
                                href="/auth/signin"
                                className="block w-full text-center py-2.5 text-sm font-bold text-slate-600 hover:text-orange-500 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full shadow-lg shadow-orange-200 transition-all font-bold"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </motion.div>
            )}
        </nav>
    );
}
