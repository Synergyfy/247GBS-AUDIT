"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, MessageSquare, Sparkles } from "lucide-react";

export default function ChatFAB() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-8 right-8 z-[100] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-20 right-0 w-[380px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-orange-500">
                                <Bot size={80} />
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-widest">Strategy Assistant</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Logic Engine Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Welcome Content */}
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 max-w-[85%]">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Greetings. I am the **247GBS Strategy Intelligence Engine**.
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 max-w-[85%]">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        How can I assist your forensic business analysis today?
                                    </p>
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Suggested Queries</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "How do I start an audit?",
                                        "What is spare capacity?",
                                        "Audit cost details",
                                        "Sector specific info"
                                    ].map((text, i) => (
                                        <button
                                            key={i}
                                            className="px-4 py-2 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-500 transition-all rounded-full text-xs font-bold text-slate-600 shadow-sm"
                                        >
                                            {text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer / Input Placeholder */}
                        <div className="p-6 pt-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    disabled
                                    placeholder="Conversation engine initializing..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-medium text-slate-400 focus:outline-none cursor-not-allowed"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                                    <Sparkles size={14} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 ${isOpen
                        ? "bg-slate-900 text-white rotate-90"
                        : "bg-orange-500 text-white shadow-orange-500/30"
                    }`}
            >
                {isOpen ? <X size={28} /> : <Bot size={32} />}

                {/* Notification Badge */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    </span>
                )}
            </motion.button>
        </div>
    );
}
