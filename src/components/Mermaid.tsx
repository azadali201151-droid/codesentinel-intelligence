import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
});

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      // Clean the chart string: handle literal \n and triple backticks
      // Also escape parentheses in labels and ensure valid syntax
      const cleanChart = chart
        .replace(/\\n/g, '\n')
        .replace(/`{3}mermaid\n?|`{3}/g, '')
        .replace(/\[([^\]]+)\(([^)]+)\)\]/g, '["$1 ($2)"]') // Convert [Node (Text)] to ["Node (Text)"]
        .replace(/\{([^}]+)\(([^)]+)\)\}/g, '{"$1 ($2)"}') // Convert {Node (Text)} to {"Node (Text)"}
        .replace(/--\s*-->/g, '-->') // Fix double dashes that sometimes break paths
        .trim();
      
      // Optimization: Avoid re-rendering the same chart
      if (ref.current.getAttribute('data-chart') === cleanChart) return;
      
      ref.current.innerHTML = '';
      ref.current.setAttribute('data-chart', cleanChart);
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      mermaid.render(id, cleanChart).then((res) => {
        if (ref.current) {
          ref.current.innerHTML = res.svg;
        }
      }).catch(err => {
        console.error("Mermaid render error:", err);
        if (ref.current) {
          ref.current.innerText = "Diagram syntax issue. Check source structure.";
          ref.current.className = "p-4 text-[9px] font-mono text-red-400 bg-red-400/5 rounded-lg border border-red-400/10";
        }
      });
    }
  }, [chart]);

  return (
    <div ref={ref} className="overflow-x-auto min-h-[300px] flex items-center justify-center bg-zinc-950/50 rounded-2xl border border-white/5 p-8" />
  );
};
