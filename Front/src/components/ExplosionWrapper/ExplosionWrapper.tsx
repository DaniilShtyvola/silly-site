import React, { useEffect, useRef, useState, useCallback } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

// Interface defining the structure of each fragment
interface FragmentData {
    id: string;          // Unique identifier for the fragment
    x: number;           // Original x position in the element
    y: number;           // Original y position in the element
    width: number;       // Width of the fragment
    height: number;      // Height of the fragment
    image: string;       // Data URL of the fragment image
    targetX: number;     // Target x position for explosion animation
    targetY: number;     // Target y position for explosion animation
    rotation: number;    // Rotation amount for the fragment
}

// Props interface for the component
interface ExplosionWrapperProps {
    explode: boolean;            // Trigger for explosion animation
    children: React.ReactNode;   // Content to be exploded
    fragmentSize?: number;       // Size of each fragment (default: 20px)
    duration?: number;           // Animation duration in seconds (default: 0.8s)
    explosionForce?: number;     // Force of explosion (default: 140)
    onAnimationComplete?: () => void;
}

const ExplosionWrapper: React.FC<ExplosionWrapperProps> = ({
    explode,
    children,
    fragmentSize = 20,
    duration = 0.8,
    explosionForce = 140,
    onAnimationComplete,
}) => {
    // State for storing all fragments
    const [fragments, setFragments] = useState<FragmentData[] | null>(null);
    // State to toggle visibility of original content
    const [isVisible, setIsVisible] = useState(true);
    // Ref for the container element
    const childrenRef = useRef<HTMLDivElement>(null);
    // Ref for tracking animation frame
    const animationFrameRef = useRef<number | null>(null);

    /**
     * Generates a single fragment from the source image
     * @returns FragmentData or null if fragment is empty/transparent
     */
    const generateFragment = useCallback((
        img: HTMLImageElement,
        domX: number,
        domY: number,
        domFragmentWidth: number,
        domFragmentHeight: number,
        scaleX: number,
        scaleY: number,
        explosionForce: number
    ): FragmentData | null => {
        // Create canvas for fragment processing
        const canvas = document.createElement('canvas');
        canvas.width = domFragmentWidth;
        canvas.height = domFragmentHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        // Calculate source image coordinates with scaling
        const imgX = domX * scaleX;
        const imgY = domY * scaleY;
        const imgFragmentWidth = domFragmentWidth * scaleX;
        const imgFragmentHeight = domFragmentHeight * scaleY;

        // Draw the fragment portion onto canvas
        ctx.drawImage(
            img,
            imgX, imgY, imgFragmentWidth, imgFragmentHeight,
            0, 0, domFragmentWidth, domFragmentHeight
        );

        // Check if fragment contains any visible pixels
        const imageData = ctx.getImageData(0, 0, domFragmentWidth, domFragmentHeight).data;
        let hasVisiblePixels = false;

        // Only check alpha channel (every 4th value in imageData)
        for (let i = 3; i < imageData.length; i += 4) {
            if (imageData[i] > 0) {
                hasVisiblePixels = true;
                break;
            }
        }

        // Skip transparent fragments to optimize performance
        if (!hasVisiblePixels) return null;

        // Calculate explosion trajectory (random angle and force)
        const angle = Math.random() * Math.PI * 2;
        const force = explosionForce * (0.5 + Math.random() * 0.5);
        const targetX = Math.cos(angle) * force;
        const targetY = Math.sin(angle) * force;

        // Random rotation direction and amount
        const rotationDirection = Math.random() > 0.5 ? 1 : -1;
        const rotationAngle = Math.random() * 180;
        const rotation = rotationAngle * rotationDirection;

        return {
            id: `${domX}-${domY}`,  // Unique ID based on position
            x: domX,
            y: domY,
            width: domFragmentWidth,
            height: domFragmentHeight,
            image: canvas.toDataURL(),  // Convert canvas to data URL
            targetX,
            targetY,
            rotation
        };
    }, []);

    /**
     * Main explosion effect handler
     * 1. Captures element as PNG
     * 2. Splits into fragments
     * 3. Prepares animation data
     */
    const explodeElement = useCallback(async () => {
        if (!childrenRef.current) return;

        // Wait for next animation frame to prevent UI blocking
        await new Promise(resolve => requestAnimationFrame(resolve));

        // Capture element as PNG
        const dataUrl = await toPng(childrenRef.current);
        const rect = childrenRef.current.getBoundingClientRect();
        const domWidth = rect.width;
        const domHeight = rect.height;

        // Load the captured image
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        // Calculate scaling between DOM and image dimensions
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const scaleX = imgWidth / domWidth;
        const scaleY = imgHeight / domHeight;

        // Calculate grid dimensions for fragments
        const cols = Math.ceil(domWidth / fragmentSize);
        const rows = Math.ceil(domHeight / fragmentSize);
        const newFragments: FragmentData[] = [];

        // Process fragments in batches to maintain performance
        const batchSize = 5;
        let currentRow = 0;

        // Processes a batch of rows
        const processBatch = (startRow: number, endRow: number) => {
            for (let row = startRow; row < endRow; row++) {
                for (let col = 0; col < cols; col++) {
                    const domX = col * fragmentSize;
                    const domY = row * fragmentSize;
                    const domFragmentWidth = Math.min(fragmentSize, domWidth - domX);
                    const domFragmentHeight = Math.min(fragmentSize, domHeight - domY);

                    if (domFragmentWidth <= 0 || domFragmentHeight <= 0) continue;

                    const fragment = generateFragment(
                        img,
                        domX,
                        domY,
                        domFragmentWidth,
                        domFragmentHeight,
                        scaleX,
                        scaleY,
                        explosionForce
                    );

                    if (fragment) {
                        newFragments.push(fragment);
                    }
                }
            }
        };

        // Batch processor using requestAnimationFrame
        const processInBatches = () => {
            const endRow = Math.min(currentRow + batchSize, rows);
            processBatch(currentRow, endRow);
            currentRow = endRow;

            if (currentRow < rows) {
                animationFrameRef.current = requestAnimationFrame(processInBatches);
            } else {
                // All fragments processed - update state
                setFragments(newFragments);
                setIsVisible(false);  // Hide original element
            }
        };

        // Wait one more frame before starting fragment processing
        await new Promise(resolve => requestAnimationFrame(resolve));
        processInBatches();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [fragmentSize, explosionForce, generateFragment]);

    // Main effect for handling explosion trigger
    useEffect(() => {
        if (explode && isVisible) {
            explodeElement();
        } else if (!explode) {
            // Reset state when explosion is done
            setIsVisible(true);
            setFragments(null);
        }

        // Cleanup animation frame on unmount
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [explode, isVisible, explodeElement]);

    // Effect for auto-clearing fragments after animation
    useEffect(() => {
        if (!fragments) return;

        const timer = setTimeout(() => {
            setFragments(null);

            onAnimationComplete?.();
        }, duration * 1000);

        return () => clearTimeout(timer);
    }, [fragments, duration, onAnimationComplete]);

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Original content (hidden during explosion) */}
            <div ref={childrenRef} style={{ visibility: isVisible ? 'visible' : 'hidden'}}>
                {children}
            </div>

            {/* Fragment animation container */}
            <AnimatePresence>
                {fragments && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        willChange: 'transform'
                    }}>
                        {fragments.map((fragment) => (
                            <motion.div
                                key={fragment.id}
                                style={{
                                    position: 'absolute',
                                    left: fragment.x,
                                    top: fragment.y,
                                    width: fragment.width,
                                    height: fragment.height,
                                    backgroundImage: `url(${fragment.image})`,
                                    pointerEvents: 'none',
                                    willChange: 'transform, opacity'
                                }}
                                initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                                animate={{
                                    opacity: 0,
                                    x: fragment.targetX,
                                    y: fragment.targetY,
                                    rotate: fragment.rotation,
                                }}
                                transition={{
                                    duration: duration,
                                    ease: "linear",
                                    type: "tween",
                                }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default React.memo(ExplosionWrapper);