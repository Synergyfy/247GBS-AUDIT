"use client";

import React from "react";
import { HelpResourcesPage } from "@/components/public/HelpResourcesPage";

const FALLBACK = [
    {
        title: "Business Audit",
        description: "A guided forensic review that turns hidden losses into a growth plan.",
        href: "/audit/pre-audit/flow",
    },
    {
        title: "Pre-Audit",
        description: "Answer a few questions first to find the right starting point.",
        href: "/audit/pre-audit/flow",
    },
];

export default function ServicesPage() {
    return (
        <HelpResourcesPage
            category="service"
            title="Our Services"
            subtitle="Every MCOM service shares one goal — helping you find and fix what limits your business."
            fallbackItems={FALLBACK}
            ctaLabel="Start a Pre-Audit"
            ctaHref="/audit/pre-audit/flow"
            ctaNote="Not sure where to begin? The pre-audit only takes a couple of minutes."
        />
    );
}