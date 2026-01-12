"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAudit } from "@/context/AuditContext";
import { RewardRulesSchema, RewardRules } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Gift, Percent, PoundSterling } from "lucide-react";

export const RewardRulesStep = () => {
    const { state, updateData, nextStep } = useAudit();
    const { data } = state;

    const form = useForm<RewardRules>({
        resolver: zodResolver(RewardRulesSchema),
        defaultValues: data.rules || {
            maxRewardValue: undefined,
            minCashComponent: undefined,
        },
    });

    const onSubmit = (formData: RewardRules) => {
        updateData({ rules: formData });
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
                        <Gift className="w-6 h-6 text-orange-600" />
                        Reward Rules
                    </CardTitle>
                    <CardDescription>
                        Define how generous you want to be with your rewards.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="maxRewardValue">Max Reward Value (£)</Label>
                                <p className="text-xs text-muted-foreground">The maximum dollar value you are willing to give away per transaction.</p>
                                <div className="relative">
                                    <PoundSterling className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="maxRewardValue"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 50.00"
                                        {...form.register("maxRewardValue", { valueAsNumber: true })}
                                        className="pl-9 bg-white/50 border-orange-200/30"
                                    />
                                </div>
                                {form.formState.errors.maxRewardValue && (
                                    <p className="text-red-400 text-xs">{form.formState.errors.maxRewardValue.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minCashComponent">Minimum Cash Required (£)</Label>
                                <p className="text-xs text-muted-foreground">The precise amount a customer MUST pay in cash/card (to cover costs).</p>
                                <div className="relative">
                                    <PoundSterling className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="minCashComponent"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 20.00"
                                        {...form.register("minCashComponent", { valueAsNumber: true })}
                                        className="pl-9 bg-white/50 border-orange-200/30"
                                    />
                                </div>
                                {form.formState.errors.minCashComponent && (
                                    <p className="text-red-400 text-xs">{form.formState.errors.minCashComponent.message}</p>
                                )}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" variant="gradient">
                            See Recommendations <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};
