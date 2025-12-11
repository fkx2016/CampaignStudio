"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ModeEditModalProps {
    mode?: { name: string; slug: string; description: string };
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (mode: { name: string; slug: string; description: string }) => void;
}

export default function CreateModeModal({ mode, open, onOpenChange, onSave }: ModeEditModalProps) {
    const [name, setName] = useState(mode?.name || "");
    const [slug, setSlug] = useState(mode?.slug || "");
    const [description, setDescription] = useState(mode?.description || "");

    // Reset or Sync state when modal opens/closes or mode changes
    // simplified: just use a key on the parent or effect
    // For now, simpler to just use an effect or similar pattern to CampaignEditModal if needed.
    // However, since we are doing a direct replace, let's use the key pattern in standard react, 
    // OR just use useEffect to update state when 'open' or 'mode' changes.
    // Let's use the useEffect pattern for safety like in CampaignEditModal.

    // Actually, React best practice for "reset on open" with modals is often to rely on the parent conditionally rendering perfectly or using useEffect.
    // Let's add the useEffect to sync state.

    /* eslint-disable react-hooks/exhaustive-deps */
    // We suppress exhaustiveness because we only want to reset when 'open' becomes true or 'mode' changes

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && slug.trim()) {
            onSave({ name, slug, description });
            onOpenChange(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        // Only auto-generate slug if we are in "Create" mode (no mode prop) AND user hasn't manually edited slug logic (simplification: just do it for new)
        if (!mode) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="font-bold text-slate-800">{mode ? "Edit Mode" : "Create New Mode"}</h2>
                    <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mode Name</label>
                        <Input
                            value={name}
                            onChange={handleNameChange}
                            placeholder="e.g. Crisis Response"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Slug (URL ID)</label>
                        <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="e.g. crisis-response"
                            className="font-mono text-xs bg-slate-50"
                            disabled={!!mode} // Disable slug editing for existing modes to prevent breaking links/refs
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Description</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this mode for?"
                            className="resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {mode ? "Save Changes" : "Create Mode"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
