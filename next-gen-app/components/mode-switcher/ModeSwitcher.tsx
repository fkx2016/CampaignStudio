"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronDown, FolderOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import CreateModeModal from "./CreateModeModal";
import { Mode } from "@/types/schema";

const DEFAULT_MODES: (Mode & { theme?: string })[] = [
  { slug: "ebeg", name: "E-Beg (Donation)", description: "Optimized for sympathy.", theme: "bg-emerald-500" },
  { slug: "content", name: "Content", description: "For educational content.", theme: "bg-indigo-600" },
  { slug: "promotion", name: "Promotion", description: "For selling Products.", theme: "bg-blue-600" },
  { slug: "political", name: "Political / Advocacy", description: "Mobilization.", theme: "bg-red-700" },
  { slug: "operations", name: "Operations / Admin", description: "Business logic.", theme: "bg-slate-600" }
];

export default function ModeSwitcher({ currentMode, onModeChange }: { currentMode: string, onModeChange: (mode: string) => void }) {
  const [modes, setModes] = useState<Mode[]>([]);
  const [showCreateMode, setShowCreateMode] = useState(false);
  const [editingMode, setEditingMode] = useState<Mode | undefined>(undefined);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/modes`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) setModes(data);
        else setModes(DEFAULT_MODES);
      })
      .catch(() => setModes(DEFAULT_MODES));
  }, []);

  return (
    <div className="w-full">
      {/* Compact Header Selector */}
      <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
        <FolderOpen className="w-4 h-4 text-slate-400" />
        <select
          className="flex-1 bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
          value={currentMode}
          onChange={(e) => onModeChange(e.target.value)}
        >
          {modes.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            const modeToEdit = modes.find(m => m.slug === currentMode);
            if (modeToEdit) {
              setEditingMode(modeToEdit);
              setShowCreateMode(true);
            }
          }}
          className="text-slate-400 hover:text-blue-600"
          title="Edit Current Mode"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setEditingMode(undefined);
            setShowCreateMode(true);
          }}
          className="text-slate-400 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showCreateMode && (
        <CreateModeModal
          open={showCreateMode}
          onOpenChange={setShowCreateMode}
          mode={editingMode}
          onSave={(savedMode) => {
            if (editingMode) {
              // Edit existing
              setModes(prev => prev.map(m => m.slug === editingMode.slug ? { ...m, ...savedMode } : m));
            } else {
              // Create new
              setModes(prev => [...prev, savedMode]);
              // Optionally select the new mode immediately
              onModeChange(savedMode.slug);
            }
            console.log("Mode saved:", savedMode);
          }}
        />
      )}
    </div>
  );
}
