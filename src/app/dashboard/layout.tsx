"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    History,
    BarChart3,
    Users,
    Settings,
    Zap,
    Bell,
    Search,
    Menu,
    X,
    LogOut,
    User,
    ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
        { icon: History, label: "Audit Vault", href: "/dashboard/vault" },
        { icon: BarChart3, label: "Forensic Intelligence", href: "/dashboard/intelligence" },
        { icon: Users, label: "Specialist Network", href: "/dashboard/specialists" },
        { icon: Settings, label: "Protocols", href: "/dashboard/protocols" },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = React.useState(false);
    const avatarDropdownRef = React.useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target as Node)) {
                setIsAvatarDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sign out handler
    const handleSignOut = () => {
        setIsAvatarDropdownOpen(false);
        signOut();
        router.push("/auth/signin");
    };

    // Mock profile handler
    const handleViewProfile = () => {
        setIsAvatarDropdownOpen(false);
        router.push("/dashboard/profile");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-orange-100">
            {/* Sidebar Navigation (Desktop) */}
            <aside className="w-72 bg-slate-900 hidden lg:flex flex-col border-r border-slate-800 fixed h-full z-50">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                            A
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-orange-500 transition-colors">247GBS Audit</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item, i) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={i}
                                href={item.href}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${active
                                    ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 space-y-4">
                    <div className="bg-orange-500/10 rounded-3xl p-6 border border-orange-500/10">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2">Ecological Impact</div>
                        <div className="text-2xl font-black text-white italic">Elite</div>
                        <div className="mt-4 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full w-[85%]" />
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Efficiency Threshold</div>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-500 group-hover:scale-150 transition-transform duration-700">
                            <Zap size={60} />
                        </div>
                        <div className="relative z-10 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Membership Status</p>
                            <div className="text-sm font-black text-white mb-4 italic">Tier 2: Growth Specialist</div>
                            <button className="w-full py-2.5 bg-white text-slate-900 rounded-xl font-black text-xs hover:bg-orange-500 hover:text-white transition-all">
                                Upgrade Access
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <React.Fragment> {/* Use React.Fragment instead of AnimatePresence directly if imports are an issue, but AnimatePresence is imported. */}
                {/* Re-using AnimatePresence from framer-motion import */}
                {/* Note: In a real multi-replace, I cannot easily change the import block separately without a separate chunk. 
                     I will assume AnimatePresence is available as per file read. */}
            </React.Fragment>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer */}
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 flex flex-col"
                    >
                        <div className="p-8 flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    A
                                </div>
                                <span className="font-bold text-lg tracking-tight text-white">247GBS</span>
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
                            {menuItems.map((item, i) => {
                                const active = pathname === item.href;
                                return (
                                    <Link
                                        key={i}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${active
                                            ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-6">
                            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Logged In As</p>
                                <div className="text-sm font-black text-white">Demo Account</div>
                            </div>
                        </div>
                    </motion.aside>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 min-h-screen relative">
                {/* Dashboard Header */}
                <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Intelligence Dashboard</h2>
                            <p className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-400">System V.2.1.0 • Node: London-5</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search roadmaps..."
                                className="pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-sm outline-none focus:border-orange-500 focus:bg-white transition-all w-64"
                            />
                        </div>
                        <button className="hidden md:block p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-orange-500 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="relative flex items-center gap-3 md:pl-6 md:border-l border-slate-100" ref={avatarDropdownRef}>
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-black text-slate-900">{user?.name || "Guest"}</div>
                                <div className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">Master Key</div>
                            </div>

                            {/* Avatar Button */}
                            <button
                                onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                                className="flex items-center gap-2 group cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden border-2 border-orange-100 group-hover:border-orange-500 transition-colors">
                                    <img src={user?.avatar || "https://api.dicebear.com/7.x/shapes/svg?seed=guest"} alt="Avatar" />
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`text-slate-400 group-hover:text-orange-500 transition-all duration-200 ${isAvatarDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isAvatarDropdownOpen && (
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
                                                <img src={user?.avatar || "https://api.dicebear.com/7.x/shapes/svg?seed=guest"} alt="Avatar" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{user?.name || "Guest"}</div>
                                                <div className="text-[10px] text-slate-500">{user?.email || "Not signed in"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
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
                    </div>
                </header>

                <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
