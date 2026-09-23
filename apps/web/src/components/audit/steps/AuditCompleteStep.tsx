"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAudit } from "@/context/AuditContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Rocket, ExternalLink } from "lucide-react";

export const AuditCompleteStep = () => {
    const { resetAudit } = useAudit();

    // Reset allows starting over
    const onFinish = () => {
        resetAudit();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center items-center min-h-[600px] p-4 text-center"
        >
            <Card className="w-full max-w-lg glass-card border-orange-200 overflow-hidden relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />

                <CardContent className="pt-12 pb-12 space-y-8 relative z-10">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-green-500/20"
                    >
                        <Check className="w-12 h-12 text-white" />
                    </motion.div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                            Audit Complete!
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                            Your rewards have been generated and will now appear inside <strong className="text-foreground">247GBS</strong> and <strong className="text-foreground">MCOM Rewards</strong>.
                        </p>
                    </div>

                    <div className="pt-4 space-y-3">
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm mb-6">
                            <Rocket className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                            <p>Get ready for new customers!</p>
                        </div>

                        <Button onClick={onFinish} size="lg" className="w-full" variant="outline">
                            Return to Dashboard
                        </Button>
                        <Button variant="link" className="text-muted-foreground">
                            View Live Rewards <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
