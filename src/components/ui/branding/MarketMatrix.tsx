'use client';

import React, { useEffect, useRef } from 'react';

export function MarketMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Financial character set
    const chars = '0123456789$€%¥+-.';
    const charArray = chars.split('');
    const fontSize = 14;
    const drops: number[] = [];
    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      width = canvas.width = parent.clientWidth;
      height = canvas.height = parent.clientHeight;
      
      const newColumns = Math.floor(width / fontSize);
      drops.length = 0;
      for (let i = 0; i < newColumns; i++) {
        drops[i] = Math.random() * -100;
      }
    };

    resizeCanvas();

    const draw = () => {
      // Use destination-out to fade previous frames instead of filling with a solid color
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const isBright = Math.random() > 0.95;
        ctx.fillStyle = isBright ? 'rgba(0, 255, 255, 0.9)' : 'rgba(0, 180, 255, 0.6)';
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i] += 0.35; 
      }
    };

    const interval = setInterval(draw, 33);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.9,
        display: 'block'
      }}
    />
  );
}
