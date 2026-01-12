"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const DAYS = [
    { id: "Mon", label: "M" },
    { id: "Tue", label: "T" },
    { id: "Wed", label: "W" },
    { id: "Thu", label: "T" },
    { id: "Fri", label: "F" },
    { id: "Sat", label: "S" },
    { id: "Sun", label: "S" },
];

interface DaySelectorProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
}

export function DaySelector({ value = "", onChange, className }: DaySelectorProps) {
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    useEffect(() => {
        if (value) {
            setSelectedDays(value.split(", ").filter(Boolean));
        } else {
            setSelectedDays([]);
        }
    }, [value]);

    const toggleDay = (dayId: string) => {
        let newDays = [...selectedDays];
        if (newDays.includes(dayId)) {
            newDays = newDays.filter((d) => d !== dayId);
        } else {
            newDays.push(dayId);
        }

        // Sort days to keep order consistent
        const sortedDays = DAYS.filter(d => newDays.includes(d.id)).map(d => d.id);

        setSelectedDays(sortedDays);
        onChange(sortedDays.join(", "));
    };

    return (
        <div className={cn("flex gap-2 p-1", className)}>
            {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                return (
                    <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 border",
                            isSelected
                                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 scale-105"
                                : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground hover:border-white/20"
                        )}
                        title={day.id}
                    >
                        {day.label}
                    </button>
                );
            })}
        </div>
    );
}
