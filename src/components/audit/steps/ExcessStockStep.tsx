"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAudit } from "@/context/AuditContext";
import { ExcessStockItemSchema, ExcessStockItem } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus, Trash2, Package, Tag, PoundSterling, BarChart3 } from "lucide-react";


const generateId = () => Math.random().toString(36).substr(2, 9);

export const ExcessStockStep = () => {
    const { state, updateData, nextStep, prevStep } = useAudit();
    const { data } = state;
    const [items, setItems] = useState<ExcessStockItem[]>(data.excessStock || []);
    const [isAdding, setIsAdding] = useState(true); // Start in adding mode if list is empty? Or always show form? 
    // Let's show form by default, and list below or side.

    const form = useForm<Omit<ExcessStockItem, "id">>({
        resolver: zodResolver(ExcessStockItemSchema.omit({ id: true })),
        defaultValues: {
            name: "",
            normalPrice: undefined,
            quantity: undefined,
            sellRate: "",
        },
    });

    const onAddItem = (formData: any) => {
        const newItem: ExcessStockItem = {
            ...formData,
            id: generateId(),
            normalPrice: Number(formData.normalPrice),
            quantity: Number(formData.quantity)
        };

        const newItems = [...items, newItem];
        setItems(newItems);
        updateData({ excessStock: newItems });
        form.reset();
        // Keep focus or show success? form.reset is good.
    };

    const onRemoveItem = (id: string) => {
        const newItems = items.filter(i => i.id !== id);
        setItems(newItems);
        updateData({ excessStock: newItems });
    };

    const onContinue = () => {
        // Only allow continue if at least one item is added OR if they explicitly say they have no excess stock (maybe? PRD implies they must list).
        // Let's assume they must add at least one if they are on this screen, or maybe just nextStep is fine even if empty?
        // PRD: "The business must list anything..." implies requirement.
        // But for UX, maybe warn if empty.
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
                            <Package className="w-6 h-6 text-purple-400" />
                            Excess Stock
                        </CardTitle>
                        <CardDescription>
                            List items sitting on shelves, expiring stock, or unused products.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onAddItem)} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Item Name</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input {...form.register("name")} placeholder="e.g. Winter Jacket" className="pl-9 bg-white/5" />
                                </div>
                                {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Normal Price (£)</Label>
                                    <div className="relative">
                                        <PoundSterling className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input type="number" step="0.01" {...form.register("normalPrice", { valueAsNumber: true })} placeholder="0.00" className="pl-9 bg-white/5" />
                                    </div>
                                    {form.formState.errors.normalPrice && <p className="text-red-400 text-xs">{form.formState.errors.normalPrice.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input type="number" {...form.register("quantity", { valueAsNumber: true })} placeholder="0" className="bg-white/5" />
                                    {form.formState.errors.quantity && <p className="text-red-400 text-xs">{form.formState.errors.quantity.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Selling Rate</Label>
                                <div className="relative">
                                    <BarChart3 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input {...form.register("sellRate")} placeholder="e.g. 1 per month, Very Slow" className="pl-9 bg-white/5" />
                                </div>
                                {form.formState.errors.sellRate && <p className="text-red-400 text-xs">{form.formState.errors.sellRate.message}</p>}
                            </div>

                            <Button type="submit" variant="secondary" className="w-full mt-4">
                                <Plus className="w-4 h-4 mr-2" /> Add Item
                            </Button>
                        </form>
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
                    <h3 className="text-lg font-semibold mb-4 px-2">Your Inventory List ({items.length})</h3>

                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-50">
                            <Package className="w-12 h-12 mb-2" />
                            <p>No items added yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 group"
                                    >
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.quantity} units @ £{item.normalPrice} • {item.sellRate}
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => onRemoveItem(item.id)}
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
                    disabled={items.length === 0}
                >
                    Continue to Spare Capacity <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </motion.div>
        </div>
    );
};
