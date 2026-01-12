"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAudit } from "@/context/AuditContext";
import { SpareCapacityOverviewSchema, SpareCapacityOverview } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Moon, Clock } from "lucide-react";

export const SpareCapacityOverviewStep = () => {
    const { state, updateData, nextStep } = useAudit();
    const { data } = state;

    const form = useForm<SpareCapacityOverview>({
        resolver: zodResolver(SpareCapacityOverviewSchema),
        defaultValues: data.capacityOverview || {
            dailyCapacity: undefined,
            dailyServed: undefined,
            quietDays: "",
            quietTimes: "",
        },
    });

    const onSubmit = (formData: SpareCapacityOverview) => {
        updateData({ capacityOverview: formData });
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
                        <Users className="w-6 h-6 text-green-400" />
                        Spare Capacity Overview
                    </CardTitle>
                    <CardDescription>
                        Help us understand your potential versus your reality.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dailyCapacity">Max Customers / Day</Label>
                                <Input
                                    id="dailyCapacity"
                                    type="number"
                                    placeholder="e.g. 100"
                                    {...form.register("dailyCapacity", { valueAsNumber: true })}
                                    className="bg-white/5 border-white/10"
                                />
                                {form.formState.errors.dailyCapacity && (
                                    <p className="text-red-400 text-xs">{form.formState.errors.dailyCapacity.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dailyServed">Avg Customers / Day</Label>
                                <Input
                                    id="dailyServed"
                                    type="number"
                                    placeholder="e.g. 60"
                                    {...form.register("dailyServed", { valueAsNumber: true })}
                                    className="bg-white/5 border-white/10"
                                />
                                {form.formState.errors.dailyServed && (
                                    <p className="text-red-400 text-xs">{form.formState.errors.dailyServed.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quietDays">Quiet Days</Label>
                            <div className="relative">
                                <Moon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="quietDays"
                                    placeholder="e.g. Mondays, Tuesdays"
                                    className="pl-9 bg-white/5 border-white/10"
                                    {...form.register("quietDays")}
                                />
                            </div>
                            {form.formState.errors.quietDays && (
                                <p className="text-red-400 text-xs">{form.formState.errors.quietDays.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quietTimes">Quiet Times</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="quietTimes"
                                    placeholder="e.g. 2pm - 5pm"
                                    className="pl-9 bg-white/5 border-white/10"
                                    {...form.register("quietTimes")}
                                />
                            </div>
                            {form.formState.errors.quietTimes && (
                                <p className="text-red-400 text-xs">{form.formState.errors.quietTimes.message}</p>
                            )}
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
