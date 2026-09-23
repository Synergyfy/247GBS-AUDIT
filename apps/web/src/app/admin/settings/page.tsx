"use client";

import React, { useEffect, useState } from "react";
import {
    Globe,
    Save,
    CheckCircle2,
    Loader2,
    BookOpen,
    Plus,
    Trash2
} from "lucide-react";
import {
    fetchAdminSettings,
    fetchAdminHelpResources,
    saveAdminSettings,
    createHelpResource,
    updateHelpResource,
    deleteHelpResource,
    type HelpResource
} from "@/services/admin/settings";

interface ToggleProps {
    enabled: boolean;
    onToggle: () => void;
}

function Toggle({ enabled, onToggle }: ToggleProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-orange-500" : "bg-slate-200"}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
            />
        </button>
    );
}

const CATEGORY_OPTIONS = ["support", "service", "funding", "guide"];

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // General / landing settings (real API)
    const [platformName, setPlatformName] = useState("247GBS Audit");
    const [supportEmail, setSupportEmail] = useState("support@247gbs.com");
    const [landingTitle, setLandingTitle] = useState("");
    const [landingSubtitle, setLandingSubtitle] = useState("");
    const [landingCtaLabel, setLandingCtaLabel] = useState("");
    const [landingCtaHref, setLandingCtaHref] = useState("");
    const [landingShowPreAudit, setLandingShowPreAudit] = useState(true);

    // Help resources
    const [resources, setResources] = useState<HelpResource[]>([]);
    const [draftTitle, setDraftTitle] = useState("");
    const [draftDescription, setDraftDescription] = useState("");
    const [draftCategory, setDraftCategory] = useState("support");
    const [draftHref, setDraftHref] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [settings, help] = await Promise.all([
                    fetchAdminSettings(),
                    fetchAdminHelpResources(),
                ]);
                if (cancelled) return;
                setPlatformName(settings.platformName || "247GBS Audit");
                setSupportEmail(settings.supportEmail || "");
                setLandingTitle(settings.landingTitle || "");
                setLandingSubtitle(settings.landingSubtitle || "");
                setLandingCtaLabel(settings.landingCtaLabel || "");
                setLandingCtaHref(settings.landingCtaHref || "");
                setLandingShowPreAudit(settings.landingShowPreAudit ?? true);
                setResources(help);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load settings");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError(null);
        try {
            await saveAdminSettings({
                platformName,
                supportEmail: supportEmail || null,
                landingTitle: landingTitle || null,
                landingSubtitle: landingSubtitle || null,
                landingCtaLabel: landingCtaLabel || null,
                landingCtaHref: landingCtaHref || null,
                landingShowPreAudit,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleAddResource = async () => {
        if (!draftTitle.trim()) return;
        setError(null);
        try {
            const created = await createHelpResource({
                title: draftTitle.trim(),
                description: draftDescription.trim() || undefined,
                category: draftCategory,
                href: draftHref.trim() || undefined,
            });
            setResources(prev => [...prev, created]);
            setDraftTitle("");
            setDraftDescription("");
            setDraftHref("");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add resource");
        }
    };

    const handleToggleResource = async (resource: HelpResource) => {
        setError(null);
        try {
            const updated = await updateHelpResource(resource.id, { isActive: !resource.isActive });
            setResources(prev => prev.map(r => (r.id === updated.id ? updated : r)));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to update resource");
        }
    };

    const handleDeleteResource = async (id: string) => {
        setError(null);
        try {
            await deleteHelpResource(id);
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete resource");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={28} className="text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">System Settings</h1>
                    <p className="text-slate-500 font-medium">Configure platform behaviour, landing content, and public help resources.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-orange-500 transition-colors shadow-lg disabled:opacity-70"
                >
                    {saving ? (
                        <><Loader2 size={16} className="animate-spin" /> Saving…</>
                    ) : saved ? (
                        <><CheckCircle2 size={16} className="text-green-400" /> Saved!</>
                    ) : (
                        <><Save size={16} /> Save Changes</>
                    )}
                </button>
            </div>

            {/* General */}
            <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Globe size={18} className="text-slate-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">General</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Platform Name</label>
                        <input
                            type="text"
                            value={platformName}
                            onChange={e => setPlatformName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Support Email</label>
                        <input
                            type="email"
                            value={supportEmail}
                            onChange={e => setSupportEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* Landing */}
            <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                        <Globe size={18} className="text-orange-500" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Landing Page</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Hero Title</label>
                        <input
                            type="text"
                            value={landingTitle}
                            onChange={e => setLandingTitle(e.target.value)}
                            placeholder="Override the hero headline (optional)"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Hero Subtitle</label>
                        <input
                            type="text"
                            value={landingSubtitle}
                            onChange={e => setLandingSubtitle(e.target.value)}
                            placeholder="Override the hero sub-headline (optional)"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">CTA Label</label>
                        <input
                            type="text"
                            value={landingCtaLabel}
                            onChange={e => setLandingCtaLabel(e.target.value)}
                            placeholder="e.g. Start your business audit"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">CTA Link</label>
                        <input
                            type="text"
                            value={landingCtaHref}
                            onChange={e => setLandingCtaHref(e.target.value)}
                            placeholder="/audit/pre-audit/flow"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-slate-50">
                    <div>
                        <div className="font-bold text-sm text-slate-900">Show Pre-Audit CTA</div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">Surfaces the start-audit action on the landing page</div>
                    </div>
                    <Toggle enabled={landingShowPreAudit} onToggle={() => setLandingShowPreAudit(v => !v)} />
                </div>
            </section>

            {/* Help Resources */}
            <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                        <BookOpen size={18} className="text-blue-500" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Help Resources</h2>
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-400">Public pages</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <input
                        type="text"
                        value={draftTitle}
                        onChange={e => setDraftTitle(e.target.value)}
                        placeholder="Resource title"
                        className="md:col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                    />
                    <input
                        type="text"
                        value={draftDescription}
                        onChange={e => setDraftDescription(e.target.value)}
                        placeholder="Short description"
                        className="md:col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                    />
                    <select
                        value={draftCategory}
                        onChange={e => setDraftCategory(e.target.value)}
                        className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                    >
                        {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        onClick={handleAddResource}
                        disabled={!draftTitle.trim()}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-orange-500 transition-colors disabled:opacity-40"
                    >
                        <Plus size={16} /> Add
                    </button>
                </div>

                <div className="space-y-2">
                    {resources.length === 0 && (
                        <p className="text-sm text-slate-400 font-medium text-center py-6">
                            No help resources yet. Add one above — it appears on the public support pages.
                        </p>
                    )}
                    {resources.map(resource => (
                        <div key={resource.id} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${resource.isActive ? "text-green-600" : "text-slate-400"}`}>
                                        {resource.category}
                                    </span>
                                    <span className="text-sm font-bold text-slate-900 truncate">{resource.title}</span>
                                </div>
                                {resource.description && (
                                    <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{resource.description}</p>
                                )}
                            </div>
                            <Toggle enabled={resource.isActive} onToggle={() => void handleToggleResource(resource)} />
                            <button
                                onClick={() => void handleDeleteResource(resource.id)}
                                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 transition-all"
                                aria-label={`Delete ${resource.title}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}