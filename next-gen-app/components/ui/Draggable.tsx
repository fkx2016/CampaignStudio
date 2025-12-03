"use client";

import React, { useState, useRef, useEffect } from "react";

interface DraggableProps {
    children: React.ReactNode;
    initialPos?: { x: number; y: number };
    className?: string;
}

export default function Draggable({ children, initialPos = { x: 0, y: 0 }, className = "" }: DraggableProps) {
    const [position, setPosition] = useState(initialPos);
    const [isDragging, setIsDragging] = useState(false);
    const [relPos, setRelPos] = useState({ x: 0, y: 0 }); // Position relative to cursor
    const nodeRef = useRef<HTMLDivElement>(null);

    const onMouseDown = (e: React.MouseEvent) => {
        // Only drag if clicking the handle (we'll assume the first child or a specific class is the handle, 
        // but for simplicity, let's say the whole container is draggable unless we specify otherwise.
        // Better: Let's assume the user clicks anywhere in this container.
        if (e.button !== 0) return;

        // Calculate offset
        if (nodeRef.current) {
            const rect = nodeRef.current.getBoundingClientRect();
            setRelPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
        setIsDragging(true);
        e.stopPropagation();
        e.preventDefault();
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const newX = e.clientX - relPos.x;
            const newY = e.clientY - relPos.y;
            setPosition({ x: newX, y: newY });
            e.stopPropagation();
            e.preventDefault();
        };

        const onMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [isDragging, relPos]);

    return (
        <div
            ref={nodeRef}
            className={className}
            style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                zIndex: 50,
                cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={onMouseDown}
        >
            {children}
        </div>
    );
}
