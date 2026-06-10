"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAudit } from "@/context/AuditContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, TrendingUp, PackageOpen, Clock } from "lucide-react";

export const WelcomeStep = () => {
    const { nextStep } = useAudit();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center justify-center min-h-[600px] text-center space-y-8 p-6"
        >
            <motion.div variants={item} className="space-y-4 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    Turn <span className="text-gradient">Waste</span> into <span className="text-gradient">Growth</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    The 247GBS Audit helps you identify unused stock and spare capacity,
                    transforming them into powerful rewards that attract new customers.
                </p>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl py-6">
                <FeatureCard
                    icon={<PackageOpen className="w-8 h-8 text-blue-600" />}
                    title="Clear Excess Stock"
                    description="Identify products sitting on shelves and turn them into marketing assets."
                />
                <FeatureCard
                    icon={<Clock className="w-8 h-8 text-orange-600" />}
                    title="Fill Spare Capacity"
                    description="Monetize empty tables, rooms, and appointments during quiet hours."
                />
                <FeatureCard
                    icon={<TrendingUp className="w-8 h-8 text-green-600" />}
                    title="Grow Revenue"
                    description="Attract new customers without spending cash on advertising."
                />
            </motion.div>

            <motion.div variants={item} className="pt-8">
                <Button
                    size="lg"
                    variant="gradient"
                    onClick={nextStep}
                    className="text-lg px-12 py-6 rounded-full shadow-2xl hover:scale-105 transition-transform"
                >
                    Start Your Audit
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <p className="mt-4 text-sm text-muted-foreground/60">
                    Takes approximately 5-10 minutes
                </p>
            </motion.div>
        </motion.div>
    );
};

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="p-6 flex flex-col items-center text-center space-y-3 hover:bg-orange-50 transition-colors border-orange-100 shadow-sm">
            <div className="p-3 rounded-full bg-orange-100/50 mb-2">
                {icon}
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </Card>
    )
}
