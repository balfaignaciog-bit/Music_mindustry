import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';

interface MusicVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
  className?: string;
}

export const MusicVisualizer: React.FC<MusicVisualizerProps> = ({
  isPlaying,
  barCount = 28,
  height = 36,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dataArray = new Uint8Array(barCount);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        audioEngine.getVisualizerData(dataArray);
      } else {
        dataArray.fill(2);
      }

      const totalWidth = canvas.width;
      const barWidth = Math.max(2, (totalWidth / barCount) - 2);

      for (let i = 0; i < barCount; i++) {
        let val = isPlaying ? (dataArray[i] / 255) : 0.05;
        // fallback smooth synthetic animation if analyzer is quiet
        if (isPlaying && val < 0.05) {
          const t = Date.now() / 250;
          val = 0.15 + 0.35 * Math.abs(Math.sin(t + i * 0.4));
        }

        const barHeight = Math.max(3, val * canvas.height);
        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        // Mindustry style gradient (Amber / Orange to Titanium Blue)
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(0.7, '#fbbf24');
        gradient.addColorStop(1, '#fde68a');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 8}
      height={height}
      className={`rounded overflow-hidden opacity-90 ${className}`}
    />
  );
};
