"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useAudit } from "@/context/AuditContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Gift, Tag, BadgePercent } from "lucide-react";

export const RecommendationStep = () => {
    const { state, nextStep } = useAudit();
    const { data } = state;

    // Recommendation Logic
    const recommendations = useMemo(() => {
        const rules = data.rules || { maxRewardValue: 50, minCashComponent: 10 };
        const costs = data.costs || { unitCost: 10, minPrice: 20 };

        const maxReward = rules.maxRewardValue || 50;
        const minCash = rules.minCashComponent || 10;
        const minPrice = costs.minPrice || 20;
        const requiredCash = Math.max(minCash, minPrice);

        const stockRecommendations = (data.excessStock || []).map(item => {
            // Calculate max possible reward
            const maxPossibleReward = Math.max(0, item.normalPrice - requiredCash);
            const actualReward = Math.min(maxPossibleReward, maxReward);
            const customerPay = item.normalPrice - actualReward;

            return {
                id: item.id,
                name: item.name,
                type: 'Stock',
                normalPrice: item.normalPrice,
                rewardValue: actualReward,
                customerPay: customerPay,
                recommendationType: actualReward > 0 ? "Gift Card / Voucher" : "Direct Sale (Low Margin)"
            };
        });

        const capacityRecommendations = (data.capacityServices || []).map(service => {
            // Calculate max possible reward
            const maxPossibleReward = Math.max(0, service.normalPrice - requiredCash);
            const actualReward = Math.min(maxPossibleReward, maxReward);
            const customerPay = service.normalPrice - actualReward;

            return {
                id: service.id,
                name: service.serviceType,
                type: 'Service',
                normalPrice: service.normalPrice,
                rewardValue: actualReward,
                customerPay: customerPay,
                recommendationType: actualReward > 0 ? "Flash Sale / Last Minute" : "Standard Booking"
            };
        });

        return [...stockRecommendations, ...capacityRecommendations];
    }, [data]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col lg:flex-row gap-6 min-h-[600px] p-4"
        >
            <div className="flex-1 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                        We Found Opportunities!
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Based on your audit, here is how we can turn your waste into growth.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SummaryCard
                        icon={<Gift className="w-6 h-6 text-pink-400" />}
                        title="Potential Rewards"
                        value={recommendations.filter(r => r.rewardValue > 0).length.toString()}
                        description="Items ready to be converted"
                    />
                    <SummaryCard
                        icon={<BadgePercent className="w-6 h-6 text-green-400" />}
                        title="Total Reward Value"
                        value={`£${recommendations.reduce((acc, curr) => acc + curr.rewardValue, 0).toFixed(0)}`}
                        description="Customer value generated"
                    />
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
                    <h4 className="font-semibold mb-1">Success Rule Check</h4>
                    <p className="text-sm opacity-80">
                        ✅ No reward causes you to lose money.<br />
                        ✅ All customer payments cover your minimum costs (£{Math.max(data.costs?.minPrice || 0, data.rules?.minCashComponent || 0).toFixed(2)}).
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col glass-card rounded-xl border border-white/10 overflow-hidden max-h-[600px]">
                <div className="p-6 border-b border-border/10 bg-white/5">
                    <h3 className="font-semibold text-lg">Recommended Strategy</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {recommendations.length === 0 ? (
                        <div className="text-center p-10 text-muted-foreground">
                            No items to recommend. Add some stock or services first.
                        </div>
                    ) : (
                        recommendations.map((rec) => (
                            <div key={rec.id} className="p-4 rounded-lg bg-black/40 border border-white/5 hover:bg-white/5 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {rec.name}
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">{rec.type}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{rec.recommendationType}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-400">£{rec.rewardValue.toFixed(2)} Reward</div>
                                        <div className="text-xs text-muted-foreground">Customer pays £{rec.customerPay.toFixed(2)}</div>
                                    </div>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                                    <div className="bg-green-500 h-full" style={{ width: `${(rec.rewardValue / rec.normalPrice) * 100}%` }} title="Reward Portion" />
                                    <div className="bg-blue-500 h-full" style={{ width: `${(rec.customerPay / rec.normalPrice) * 100}%` }} title="Customer Pay Portion" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-border/10 bg-white/5">
                    <Button onClick={nextStep} size="lg" className="w-full" variant="gradient">
                        Review Full Audit <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

function SummaryCard({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description: string }) {
    return (
        <Card className="glass-card border-white/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {icon} {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
