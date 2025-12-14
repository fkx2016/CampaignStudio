"use client";

import { useState, useEffect, useRef } from "react";
import Draggable from "@/components/ui/Draggable";
import { API_BASE_URL } from "@/lib/api";
import { X, Minimize2, Maximize2, Music, Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from "lucide-react";

// Declare YouTube IFrame API types
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export default function MusicPlayer({ onClose }: { onClose: () => void }) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [videoId, setVideoId] = useState("jfKfPfyJRdk"); // Default lofi hip hop
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [playerReady, setPlayerReady] = useState(false);

    // Extract video ID from URL
    const getVideoId = (url: string): string => {
        if (!url) return "jfKfPfyJRdk";
        if (url.match(/^[a-zA-Z0-9_-]{11}$/)) return url;
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
        }
        return "jfKfPfyJRdk";
    };

    // Load YouTube IFrame API
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);

        // Player ready callback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onPlayerReady = (event: any) => {
            setPlayerReady(true);
            event.target.setVolume(volume);
            setDuration(event.target.getDuration());
            setIsPlaying(true);

            // Update progress every second
            const interval = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                    setCurrentTime(playerRef.current.getCurrentTime());
                }
            }, 1000);

            return () => clearInterval(interval);
        };

        // Player state change callback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onPlayerStateChange = (event: any) => {
            const state = event.data;
            // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
            setIsPlaying(state === 1);
            if (state === 0) { // Video ended
                // Loop is handled by playerVars
            }
        };

        const initPlayer = () => {
            if (!containerRef.current || playerRef.current) return;

            playerRef.current = new window.YT.Player(containerRef.current, {
                videoId: videoId,
                width: '100%',
                height: '200',
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                    loop: 1,
                    playlist: videoId, // Required for looping
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                },
            });
        };

        // Load video ID from settings
        fetch(`${API_BASE_URL}/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.default_music_url) {
                    setVideoId(getVideoId(data.default_music_url));
                }
            })
            .catch(err => console.error("Failed to fetch music settings", err));

        // Load YouTube IFrame API if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        // Wait for API to be ready and initialize player
        const checkAndInit = () => {
            if (window.YT && window.YT.Player && containerRef.current && !playerRef.current) {
                initPlayer();
            } else if (!playerRef.current) {
                setTimeout(checkAndInit, 100);
            }
        };

        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (originalCallback) originalCallback();
            checkAndInit();
        };

        checkAndInit();

        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (e) {
                    console.error("Error destroying player:", e);
                }
            }
        };
    }, []); // eslint-disable-next-line


    // Toggle play/pause
    const togglePlayPause = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    // Toggle mute
    const toggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    };

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        if (playerRef.current) {
            playerRef.current.setVolume(newVolume);
            if (newVolume > 0 && isMuted) {
                playerRef.current.unMute();
                setIsMuted(false);
            }
        }
    };

    // Handle seek
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (playerRef.current) {
            playerRef.current.seekTo(newTime, true);
        }
    };

    // Skip forward/backward
    const skip = (seconds: number) => {
        if (!playerRef.current) return;
        const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
        playerRef.current.seekTo(newTime, true);
    };

    // Format time (seconds to MM:SS)
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!mounted) return null;

    // Simple bottom-right position for fixed positioning
    const playerX = typeof window !== 'undefined' ? window.innerWidth - 380 : 20;
    const playerY = typeof window !== 'undefined' ? window.innerHeight - 400 : 20;

    return (
        <Draggable initialPos={{ x: playerX, y: playerY }} className="shadow-2xl rounded-lg overflow-hidden border border-slate-200 bg-white w-[360px]">
            {/* Header (Drag Handle) */}
            <div className="bg-slate-900 text-white p-2 flex items-center justify-between cursor-grab active:cursor-grabbing select-none">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <Music className="w-3 h-3" />
                    <span>Focus Station</span>
                </div>
                <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
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
                    {/* YouTube Player Container */}
                    <div ref={containerRef} className="w-full h-[200px]"></div>

                    {/* Custom Controls */}
                    <div className="bg-slate-900 p-3 border-t border-slate-800 space-y-3">
                        {/* Progress Bar */}
                        <div className="space-y-1">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / (duration || 1)) * 100}%, #334155 ${(currentTime / (duration || 1)) * 100}%, #334155 100%)`
                                }}
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center gap-2">
                            {/* Skip Back */}
                            <button
                                onClick={() => skip(-10)}
                                className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                                title="Skip back 10s"
                            >
                                <SkipBack className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {/* Play/Pause Button */}
                            <button
                                onClick={togglePlayPause}
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? (
                                    <Pause className="w-4 h-4 text-white" />
                                ) : (
                                    <Play className="w-4 h-4 text-white" />
                                )}
                            </button>

                            {/* Skip Forward */}
                            <button
                                onClick={() => skip(10)}
                                className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                                title="Skip forward 10s"
                            >
                                <SkipForward className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {/* Mute Button */}
                            <button
                                onClick={toggleMute}
                                className="p-1.5 hover:bg-slate-800 rounded transition-colors ml-auto"
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <Volume2 className="w-4 h-4 text-white" />
                                )}
                            </button>

                            {/* Volume Slider */}
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    style={{
                                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${isMuted ? 0 : volume}%, #334155 ${isMuted ? 0 : volume}%, #334155 100%)`
                                    }}
                                />
                                <span className="text-xs text-slate-400 font-mono w-8 text-right">
                                    {isMuted ? 0 : volume}%
                                </span>
                            </div>
                        </div>

                        {/* Info Text */}
                        <div className="text-slate-500 text-[10px] text-center">
                            {isPlaying ? "🎵 Playing" : "⏸️ Paused"} • Full YouTube controls available
                        </div>
                    </div>
                </div>
            )}

            {/* Minimized State (Thumbnail Mode) */}
            {isMinimized && (
                <div className="p-2 bg-slate-900 border-t border-slate-700 flex gap-3 items-center" onMouseDown={(e) => e.stopPropagation()}>
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 group cursor-pointer" onClick={() => setIsMinimized(false)}>
                        <img
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                            alt="Station Thumbnail"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            {isPlaying ? (
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                            ) : (
                                <Pause className="w-4 h-4 text-white opacity-80" />
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 overflow-hidden" onClick={() => setIsMinimized(false)}>
                        <h4 className="text-white text-xs font-bold truncate">Focus Station</h4>
                        <p className="text-slate-400 text-[10px] truncate">
                            {isPlaying ? "🎵" : "⏸️"} {formatTime(currentTime)} • Vol: {isMuted ? 0 : volume}%
                        </p>
                    </div>

                    {/* Quick Controls */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={togglePlayPause}
                            className="p-1 hover:bg-slate-800 rounded transition-colors"
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <Pause className="w-3 h-3 text-white" />
                            ) : (
                                <Play className="w-3 h-3 text-white" />
                            )}
                        </button>
                        <button
                            onClick={toggleMute}
                            className="p-1 hover:bg-slate-800 rounded transition-colors"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX className="w-3 h-3 text-slate-400" />
                            ) : (
                                <Volume2 className="w-3 h-3 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
