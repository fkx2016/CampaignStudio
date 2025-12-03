"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateModeModal from "./CreateModeModal";
import { Mode } from "@/types/schema";

// In a real app, we would fetch this from the API (which reads the JSON)
// For now, we hardcode the schema we just designed to prototype the UI.
// Default fallback if API fails
const DEFAULT_MODES: (Mode & { theme?: string })[] = [
  { slug: "ebeg", name: "E-Beg (Donation)", description: "Optimized for sympathy, wit, and urgency.", theme: "bg-emerald-500" },
  { slug: "content", name: "Content (Thought Leadership)", description: "For high-value educational content.", theme: "bg-indigo-600" },
  { slug: "promotion", name: "Promotion (Sales)", description: "For selling Products, Services, or Hardware.", theme: "bg-blue-600" },
  { slug: "political", name: "Political (Advocacy)", description: "Focus on goals, objectives, and mobilization.", theme: "bg-red-700" }
];

export default function ModeSwitcher({ currentMode, onModeChange }: { currentMode: string, onModeChange: (mode: string) => void }) {
  const [modes, setModes] = useState<Mode[]>([]);
  const [showCreateMode, setShowCreateMode] = useState(false);

  // Fetch Modes
  useEffect(() => {
    fetch("http://localhost:8001/api/modes")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) setModes(data);
        else setModes(DEFAULT_MODES);
      })
      .catch(() => setModes(DEFAULT_MODES));
  }, []);

  const activeMode = modes.find(m => m.slug === currentMode) || modes[0] || DEFAULT_MODES[0];

  // Helper to get theme color (random-ish based on length if not defined)
  const getTheme = (slug: string) => {
    const defaults: Record<string, string> = { ebeg: "bg-emerald-500", content: "bg-indigo-600", promotion: "bg-blue-600", political: "bg-red-700" };
    return defaults[slug] || "bg-slate-600";
  };

  const handleCreateMode = async (newMode: Partial<Mode>) => {
    try {
      const res = await fetch("http://localhost:8001/api/modes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMode)
      });
      if (res.ok) {
        const created = await res.json();
        setModes([...modes, created]);
        onModeChange(created.slug);
        alert(`Mode "${created.name}" created!`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create mode");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. The Switcher */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Campaign Mode</h3>
          <p className="text-sm text-gray-500">Select the operational personality for this workspace.</p>
        </div>
        <div className="w-[250px]">
          {/* Native Select for simplicity in prototype, can upgrade to Shadcn Select later */}
          <div className="flex gap-2">
            <select
              className="w-full p-2 border rounded-md"
              value={currentMode}
              onChange={(e) => onModeChange(e.target.value)}
            >
              {modes.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.name}
                </option>
              ))}
            </select>
            <Button size="icon" variant="outline" onClick={() => setShowCreateMode(true)} title="Create New Mode">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. The Dynamic UI Preview */}
      <Card className={`border-t-4 ${getTheme(activeMode.slug).replace("bg-", "border-")}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Active Mode: {activeMode.name}</CardTitle>
            <Badge className={`${getTheme(activeMode.slug).replace("bg-", "bg-").replace("500", "100").replace("600", "100").replace("700", "100")} text-slate-800`}>
              {activeMode.slug.toUpperCase()}
            </Badge>
          </div>
          <p className="text-gray-500">{activeMode.description}</p>
        </CardHeader>
      </Card>

      <CreateModeModal
        open={showCreateMode}
        onOpenChange={setShowCreateMode}
        onCreate={handleCreateMode}
      />
    </div>
  );
}
