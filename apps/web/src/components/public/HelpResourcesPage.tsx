"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, LifeBuoy, Mail, Sparkles } from "lucide-react";
import { fetchHelpResources, fetchPublicSettings, type PublicSettings } from "@/services/public/settings";
import type { HelpResource } from "@/services/admin/settings";

export interface HelpResourcePageConfig {
    category: "support" | "service" | "funding" | "guide";
    title: string;
    subtitle: string;
    fallbackItems: { title: string; description: string; href: string }[];
    ctaLabel: string;
    ctaHref: string;
    ctaNote: string;
}

export function HelpResourcesPage(config: HelpResourcePageConfig) {
    const [settings, setSettings] = useState<PublicSettings | null>(null);
    const [resources, setResources] = useState<HelpResource[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [s, r] = await Promise.all([
                fetchPublicSettings(),
                fetchHelpResources(config.category),
            ]);
            if (cancelled) return;
            setSettings(s);
            setResources(r);
            setLoaded(true);
        })();
        return () => { cancelled = true; };
    }, [config.category]);

    const showResources = loaded && resources.length > 0;
    const items = showResources
        ? resources.map(r => ({
              title: r.title,
              description: r.description || "",
              href: r.href || "/",
          }))
        : config.fallbackItems;

    const supportEmail = settings?.supportEmail || "support@247gbs.com";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
            {/* Header */}
            <div className="bg-slate-900 px-6 pt-16 sm:pt-20 pb-14 sm:pb-16 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="max-w-2xl mx-auto relative">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-orange-400 mb-4 block">
                        {settings?.platformName || "247GBS Audit"}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{config.title}</h1>
                    <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">{config.subtitle}</p>
                </div>
            </div>

            {/* Resource cards */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 -mt-6 relative">
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                            <BookOpen size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Recommended next steps
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {items.map((item, i) => (
                            <Link
                                key={`${item.title}-${i}`}
                                href={item.href}
                                className="group rounded-2xl border border-slate-100 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 transition-all p-5 flex flex-col justify-between"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-white group-hover:bg-orange-500 text-orange-500 group-hover:text-white rounded-xl flex items-center justify-center shrink-0 transition-colors">
                                        {i % 2 === 0 ? <Sparkles size={16} /> : <LifeBuoy size={16} />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                            {item.title}
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                            {item.description || "Learn more about this 247GBS resource."}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-orange-600 transition-colors">
                                    Explore <ArrowRight size={12} />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-8 rounded-2xl bg-slate-900 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                        <div>
                            <div className="font-bold text-white text-lg mb-1">{config.ctaLabel}</div>
                            <p className="text-slate-400 text-sm">{config.ctaNote}</p>
                        </div>
                        <Link
                            href={config.category === "support" ? `mailto:${supportEmail}` : config.ctaHref}
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-orange-500/30 transition-all whitespace-nowrap"
                        >
                            {config.category === "support" && <Mail size={16} />}
                            {config.category === "support" ? supportEmail : config.ctaLabel}
                            <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}