"use client";

import React from "react";
import { HelpResourcesPage } from "@/components/public/HelpResourcesPage";

const FALLBACK = [
    {
        title: "Fund the next audit",
        description: "Every contribution funds free guidance for businesses that need it most.",
        href: "/funding",
    },
    {
        title: "Sponsor a business",
        description: "Support a specific business through its full audit journey.",
        href: "/funding",
    },
];

export default function FundingPage() {
    return (
        <HelpResourcesPage
            category="funding"
            title="Fund & Donate"
            subtitle="Thank you for supporting our work. Your contribution helps more businesses access the guidance they need."
            fallbackItems={FALLBACK}
            ctaLabel="Explore funding options"
            ctaHref="/funding"
            ctaNote="We use funds to keep audits accessible to every business."
        />
    );
}