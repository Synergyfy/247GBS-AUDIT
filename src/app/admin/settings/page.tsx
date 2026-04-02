"use client";

import React, { useState } from "react";
import {
    Bell,
    Shield,
    Globe,
    Palette,
    Key,
    Save,
    CheckCircle2,
    Loader2,
    ToggleLeft,
    ToggleRight
} from "lucide-react";

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

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Notification settings
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [auditCompletions, setAuditCompletions] = useState(true);
    const [newRegistrations, setNewRegistrations] = useState(false);
    const [systemAlerts, setSystemAlerts] = useState(true);

    // Security settings
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState("60");
    const [ipWhitelist, setIpWhitelist] = useState("");

    // General settings
    const [platformName, setPlatformName] = useState("247GBS Audit");
    const [supportEmail, setSupportEmail] = useState("support@247gbs.com");
    const [timezone, setTimezone] = useState("Africa/Lagos");

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        // Simulate save — wire up to a real API endpoint when ready
        await new Promise(r => setTimeout(r, 900));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">System Settings</h1>
                    <p className="text-slate-500 font-medium">Configure platform behaviour, security, and notifications.</p>
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
                    <h2 className="text-lg font-black text-slate-900">General</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Platform Name</label>
                        <input
                            type="text"
                            value={platformName}
                            onChange={e => setPlatformName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Support Email</label>
                        <input
                            type="email"
                            value={supportEmail}
                            onChange={e => setSupportEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Timezone</label>
                        <select
                            value={timezone}
                            onChange={e => setTimezone(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        >
                            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                            <option value="UTC">UTC</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Notifications */}
            <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                        <Bell size={18} className="text-orange-500" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900">Notifications</h2>
                </div>

                {[
                    { label: "Email Alerts", sub: "Receive general platform alerts via email", value: emailAlerts, toggle: () => setEmailAlerts(v => !v) },
                    { label: "Audit Completions", sub: "Notify when an audit is marked complete", value: auditCompletions, toggle: () => setAuditCompletions(v => !v) },
                    { label: "New Registrations", sub: "Notify when a new user registers", value: newRegistrations, toggle: () => setNewRegistrations(v => !v) },
                    { label: "System Alerts", sub: "Critical system-level alerts and errors", value: systemAlerts, toggle: () => setSystemAlerts(v => !v) },
                ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                        <div>
                            <div className="font-bold text-sm text-slate-900">{item.label}</div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">{item.sub}</div>
                        </div>
                        <Toggle enabled={item.value} onToggle={item.toggle} />
                    </div>
                ))}
            </section>

            {/* Security */}
            <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Shield size={18} className="text-blue-500" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900">Security</h2>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-50">
                    <div>
                        <div className="font-bold text-sm text-slate-900">Two-Factor Authentication</div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">Require 2FA for all admin logins</div>
                    </div>
                    <Toggle enabled={twoFactor} onToggle={() => setTwoFactor(v => !v)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Session Timeout (minutes)</label>
                        <input
                            type="number"
                            min={5}
                            max={480}
                            value={sessionTimeout}
                            onChange={e => setSessionTimeout(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">IP Whitelist</label>
                        <input
                            type="text"
                            value={ipWhitelist}
                            onChange={e => setIpWhitelist(e.target.value)}
                            placeholder="e.g. 192.168.1.1, 10.0.0.0/8"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* API Keys placeholder */}
            <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Key size={18} className="text-purple-500" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900">API Keys</h2>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                        <div className="font-bold text-sm text-slate-900">Production API Key</div>
                        <div className="text-xs text-slate-400 font-mono mt-1">sk-live-••••••••••••••••••••••••••••••••</div>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        Regenerate
                    </button>
                </div>
            </section>
        </div>
    );
}
