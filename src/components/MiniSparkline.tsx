import { useEffect, useRef } from 'react';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function MiniSparkline({ data, color = 'oklch(var(--chart-1))', height = 20, width = 60 }: MiniSparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const step = w / (data.length - 1 || 1);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    data.forEach((value, i) => {
      const x = i * step;
      const y = h - ((value - min) / range) * (h - 3) - 1.5;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }, [data, color, height, width]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="opacity-80"
    />
  );
}
