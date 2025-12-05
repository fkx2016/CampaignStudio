"use client";

import { useState, useEffect } from "react";
import Draggable from "@/components/ui/Draggable";
import { API_BASE_URL } from "@/lib/api";
import { X, Minimize2, Maximize2, Music } from "lucide-react";
// Removed Button import as we use native buttons for the player controls

export default function MusicPlayer({ onClose }: { onClose: () => void }) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [musicUrl, setMusicUrl] = useState("https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1"); // Default fallback

    // Helper to convert standard YouTube URL to Embed URL
    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        if (url.includes("/embed/")) return url; // Already correct

        // Handle standard watch?v= format
        const videoIdMatch = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|\/|$)/);
        if (videoIdMatch && videoIdMatch[1]) {
            return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1`;
        }

        // Handle youtu.be short links
        if (url.includes("youtu.be")) {
            const id = url.split("/").pop()?.split("?")[0];
            if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
        }

        return url; // Return original if we can't parse (might be non-YT)
    };

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.default_music_url) {
                    setMusicUrl(getEmbedUrl(data.default_music_url));
                }
            })
            .catch(err => console.error("Failed to fetch music settings", err));
    }, []);

    return (
        <Draggable initialPos={{ x: window.innerWidth - 380, y: window.innerHeight - 280 }} className="shadow-2xl rounded-lg overflow-hidden border border-slate-200 bg-white w-[360px]">
            {/* Header (Drag Handle) */}
            <div className="bg-slate-900 text-white p-2 flex items-center justify-between cursor-grab active:cursor-grabbing select-none">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <Music className="w-3 h-3" />
                    <span>Focus Station</span>
                </div>
                <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
                    {/* Controls - Stop propagation so clicking them doesn't start drag */}
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                        {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-red-600 rounded transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="bg-black" onMouseDown={(e) => e.stopPropagation()}>
                    {/* YouTube Embed */}
                    <iframe
                        width="100%"
                        height="200"
                        src={musicUrl}
                        title="Focus Music"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                    <div className="bg-slate-900 text-slate-400 text-[10px] p-1 text-center border-t border-slate-800">
                        Use video controls for volume 🔊
                    </div>
                </div>
            )}

            {/* Minimized State (Thumbnail Mode) */}
            {isMinimized && (
                <div className="p-2 bg-slate-900 border-t border-slate-700 flex gap-3 items-center" onMouseDown={(e) => e.stopPropagation()}>
                    {/* The "Ad / Signal" Thumbnail */}
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 group cursor-pointer" onClick={() => setIsMinimized(false)}>
                        <img
                            src="https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg"
                            alt="Station Thumbnail"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden" onClick={() => setIsMinimized(false)}>
                        <h4 className="text-white text-xs font-bold truncate">Focus Station</h4>
                        <p className="text-slate-400 text-[10px] truncate">Live 24/7 • lofi hip hop radio</p>
                    </div>

                    <button className="text-slate-500 hover:text-white transition-colors" title="Volume handled in player">
                        {/* Visual Volume Indicator (Static for now as iframe controls volume) */}
                        <div className="flex gap-0.5 items-end h-3">
                            <div className="w-0.5 h-1 bg-current rounded-full"></div>
                            <div className="w-0.5 h-2 bg-current rounded-full"></div>
                            <div className="w-0.5 h-3 bg-current rounded-full"></div>
                        </div>
                    </button>
                </div>
            )}
        </Draggable>
    );
}
