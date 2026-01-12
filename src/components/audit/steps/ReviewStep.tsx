"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAudit } from "@/context/AuditContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Building2, Package, Users, ShieldCheck } from "lucide-react";

export const ReviewStep = () => {
    const { state, nextStep } = useAudit();
    const { data } = state;

    const onConfirm = () => {
        // Here you would typically save the data to a backend
        console.log("Submitting Audit Data:", data);
        nextStep();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center min-h-[600px] p-4"
        >
            <Card className="w-full max-w-2xl glass-card border-orange-100 max-h-[80vh] flex flex-col">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        Review Audit
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">

                    {/* Basics Section */}
                    <Section title="Business Details" icon={<Building2 className="w-4 h-4 text-blue-600" />}>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Name:</span>
                                <div className="font-medium">{data.basics?.businessName}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Type:</span>
                                <div className="font-medium">{data.basics?.businessType}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Location:</span>
                                <div className="font-medium">{data.basics?.location}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Hours:</span>
                                <div className="font-medium">{data.basics?.operatingHours}</div>
                            </div>
                        </div>
                    </Section>

                    {/* Financials Section */}
                    <Section title="Financial Limits" icon={<ShieldCheck className="w-4 h-4 text-amber-600" />}>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Unit Cost:</span>
                                <div className="font-medium">£{data.costs?.unitCost?.toFixed(2)}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Min Price:</span>
                                <div className="font-medium">£{data.costs?.minPrice?.toFixed(2)}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Max Reward:</span>
                                <div className="font-medium">£{data.rules?.maxRewardValue?.toFixed(2)}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Min Cash:</span>
                                <div className="font-medium">£{data.rules?.minCashComponent?.toFixed(2)}</div>
                            </div>
                        </div>
                    </Section>

                    {/* Stock Section */}
                    <Section title={`Excess Stock (${data.excessStock?.length || 0})`} icon={<Package className="w-4 h-4 text-orange-600" />}>
                        {data.excessStock && data.excessStock.length > 0 ? (
                            <ul className="space-y-2">
                                {data.excessStock.map(item => (
                                    <li key={item.id} className="text-sm border-b border-gray-200 pb-2 last:border-0">
                                        <div className="flex justify-between">
                                            <span>{item.name}</span>
                                            <span className="text-muted-foreground">{item.quantity} units</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No stock items added.</p>
                        )}
                    </Section>

                    {/* Capacity Section */}
                    <Section title={`Spare Capacity (${data.capacityServices?.length || 0})`} icon={<Users className="w-4 h-4 text-rose-600" />}>
                        {data.capacityServices && data.capacityServices.length > 0 ? (
                            <ul className="space-y-2">
                                {data.capacityServices.map(service => (
                                    <li key={service.id} className="text-sm border-b border-gray-200 pb-2 last:border-0">
                                        <div className="flex justify-between">
                                            <span>{service.serviceType}</span>
                                            <span className="text-muted-foreground">{service.usedCapacity}/{service.totalCapacity} usage</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No services added.</p>
                        )}
                    </Section>

                    <Button onClick={onConfirm} className="w-full mt-4" size="lg" variant="gradient">
                        Confirm & Submit Audit <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                {icon} {title}
            </h4>
            {children}
        </div>
    )
}
