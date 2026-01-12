"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAudit } from "@/context/AuditContext";
import { CostAndLimitsSchema, CostAndLimits } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Coins, ShieldCheck, PoundSterling } from "lucide-react";

export const CostAndLimitsStep = () => {
    const { state, updateData, nextStep } = useAudit();
    const { data } = state;

    const form = useForm<CostAndLimits>({
        resolver: zodResolver(CostAndLimitsSchema),
        defaultValues: data.costs || {
            unitCost: undefined,
            minPrice: undefined,
        },
    });

    const onSubmit = (formData: CostAndLimits) => {
        updateData({ costs: formData });
        nextStep();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center items-center min-h-[600px] p-4"
        >
            <Card className="w-full max-w-lg glass-card border-white/10">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-yellow-400" />
                        Costs & Limits
                    </CardTitle>
                    <CardDescription>
                        Set your safety limits. We ensure you never lose money on a reward.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="unitCost">Cost to Provide One Unit</Label>
                                <p className="text-xs text-muted-foreground">What does it cost you out of pocket (food cost, laundry, etc.) for one item/service?</p>
                                <div className="relative">
                                    <PoundSterling className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="unitCost"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...form.register("unitCost", { valueAsNumber: true })}
                                        className="pl-9 bg-white/5 border-white/10"
                                    />
                                </div>
                                {form.formState.errors.unitCost && (
                                    <p className="text-red-400 text-xs">{form.formState.errors.unitCost.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minPrice">Lowest Acceptable Price</Label>
                                <p className="text-xs text-muted-foreground">What is the absolute minimum you can accept without losing money?</p>
                                <div className="relative">
                                    <PoundSterling className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="minPrice"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...form.register("minPrice", { valueAsNumber: true })}
                                        className="pl-9 bg-white/5 border-white/10"
                                    />
                                </div>
                                {form.formState.errors.minPrice && (
                                    <p className="text-red-400 text-xs">{form.formState.errors.minPrice.message}</p>
                                )}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" variant="gradient">
                            Continue <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};
