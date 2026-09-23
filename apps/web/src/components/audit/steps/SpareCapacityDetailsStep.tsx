"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAudit } from "@/context/AuditContext";
import { SpareCapacityServiceSchema, SpareCapacityService } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus, Trash2, Sofa, Fingerprint, PoundSterling, LayoutList, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export const SpareCapacityDetailsStep = () => {
    const { state, updateData, nextStep } = useAudit();
    const { data } = state;
    const [services, setServices] = useState<SpareCapacityService[]>(data.capacityServices || []);

    const form = useForm<Omit<SpareCapacityService, "id">>({
        resolver: zodResolver(SpareCapacityServiceSchema.omit({ id: true })),
        defaultValues: {
            serviceType: "",
            totalCapacity: undefined,
            usedCapacity: undefined,
            normalPrice: undefined,
        },
    });

    const onAddService = (formData: any) => {
        const newService: SpareCapacityService = {
            ...formData,
            id: generateId(),
            totalCapacity: Number(formData.totalCapacity),
            usedCapacity: Number(formData.usedCapacity),
            normalPrice: Number(formData.normalPrice),
        };

        const newServices = [...services, newService];
        setServices(newServices);
        updateData({ capacityServices: newServices });
        form.reset();
    };

    const onRemoveService = (id: string) => {
        const newServices = services.filter(s => s.id !== id);
        setServices(newServices);
        updateData({ capacityServices: newServices });
    };

    const onContinue = () => {
        nextStep();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] p-4">
            {/* Form Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1"
            >
                <Card className="h-full glass-card border-white/10">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Sofa className="w-6 h-6 text-pink-400" />
                            Service Capacity
                        </CardTitle>
                        <CardDescription>
                            List specific services (rooms, tables, seats) and their occupancy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TooltipProvider>
                            <form onSubmit={form.handleSubmit(onAddService)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        Service Type
                                        <Tooltip>
                                            <TooltipTrigger type="button">
                                                <Info className="h-4 w-4 text-muted-foreground hover:text-pink-400 transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>What kind of capacity are you selling? (e.g. Standard Room, 2-Top Table)</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <div className="relative">
                                        <LayoutList className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input {...form.register("serviceType")} placeholder="e.g. Double Room, 4-Top Table" className="pl-9 bg-white/5 transition-all focus:border-pink-400/50 input-glow" />
                                    </div>
                                    {form.formState.errors.serviceType && <p className="text-red-400 text-xs">{form.formState.errors.serviceType.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            Total Capacity
                                            <Tooltip>
                                                <TooltipTrigger type="button">
                                                    <Info className="h-4 w-4 text-muted-foreground hover:text-pink-400 transition-colors" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Total number of these units available.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                        <Input type="number" {...form.register("totalCapacity", { valueAsNumber: true })} placeholder="Total seats/rooms" className="bg-white/5 transition-all focus:border-pink-400/50 input-glow" />
                                        {form.formState.errors.totalCapacity && <p className="text-red-400 text-xs">{form.formState.errors.totalCapacity.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            Used Capacity
                                            <Tooltip>
                                                <TooltipTrigger type="button">
                                                    <Info className="h-4 w-4 text-muted-foreground hover:text-pink-400 transition-colors" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Average number occupied/sold daily.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                        <Input type="number" {...form.register("usedCapacity", { valueAsNumber: true })} placeholder="Avg used" className="bg-white/5 transition-all focus:border-pink-400/50 input-glow" />
                                        {form.formState.errors.usedCapacity && <p className="text-red-400 text-xs">{form.formState.errors.usedCapacity.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        Normal Price (£)
                                        <Tooltip>
                                            <TooltipTrigger type="button">
                                                <Info className="h-4 w-4 text-muted-foreground hover:text-pink-400 transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Standard full price for one unit.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <div className="relative">
                                        <PoundSterling className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input type="number" step="0.01" {...form.register("normalPrice", { valueAsNumber: true })} placeholder="0.00" className="pl-9 bg-white/5 transition-all focus:border-pink-400/50 input-glow" />
                                    </div>
                                    {form.formState.errors.normalPrice && <p className="text-red-400 text-xs">{form.formState.errors.normalPrice.message}</p>}
                                </div>

                                <Button type="submit" variant="secondary" className="w-full mt-4">
                                    <Plus className="w-4 h-4 mr-2" /> Add Service
                                </Button>
                            </form>
                        </TooltipProvider>
                    </CardContent>
                </Card>
            </motion.div>

            {/* List Section */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col space-y-4"
            >
                <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-4 overflow-y-auto max-h-[500px]">
                    <h3 className="text-lg font-semibold mb-4 px-2">Services List ({services.length})</h3>

                    {services.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-50">
                            <Sofa className="w-12 h-12 mb-2" />
                            <p>No services added yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {services.map((service) => (
                                    <motion.div
                                        key={service.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 group"
                                    >
                                        <div>
                                            <div className="font-medium">{service.serviceType}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {service.usedCapacity}/{service.totalCapacity} used • £{service.normalPrice}
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => onRemoveService(service.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <Button
                    onClick={onContinue}
                    className="w-full"
                    size="lg"
                    variant="gradient"
                    disabled={services.length === 0}
                >
                    Continue to Costs & Limits <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </motion.div>
        </div>
    );
};
