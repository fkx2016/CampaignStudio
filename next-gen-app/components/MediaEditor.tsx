"use client";

import React, { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { API_BASE_URL } from "@/lib/api";
import { Type, QrCode, X, Check, Square, Smartphone, Monitor, LayoutTemplate } from "lucide-react";
import Draggable from "@/components/ui/Draggable"; // Re-using our draggable component

interface MediaEditorProps {
    imageUrl: string;
    onSave: (finalImageBlob: Blob) => void;
    onCancel: () => void;
}

type AspectRatio = "original" | "1:1" | "9:16" | "16:9";
type TemplateType = "none" | "meme" | "quote" | "promo";

export default function MediaEditor({ imageUrl, onSave, onCancel }: MediaEditorProps) {
    // OVERLAY STATE
    const [textOverlay, setTextOverlay] = useState<{ text: string; x: number; y: number; color: string; size: number; font?: string; shadow?: boolean; bg?: string } | null>(null);
    const [qrOverlay, setQrOverlay] = useState<{ url: string; x: number; y: number; size: number } | null>(null);

    // EDITOR STATE
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("original");
    const [activeTemplate, setActiveTemplate] = useState<TemplateType>("none");

    // INPUT STATE
    const [inputText, setInputText] = useState("");
    const [inputQrUrl, setInputQrUrl] = useState("");

    // Fetch Global Defaults
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.default_overlay_text) setInputText(data.default_overlay_text);
                if (data.default_qr_url) setInputQrUrl(data.default_qr_url);
            })
            .catch(err => console.error("Failed to load defaults", err));
    }, []);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // APPLY TEMPLATE LOGIC
    const applyTemplate = (type: TemplateType) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        setActiveTemplate(type);

        switch (type) {
            case "meme":
                // Impact font, bottom center, white with black stroke
                setTextOverlay({
                    text: inputText || "BOTTOM TEXT",
                    x: (w / 2) - 150, // Center approx
                    y: h - 80, // Bottom
                    color: "white",
                    size: 50,
                    font: "Impact, sans-serif",
                    shadow: true
                });
                break;
            case "quote":
                // Serif font, center, white, dark bg
                setTextOverlay({
                    text: inputText || "\"Your Quote Here\"",
                    x: (w / 2) - 150,
                    y: (h / 2) - 20,
                    color: "white",
                    size: 30,
                    font: "Georgia, serif",
                    bg: "rgba(0,0,0,0.6)"
                });
                break;
            case "promo":
                // Bold sans, top left, yellow
                setTextOverlay({
                    text: inputText || "LIMITED TIME OFFER",
                    x: 20,
                    y: 40,
                    color: "#FACC15",
                    size: 40,
                    font: "Arial, sans-serif",
                    shadow: true
                });
                break;
            default:
                setTextOverlay(null);
        }
    };

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

        // 2. Calculate Crop Dimensions
        let sourceX = 0;
        let sourceY = 0;
        let sourceW = img.naturalWidth;
        let sourceH = img.naturalHeight;

        if (aspectRatio !== "original") {
            const [rw, rh] = aspectRatio.split(":").map(Number);
            const targetRatio = rw / rh;
            const imageRatio = img.naturalWidth / img.naturalHeight;

            if (imageRatio > targetRatio) {
                // Image is wider than target -> Crop sides
                sourceW = sourceH * targetRatio;
                sourceX = (img.naturalWidth - sourceW) / 2;
            } else {
                // Image is taller than target -> Crop top/bottom
                sourceH = sourceW / targetRatio;
                sourceY = (img.naturalHeight - sourceH) / 2;
            }
        }

        // Set canvas size to the cropped size
        canvas.width = sourceW;
        canvas.height = sourceH;

        // Draw Image (Cropped)
        ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);

        // Calculate Scale Factor (Screen vs Actual Canvas)
        const container = containerRef.current;
        if (container) {
            const rect = container.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            // 3. Draw Text
            if (textOverlay) {
                const fontSize = textOverlay.size * scaleX;
                const fontName = textOverlay.font || "sans-serif";
                ctx.font = `bold ${fontSize}px ${fontName}`;

                const x = textOverlay.x * scaleX;
                const y = (textOverlay.y + textOverlay.size) * scaleY;

                // Draw Background if needed
                if (textOverlay.bg) {
                    const textWidth = ctx.measureText(textOverlay.text).width;
                    ctx.fillStyle = textOverlay.bg;
                    // Approx padding
                    ctx.fillRect(x - 10, y - fontSize, textWidth + 20, fontSize + 10);
                }

                ctx.fillStyle = textOverlay.color;

                if (textOverlay.shadow) {
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = fontSize / 15;
                    ctx.strokeText(textOverlay.text, x, y);
                }

                ctx.fillText(textOverlay.text, x, y);
            }

            // 4. Draw QR Code
            if (qrOverlay) {
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

                        canvas.toBlob((blob) => {
                            if (blob) onSave(blob);
                        }, "image/png");
                    };
                    qrImg.src = url;
                    return;
                }
            }
        }

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
            x: (rect.width / 2) - 100,
            y: (rect.height * 0.2),
            color: "white",
            size: 40,
            shadow: true
        });
    };

    const addQrOverlay = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setQrOverlay({
            url: inputQrUrl || "https://example.com",
            x: (rect.width / 2) - 50,
            y: (rect.height * 0.6),
            size: 100
        });
    };

    const getAspectRatioStyle = () => {
        switch (aspectRatio) {
            case "1:1": return { aspectRatio: "1 / 1" };
            case "16:9": return { aspectRatio: "16 / 9" };
            case "9:16": return { aspectRatio: "9 / 16" };
            default: return {};
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* TOOLBAR */}
            <div className="flex flex-col gap-2 mb-4 p-2 bg-slate-100 rounded-lg border border-slate-200">

                {/* Row 1: Tools */}
                <div className="flex gap-2">
                    <div className="flex-1 flex gap-2 items-center">
                        <input
                            placeholder="Add Text Overlay..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="h-8 text-xs bg-white border border-slate-300 rounded px-2 w-full"
                        />
                        <button className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-50" onClick={addTextOverlay} title="Add Text">
                            <Type className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="w-px bg-slate-300 mx-1"></div>
                    <div className="flex-1 flex gap-2 items-center">
                        <input
                            placeholder="QR Link URL..."
                            value={inputQrUrl}
                            onChange={(e) => setInputQrUrl(e.target.value)}
                            className="h-8 text-xs bg-white border border-slate-300 rounded px-2 w-full"
                        />
                        <button className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-50" onClick={addQrOverlay} title="Add QR Code">
                            <QrCode className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Row 2: Canvas Settings */}
                <div className="flex gap-2 items-center border-t border-slate-200 pt-2 overflow-x-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Canvas:</span>
                    <button onClick={() => setAspectRatio("original")} className={`px-2 py-1 text-xs rounded border ${aspectRatio === "original" ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white border-slate-300"}`}>Original</button>
                    <button onClick={() => setAspectRatio("1:1")} className={`p-1 rounded border ${aspectRatio === "1:1" ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white border-slate-300"}`} title="Square"><Square className="w-4 h-4" /></button>
                    <button onClick={() => setAspectRatio("9:16")} className={`p-1 rounded border ${aspectRatio === "9:16" ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white border-slate-300"}`} title="Vertical"><Smartphone className="w-4 h-4" /></button>
                    <button onClick={() => setAspectRatio("16:9")} className={`p-1 rounded border ${aspectRatio === "16:9" ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white border-slate-300"}`} title="Horizontal"><Monitor className="w-4 h-4" /></button>

                    <div className="w-px bg-slate-300 mx-1 h-4"></div>

                    <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Templates:</span>
                    <button onClick={() => applyTemplate("meme")} className={`px-2 py-1 text-xs rounded border ${activeTemplate === "meme" ? "bg-purple-100 border-purple-500 text-purple-700" : "bg-white border-slate-300"}`}>Meme</button>
                    <button onClick={() => applyTemplate("quote")} className={`px-2 py-1 text-xs rounded border ${activeTemplate === "quote" ? "bg-purple-100 border-purple-500 text-purple-700" : "bg-white border-slate-300"}`}>Quote</button>
                    <button onClick={() => applyTemplate("promo")} className={`px-2 py-1 text-xs rounded border ${activeTemplate === "promo" ? "bg-purple-100 border-purple-500 text-purple-700" : "bg-white border-slate-300"}`}>Promo</button>
                </div>
            </div>

            {/* CANVAS AREA */}
            <div className="relative flex-1 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-4">
                <div
                    ref={containerRef}
                    className="relative overflow-hidden shadow-2xl bg-black"
                    style={{
                        ...getAspectRatioStyle(),
                        maxHeight: "100%",
                        maxWidth: "100%",
                        width: aspectRatio === "original" ? "auto" : undefined,
                        height: aspectRatio === "original" ? "auto" : undefined,
                        aspectRatio: aspectRatio === "original" ? undefined : getAspectRatioStyle().aspectRatio
                    }}
                >
                    <img
                        src={imageUrl}
                        alt="Base"
                        className={`w-full h-full pointer-events-none select-none ${aspectRatio !== "original" ? "object-cover" : "object-contain"}`}
                    />

                    {/* TEXT LAYER */}
                    {textOverlay && (
                        <Draggable
                            initialPos={{ x: textOverlay.x, y: textOverlay.y }}
                            containerRef={containerRef}
                            className="absolute cursor-move z-10 group"
                        >
                            <div className="relative">
                                <h2
                                    className="leading-none select-none"
                                    style={{
                                        color: textOverlay.color,
                                        fontSize: `${textOverlay.size}px`,
                                        fontFamily: textOverlay.font || "sans-serif",
                                        fontWeight: "bold",
                                        textShadow: textOverlay.shadow ? "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" : "none",
                                        whiteSpace: "nowrap",
                                        backgroundColor: textOverlay.bg || "transparent",
                                        padding: textOverlay.bg ? "4px 8px" : "0"
                                    }}
                                >
                                    {textOverlay.text}
                                </h2>
                                {/* Controls */}
                                <div className="absolute -top-8 left-0 hidden group-hover:flex gap-1 bg-white p-1 rounded shadow-lg z-50">
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
                            containerRef={containerRef}
                            className="absolute cursor-move z-10 group bg-white p-2 rounded-sm"
                        >
                            <div className="relative">
                                <QRCode
                                    id="qr-code-svg"
                                    value={qrOverlay.url}
                                    size={qrOverlay.size}
                                    level="M"
                                />
                                <div className="absolute -top-8 left-0 hidden group-hover:flex gap-1 bg-white p-1 rounded shadow-lg z-50">
                                    <X className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => setQrOverlay(null)} />
                                </div>
                            </div>
                        </Draggable>
                    )}
                </div>
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
