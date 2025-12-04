"use client";

import { useState, useEffect } from "react";
import { X, Search, Globe, Hash } from "lucide-react";

interface Platform {
    id: number;
    name: string;
    slug: string;
    base_url: string;
    icon: string;
    char_limit: number;
    is_active: boolean;
    default_hashtags?: string;
    post_suffix?: string;
}

export default function SettingsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [settings, setSettings] = useState<{ default_overlay_text: string, default_qr_url: string, default_music_url: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Platforms & Settings
    useEffect(() => {
        if (open) {
            const loadData = async () => {
                setLoading(true);
                try {
                    const [platformsData, settingsData] = await Promise.all([
                        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/api/platforms").then(res => res.json()),
                        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/api/settings").then(res => res.json())
                    ]);
                    setPlatforms(platformsData);
                    setSettings(settingsData);
                } catch (err) {
                    console.error("Failed to fetch data", err);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [open]);

    // Update Global Settings
    const updateGlobalSetting = async (field: string, value: string) => {
        if (!settings) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...settings, [field]: value }),
            });
            setSettings({ ...settings, [field]: value });
        } catch (err) {
            console.error("Failed to update settings", err);
        }
    };

    // Toggle Active Status
    const togglePlatform = async (id: number, currentStatus: boolean) => {
        // Optimistic Update
        setPlatforms(platforms.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));

        try {
            await fetch(`http://localhost:8001/api/platforms/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !currentStatus }),
            });
        } catch (err) {
            console.error("Failed to update platform", err);
            // Revert if failed
            setPlatforms(platforms.map(p => p.id === id ? { ...p, is_active: currentStatus } : p));
        }
    };

    // Update Custom Fields (Hashtags/Suffix)
    const updatePlatformField = async (id: number, field: string, value: string) => {
        try {
            await fetch(`http://localhost:8001/api/platforms/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: value }),
            });
            setPlatforms(platforms.map(p => p.id === id ? { ...p, [field]: value } : p));
        } catch (err) {
            console.error("Failed to update platform", err);
        }
    };

    const filteredPlatforms = platforms
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => a.id - b.id);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-50 w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* HEADER */}
                <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            ⚙️ Platform Command Center
                        </h2>
                        <p className="text-sm text-slate-500">Manage your 25+ social destinations.</p>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* GLOBAL DEFAULTS */}
                {settings && (
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Default Overlay Text</label>
                            <input
                                className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm"
                                placeholder="e.g. AppleSux"
                                defaultValue={settings.default_overlay_text}
                                onBlur={(e) => updateGlobalSetting("default_overlay_text", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Default QR URL</label>
                            <input
                                className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm"
                                placeholder="e.g. https://mysite.com"
                                defaultValue={settings.default_qr_url}
                                onBlur={(e) => updateGlobalSetting("default_qr_url", e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Music Player URL (Embed)</label>
                            <input
                                className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm"
                                placeholder="e.g. https://www.youtube.com/embed/..."
                                defaultValue={settings.default_music_url}
                                onBlur={(e) => updateGlobalSetting("default_music_url", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* SEARCH */}
                <div className="px-6 py-4 bg-white border-b border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Search platforms..."
                            className="w-full pl-10 h-10 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* LIST */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full text-slate-400">Loading platforms...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPlatforms.map((platform) => (
                                <div key={platform.id} className={`p-4 rounded-lg border transition-all duration-200 ${platform.is_active ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100' : 'bg-slate-100 border-slate-200 opacity-80'}`}>

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${platform.is_active ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-slate-300 text-slate-500'}`}>
                                                {platform.name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 leading-tight">{platform.name}</h3>
                                                <div className="flex gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">
                                                    <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">{platform.char_limit} chars</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Custom Switch */}
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={platform.is_active} onChange={() => togglePlatform(platform.id, platform.is_active)} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    {/* Customization Fields (Only show if active) */}
                                    {platform.is_active && (
                                        <div className="space-y-3 pt-3 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                    <Hash className="w-3 h-3" /> Default Hashtags
                                                </label>
                                                <input
                                                    className="w-full h-8 text-xs px-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                                                    placeholder="Example: #campaign #news"
                                                    defaultValue={platform.default_hashtags}
                                                    onBlur={(e) => updatePlatformField(platform.id, 'default_hashtags', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                    <Globe className="w-3 h-3" /> Post Suffix / Link
                                                </label>
                                                <input
                                                    className="w-full h-8 text-xs px-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                                                    placeholder="Example: Link in bio 👇"
                                                    defaultValue={platform.post_suffix}
                                                    onBlur={(e) => updatePlatformField(platform.id, 'post_suffix', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Done & Save
                    </button>
                </div>
            </div>
        </div>
    );
}
