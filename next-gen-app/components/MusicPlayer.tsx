"use client";

import { useState, useEffect } from "react";
import Draggable from "@/components/ui/Draggable";
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
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/api/settings")
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

            {/* Minimized State */}
            {isMinimized && (
                <div className="p-3 bg-white text-xs text-slate-500 flex justify-between items-center">
                    <span>🎵 Lo-Fi Girl Radio</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
            )}
        </Draggable>
    );
}
