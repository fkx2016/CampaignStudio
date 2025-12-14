"use client";

import React, { useState, useRef, useEffect } from "react";

interface DraggableProps {
    children: React.ReactNode;
    initialPos?: { x: number; y: number };
    className?: string;
    containerRef?: React.RefObject<HTMLElement | HTMLDivElement | null>; // Accept null for strict typing
}

export default function Draggable({ children, initialPos = { x: 0, y: 0 }, className = "", containerRef }: DraggableProps) {
    const [position, setPosition] = useState(initialPos);
    const [isDragging, setIsDragging] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    // We store the initial mouse position and initial item position at the start of drag
    const dragStartRef = useRef<{ mouseX: number; mouseY: number; itemX: number; itemY: number } | null>(null);

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);

        // Get container offset if containerRef is provided
        let offsetX = 0;
        let offsetY = 0;

        if (containerRef?.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            offsetX = containerRect.left;
            offsetY = containerRect.top;
        } else if (elementRef.current?.offsetParent) {
            // Fallback: use offsetParent
            const parentRect = elementRef.current.offsetParent.getBoundingClientRect();
            offsetX = parentRect.left;
            offsetY = parentRect.top;
        }

        dragStartRef.current = {
            mouseX: e.clientX - offsetX,
            mouseY: e.clientY - offsetY,
            itemX: position.x,
            itemY: position.y
        };

        e.stopPropagation();
        e.preventDefault();
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging || !dragStartRef.current) return;

            // Get container offset for relative positioning
            let offsetX = 0;
            let offsetY = 0;

            if (containerRef?.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                offsetX = containerRect.left;
                offsetY = containerRect.top;
            } else if (elementRef.current?.offsetParent) {
                const parentRect = elementRef.current.offsetParent.getBoundingClientRect();
                offsetX = parentRect.left;
                offsetY = parentRect.top;
            }

            const currentMouseX = e.clientX - offsetX;
            const currentMouseY = e.clientY - offsetY;

            const deltaX = currentMouseX - dragStartRef.current.mouseX;
            const deltaY = currentMouseY - dragStartRef.current.mouseY;

            setPosition({
                x: dragStartRef.current.itemX + deltaX,
                y: dragStartRef.current.itemY + deltaY
            });

            e.stopPropagation();
            e.preventDefault();
        };

        const onMouseUp = () => {
            setIsDragging(false);
            dragStartRef.current = null;
        };

        if (isDragging) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [isDragging, containerRef]);

    return (
        <div
            ref={elementRef}
            className={className}
            style={{
                position: "fixed", // Changed to fixed for viewport-relative positioning
                left: position.x,
                top: position.y,
                zIndex: 9999, // Increased z-index to ensure it's on top
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none"
            }}
            onMouseDown={onMouseDown}
        >
            {children}
        </div>
    );
}
