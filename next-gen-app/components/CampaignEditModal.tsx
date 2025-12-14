"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CampaignEditModalProps {
    campaign: { id: number; title: string } | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: number, newTitle: string) => void;
}

export default function CampaignEditModal({ campaign, open, onOpenChange, onSave }: CampaignEditModalProps) {
    // Initialize state from props. Parent must key this component to reset it.
    const [title, setTitle] = useState(campaign?.title || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (campaign && title.trim()) {
            onSave(campaign.id, title);
            onOpenChange(false);
        }
    };

    if (!open || !campaign) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="font-bold text-slate-800">
                        {campaign.id === 0 ? "Create New Campaign" : "Edit Campaign"}
                    </h2>
                    <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Campaign Name</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Q4 Marketing Push"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                            {campaign.id === 0 ? "Create Campaign" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
