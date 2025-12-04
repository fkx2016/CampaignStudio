"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AITextOptimizerProps {
    text: string;
    mode: string;
    onOptimized: (newText: string) => void;
}

export default function AITextOptimizer({ text, mode, onOptimized }: AITextOptimizerProps) {
    const [loading, setLoading] = useState(false);

    const handleOptimize = async (type: string) => {
        if (!text) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/ai/optimize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    mode,
                    platform: "generic", // Default for now
                    optimization_type: type,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                onOptimized(data.optimized_text);
            }
        } catch (err) {
            console.error("Optimization failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    AI Magic
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleOptimize("shorten")}>
                    <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                    Shorten
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOptimize("professional")}>
                    <Sparkles className="w-4 h-4 mr-2 text-slate-500" />
                    Make Professional
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOptimize("provocative")}>
                    <Sparkles className="w-4 h-4 mr-2 text-red-500" />
                    Make Provocative
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOptimize("cta")}>
                    <Sparkles className="w-4 h-4 mr-2 text-green-500" />
                    Add Call to Action
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
