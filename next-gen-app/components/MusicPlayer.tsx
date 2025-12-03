"use client";

import { useState } from "react";
import Draggable from "@/components/ui/Draggable";
import { X, Minimize2, Maximize2, Music } from "lucide-react";
// Removed Button import as we use native buttons for the player controls

export default function MusicPlayer({ onClose }: { onClose: () => void }) {
    const [isMinimized, setIsMinimized] = useState(false);

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
                        src="https://www.youtube.com/embed/DlrUlJIRjsg?autoplay=1&controls=1"
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
