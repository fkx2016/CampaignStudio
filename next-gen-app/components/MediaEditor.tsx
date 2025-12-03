"use client";

import React, { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { Type, QrCode, X, Check } from "lucide-react";
import Draggable from "@/components/ui/Draggable"; // Re-using our draggable component

interface MediaEditorProps {
    imageUrl: string;
    onSave: (finalImageBlob: Blob) => void;
    onCancel: () => void;
}

export default function MediaEditor({ imageUrl, onSave, onCancel }: MediaEditorProps) {
    // OVERLAY STATE
    const [textOverlay, setTextOverlay] = useState<{ text: string; x: number; y: number; color: string; size: number } | null>(null);
    const [qrOverlay, setQrOverlay] = useState<{ url: string; x: number; y: number; size: number } | null>(null);

    // INPUT STATE
    const [inputText, setInputText] = useState("");
    const [inputQrUrl, setInputQrUrl] = useState("");

    // Fetch Global Defaults
    useEffect(() => {
        fetch("http://localhost:8001/api/settings")
            .then(res => res.json())
            .then(data => {
                if (data.default_overlay_text) setInputText(data.default_overlay_text);
                if (data.default_qr_url) setInputQrUrl(data.default_qr_url);
            })
            .catch(err => console.error("Failed to load defaults", err));
    }, []);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // BAKE FUNCTION
    const handleBakeAndSave = async () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 1. Load Base Image
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;

        await new Promise((resolve) => { img.onload = resolve; });

        // Set canvas size to match image
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Draw Image
        ctx.drawImage(img, 0, 0);

        // Calculate Scale Factor (Screen vs Actual Image)
        // We need to map the DOM positions (screen pixels) to the Canvas positions (image pixels)
        const container = containerRef.current;
        if (container) {
            const rect = container.getBoundingClientRect();
            const scaleX = img.naturalWidth / rect.width;
            const scaleY = img.naturalHeight / rect.height;

            // 2. Draw Text
            if (textOverlay) {
                const fontSize = textOverlay.size * scaleX; // Scale font
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.fillStyle = textOverlay.color;
                ctx.strokeStyle = "black";
                ctx.lineWidth = fontSize / 15;

                // Adjust coordinates
                // Note: Draggable gives us 'left/top' relative to the container
                // We need to account for the text baseline/alignment
                const x = textOverlay.x * scaleX;
                const y = (textOverlay.y + textOverlay.size) * scaleY; // Approx baseline adjustment

                ctx.strokeText(textOverlay.text, x, y);
                ctx.fillText(textOverlay.text, x, y);
            }

            // 3. Draw QR Code
            if (qrOverlay) {
                // We need to generate the QR code as an image first or draw it manually
                // Since react-qr-code renders an SVG, drawing it to canvas is tricky.
                // Simplified approach: We will just grab the SVG data URL if possible, 
                // OR for this MVP, we might skip baking the QR code perfectly and just focus on text first?
                // NO, let's try to do it.

                // Hack: We can find the SVG in the DOM, serialize it, and draw it.
                const svgElement = document.getElementById("qr-code-svg");
                if (svgElement) {
                    const svgData = new XMLSerializer().serializeToString(svgElement);
                    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    const url = URL.createObjectURL(svgBlob);

                    const qrImg = new Image();
                    qrImg.onload = () => {
                        const size = qrOverlay.size * scaleX;
                        ctx.drawImage(qrImg, qrOverlay.x * scaleX, qrOverlay.y * scaleY, size, size);
                        URL.revokeObjectURL(url);

                        // FINAL EXPORT
                        canvas.toBlob((blob) => {
                            if (blob) onSave(blob);
                        }, "image/png");
                    };
                    qrImg.src = url;
                    return; // Wait for QR load
                }
            }
        }

        // If no QR, just save immediately
        canvas.toBlob((blob) => {
            if (blob) onSave(blob);
        }, "image/png");
    };

    // ADD HANDLERS
    const addTextOverlay = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setTextOverlay({
            text: inputText || "Hello World",
            x: rect.left + (rect.width / 2) - 100, // Center relative to WINDOW
            y: rect.top + (rect.height * 0.2), // Top area relative to WINDOW
            color: "white",
            size: 40
        });
    };

    const addQrOverlay = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setQrOverlay({
            url: inputQrUrl || "https://example.com",
            x: rect.left + (rect.width / 2) - 50, // Center relative to WINDOW
            y: rect.top + (rect.height * 0.6), // Bottom area relative to WINDOW
            size: 100
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* TOOLBAR */}
            <div className="flex gap-2 mb-4 p-2 bg-slate-100 rounded-lg border border-slate-200">

                {/* Text Tool */}
                <div className="flex-1 flex gap-2 items-center">
                    <input
                        placeholder="Add Text Overlay..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="h-8 text-xs bg-white border border-slate-300 rounded px-2 w-full"
                    />
                    <button
                        className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-50"
                        onClick={addTextOverlay}
                    >
                        <Type className="w-4 h-4" />
                    </button>
                </div>

                <div className="w-px bg-slate-300 mx-1"></div>

                {/* QR Tool */}
                <div className="flex-1 flex gap-2 items-center">
                    <input
                        placeholder="QR Link URL..."
                        value={inputQrUrl}
                        onChange={(e) => setInputQrUrl(e.target.value)}
                        className="h-8 text-xs bg-white border border-slate-300 rounded px-2 w-full"
                    />
                    <button
                        className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-50"
                        onClick={addQrOverlay}
                    >
                        <QrCode className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* CANVAS AREA */}
            <div className="relative flex-1 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center" ref={containerRef}>
                <img src={imageUrl} alt="Base" className="max-w-full max-h-full object-contain pointer-events-none select-none" />

                {/* TEXT LAYER */}
                {textOverlay && (
                    <Draggable
                        initialPos={{ x: textOverlay.x, y: textOverlay.y }}
                        className="absolute cursor-move z-10 group"
                    >
                        <div className="relative">
                            <h2
                                className="font-bold leading-none select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                                style={{
                                    color: textOverlay.color,
                                    fontSize: `${textOverlay.size}px`,
                                    textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" // Stroke effect
                                }}
                            >
                                {textOverlay.text}
                            </h2>
                            {/* Controls (Visible on Hover) */}
                            <div className="absolute -top-8 left-0 hidden group-hover:flex gap-1 bg-white p-1 rounded shadow-lg">
                                <div className="w-4 h-4 bg-white border border-slate-300 cursor-pointer" onClick={() => setTextOverlay({ ...textOverlay, color: "white" })}></div>
                                <div className="w-4 h-4 bg-yellow-400 border border-slate-300 cursor-pointer" onClick={() => setTextOverlay({ ...textOverlay, color: "#FACC15" })}></div>
                                <div className="w-4 h-4 bg-black border border-slate-300 cursor-pointer" onClick={() => setTextOverlay({ ...textOverlay, color: "black" })}></div>
                                <X className="w-4 h-4 text-red-500 cursor-pointer ml-2" onClick={() => setTextOverlay(null)} />
                            </div>
                        </div>
                    </Draggable>
                )}

                {/* QR LAYER */}
                {qrOverlay && (
                    <Draggable
                        initialPos={{ x: qrOverlay.x, y: qrOverlay.y }}
                        className="absolute cursor-move z-10 group bg-white p-2 rounded-sm"
                    >
                        <div className="relative">
                            <QRCode
                                id="qr-code-svg"
                                value={qrOverlay.url}
                                size={qrOverlay.size}
                                level="M"
                            />
                            <div className="absolute -top-8 left-0 hidden group-hover:flex gap-1 bg-white p-1 rounded shadow-lg">
                                <X className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => setQrOverlay(null)} />
                            </div>
                        </div>
                    </Draggable>
                )}

            </div>

            {/* FOOTER ACTIONS */}
            <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded" onClick={onCancel}>Cancel</button>
                <button onClick={handleBakeAndSave} className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-700 text-white rounded flex items-center">
                    <Check className="w-4 h-4 mr-2" /> Bake & Copy
                </button>
            </div>

            {/* Hidden Canvas for Baking */}
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
}
