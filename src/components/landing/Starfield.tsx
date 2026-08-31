import React, { useEffect, useRef } from 'react';

interface StarfieldProps {
  className?: string;
  density?: number; // stars per 10,000px²
}

/**
 * Lightweight animated starfield for marketing-page backgrounds — a real,
 * live Canvas2D animation (slow drift + twinkle), not a static image or a
 * GIF pretending to be one. Deliberately NOT the full Three.js galaxy engine
 * (GalaxyCanvas/GalaxyScene): that engine expects populated node data from
 * the app's data loaders and is built for interactive exploration, not as
 * a zero-dependency decorative backdrop — pulling it in here would mean
 * either faking node data or shipping an empty, inert 3D scene. This stays
 * visually consistent with the app's cosmic language at a fraction of the
 * cost, so the landing page stays fast on its own.
 */
export const Starfield: React.FC<StarfieldProps> = ({ className = '', density = 1.1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let stars: { x: number; y: number; r: number; baseAlpha: number; phase: number; speed: number }[] = [];

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((width * height * density) / 10000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.15 + 0.03,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        const twinkle = prefersReducedMotion ? 1 : 0.6 + 0.4 * Math.sin(t * 0.001 * s.speed * 6 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 232, 240, ${s.baseAlpha * twinkle})`;
        ctx.fill();
      }
      if (!prefersReducedMotion) {
        for (const s of stars) {
          s.y += s.speed * 0.15;
          if (s.y > height) { s.y = 0; s.x = Math.random() * width; }
        }
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={`block w-full h-full ${className}`} />;
};
