"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimeRangePickerProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export function TimeRangePicker({ value = "", onChange, className }: TimeRangePickerProps) {
    const [startHour, setStartHour] = useState("09");
    const [startMinute, setStartMinute] = useState("00");
    const [endHour, setEndHour] = useState("17");
    const [endMinute, setEndMinute] = useState("00");

    useEffect(() => {
        // Parse "09:00 - 17:00"
        if (value && value.includes(" - ")) {
            const [start, end] = value.split(" - ");
            const [sH, sM] = start.split(":");
            const [eH, eM] = end.split(":");
            if (sH) setStartHour(sH);
            if (sM) setStartMinute(sM);
            if (eH) setEndHour(eH);
            if (eM) setEndMinute(eM);
        }
    }, [value]);

    const updateTime = (type: "start" | "end", unit: "hour" | "minute", val: string) => {
        let sH = startHour, sM = startMinute, eH = endHour, eM = endMinute;

        if (type === "start") {
            if (unit === "hour") sH = val;
            else sM = val;
            setStartHour(sH);
            setStartMinute(sM);
        } else {
            if (unit === "hour") eH = val;
            else eM = val;
            setEndHour(eH);
            setEndMinute(eM);
        }

        onChange(`${sH}:${sM} - ${eH}:${eM}`);
    };

    return (
        <div className={cn("flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-white border border-gray-200 shadow-sm rounded-lg p-3", className)}>

            {/* Start Time */}
            <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mr-1">Open</span>
                <select
                    value={startHour}
                    onChange={(e) => updateTime("start", "hour", e.target.value)}
                    className="bg-transparent border border-gray-200 rounded px-1 py-0.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all cursor-pointer hover:border-gray-300"
                >
                    {HOURS.map(h => <option key={`s-h-${h}`} value={h}>{h}</option>)}
                </select>
                <span className="text-gray-400">:</span>
                <select
                    value={startMinute}
                    onChange={(e) => updateTime("start", "minute", e.target.value)}
                    className="bg-transparent border border-gray-200 rounded px-1 py-0.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all cursor-pointer hover:border-gray-300"
                >
                    {MINUTES.map(m => <option key={`s-m-${m}`} value={m}>{m}</option>)}
                </select>
            </div>

            <div className="hidden sm:block text-gray-300">—</div>

            {/* End Time */}
            <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mr-1">Close</span>
                <select
                    value={endHour}
                    onChange={(e) => updateTime("end", "hour", e.target.value)}
                    className="bg-transparent border border-gray-200 rounded px-1 py-0.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all cursor-pointer hover:border-gray-300"
                >
                    {HOURS.map(h => <option key={`e-h-${h}`} value={h}>{h}</option>)}
                </select>
                <span className="text-gray-400">:</span>
                <select
                    value={endMinute}
                    onChange={(e) => updateTime("end", "minute", e.target.value)}
                    className="bg-transparent border border-gray-200 rounded px-1 py-0.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all cursor-pointer hover:border-gray-300"
                >
                    {MINUTES.map(m => <option key={`e-m-${m}`} value={m}>{m}</option>)}
                </select>
            </div>

            <Clock className="w-4 h-4 ml-auto text-orange-500 hidden sm:block" />
        </div>
    );
}
