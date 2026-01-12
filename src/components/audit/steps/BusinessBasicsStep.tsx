"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAudit } from "@/context/AuditContext";
import { BusinessBasicsSchema, BusinessBasics, BusinessTypeSchema } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, MapPin, Clock } from "lucide-react";

export const BusinessBasicsStep = () => {
    const { state, updateData, nextStep } = useAudit();
    const { data } = state;

    const form = useForm<BusinessBasics>({
        resolver: zodResolver(BusinessBasicsSchema),
        defaultValues: data.basics || {
            businessName: "",
            businessType: "Restaurant",
            location: "",
            operatingHours: "",
        },
    });

    const onSubmit = (formData: BusinessBasics) => {
        updateData({ basics: formData });
        nextStep();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center min-h-[600px] p-4"
        >
            <Card className="w-full max-w-lg glass-card border-white/10">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-blue-400" />
                        Business Basics
                    </CardTitle>
                    <CardDescription>
                        Tell us a bit about your business so we can tailor the audit.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input
                                id="businessName"
                                placeholder="e.g. The Grand Hotel"
                                {...form.register("businessName")}
                                className="bg-white/5 border-white/10 focus:border-blue-400/50 transition-colors"
                            />
                            {form.formState.errors.businessName && (
                                <p className="text-red-400 text-xs">{form.formState.errors.businessName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="businessType">Business Type</Label>
                            <select
                                id="businessType"
                                {...form.register("businessType")}
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 glass border-white/10 text-foreground [&>option]:bg-background [&>option]:text-foreground"
                            >
                                {BusinessTypeSchema.options.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            {form.formState.errors.businessType && (
                                <p className="text-red-400 text-xs">{form.formState.errors.businessType.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="location"
                                    placeholder="City, Region"
                                    className="pl-9 bg-white/5 border-white/10"
                                    {...form.register("location")}
                                />
                            </div>
                            {form.formState.errors.location && (
                                <p className="text-red-400 text-xs">{form.formState.errors.location.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="operatingHours">Days & Hours of Operation</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="operatingHours"
                                    placeholder="e.g. Mon-Sun, 9am - 10pm"
                                    className="pl-9 bg-white/5 border-white/10"
                                    {...form.register("operatingHours")}
                                />
                            </div>
                            {form.formState.errors.operatingHours && (
                                <p className="text-red-400 text-xs">{form.formState.errors.operatingHours.message}</p>
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
