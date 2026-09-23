"use client";

import React from "react";
import { HelpResourcesPage } from "@/components/public/HelpResourcesPage";

const FALLBACK = [
    {
        title: "Talk to an advisor",
        description: "Get a direct conversation with our team about your business.",
        href: "/support",
    },
    {
        title: "Common questions",
        description: "Answers to the questions we hear most about the audit process.",
        href: "/support",
    },
];

export default function SupportPage() {
    return (
        <HelpResourcesPage
            category="support"
            title="Support & Information"
            subtitle="We're here to help. Explore the resources below or reach out directly — no audit needed."
            fallbackItems={FALLBACK}
            ctaLabel="Email the support team"
            ctaHref="/support"
            ctaNote="We typically reply within one business day."
        />
    );
}