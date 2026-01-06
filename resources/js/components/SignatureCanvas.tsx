import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SignatureCanvasProps {
    onSignatureChange: (hasSignature: boolean, dataUrl: string | null) => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
    onSignatureChange,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    const getCoordinates = useCallback(
        (e: React.TouchEvent | React.MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            if ('touches' in e) {
                const touch = e.touches[0];
                return {
                    x: (touch.clientX - rect.left) * scaleX,
                    y: (touch.clientY - rect.top) * scaleY,
                };
            } else {
                return {
                    x: (e.clientX - rect.left) * scaleX,
                    y: (e.clientY - rect.top) * scaleY,
                };
            }
        },
        [],
    );

    const startDrawing = useCallback(
        (e: React.TouchEvent | React.MouseEvent) => {
            e.preventDefault();
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!ctx) return;

            const { x, y } = getCoordinates(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
            setIsDrawing(true);
        },
        [getCoordinates],
    );

    const draw = useCallback(
        (e: React.TouchEvent | React.MouseEvent) => {
            e.preventDefault();
            if (!isDrawing) return;

            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!ctx) return;

            const { x, y } = getCoordinates(e);
            ctx.lineTo(x, y);
            ctx.stroke();

            if (!hasSignature) {
                setHasSignature(true);
            }
        },
        [isDrawing, hasSignature, getCoordinates],
    );

    const stopDrawing = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            if (canvas && hasSignature) {
                onSignatureChange(true, canvas.toDataURL('image/png'));
            }
        }
    }, [isDrawing, hasSignature, onSignatureChange]);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        onSignatureChange(false, null);
    }, [onSignatureChange]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = 'hsl(220, 25%, 10%)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    return (
        <div className="space-y-3">
            <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="signature-canvas h-[150px] w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                {!hasSignature && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="text-sm text-muted-foreground/50">
                            Signez ici avec votre doigt ou souris
                        </span>
                    </div>
                )}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="w-full"
            >
                <Eraser className="mr-2 h-4 w-4" />
                Effacer la signature
            </Button>
        </div>
    );
};

export default SignatureCanvas;
