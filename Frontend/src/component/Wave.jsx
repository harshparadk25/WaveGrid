/*
  WaveGrid.jsx
  React component implementing a traveling color band across the grid (bouncing left↔right).
  Fixed values: 15 rows, 20 columns, 28px cells, 6 cols/sec speed, 4px gap, base hue 220.
  The band covers exactly 6 columns: strongest intensity at the head, fading toward the tail.
  It never shrinks below 6 columns at the edges.
*/

import React, { useEffect, useRef, useState } from 'react';

export default function WaveGrid() {
  const rows = 15;
  const cols = 20;
  const cellSize = 28;
  const speed = 6; 
  const baseHue = 220;
  const gap = 4;

  const headRef = useRef(0);
  const dirRef = useRef(1); 
  const lastRef = useRef(null);
  const [, setTick] = useState(0);

  
  useEffect(() => {
    let raf = null;
    const loop = (time) => {
      if (lastRef.current == null) lastRef.current = time;
      const dt = (time - lastRef.current) / 1000;
      lastRef.current = time;
      headRef.current += dirRef.current * speed * dt;
      const bandWidth = 6;
      if (headRef.current >= cols - 1) {
        headRef.current = cols - 1;
        dirRef.current = -1;
      } else if (headRef.current <= bandWidth - 1) {
        headRef.current = bandWidth - 1;
        dirRef.current = 1;
      }
      setTick(t => t + dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lastRef.current = null;
    };
  }, [speed, cols]);

  
  const renderCells = () => {
    const head = headRef.current;
    const time = performance.now() / 1000;
    const hue = (baseHue + Math.sin(time * 0.5) * 60 + 360) % 360;
    const bandWidth = 6;
    const cells = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let dist = c - Math.round(head);
        let intensity = 0;
        if (dist <= 0 && dist > -bandWidth) {
          intensity = (bandWidth + dist) / bandWidth; 
        }

        const lightness = Math.round(8 + intensity * 55);
        const satur = Math.round(70 + intensity * 30);
        const bg = intensity === 0 ? '#000' : `hsl(${Math.round(hue)}, ${satur}%, ${lightness}%)`;
        const glow = intensity === 0 ? 'none' : `0 0 ${12 * intensity}px hsl(${Math.round(hue)}, 100%, 60% / ${0.6 * intensity})`;

        const style = {
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          background: bg,
          boxShadow: glow,
          borderRadius: '3px',
          border: '1px solid rgba(0,0,0,0.55)',
          transition: 'background 150ms linear, box-shadow 150ms linear',
        };

        cells.push(<div key={`${r}-${c}`} style={style} />);
      }
    }
    return cells;
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gap: `${gap}px`,
    background: '#111',
    padding: `${gap}px`,
    borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
  };

  return (
    <div >
      <div style={gridStyle}>{renderCells()}</div>
    </div>
  );
}
