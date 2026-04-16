'use client';


/**
 * Pure-CSS animated circuit/grid background.
 * Renders a canvas of pulsing nodes connected by subtle lines.
 * No external dependencies — all animation via CSS keyframes.
 */
export function CircuitGrid() {
  return (
    <div className="circuit-grid-container" aria-hidden="true">
      {/* Dot grid via SVG pattern */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="circuit-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#00E5A0" />
          </pattern>
          <pattern id="circuit-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="url(#circuit-dots)" />
            {/* Horizontal line segment */}
            <line x1="0" y1="40" x2="30" y2="40" stroke="#00E5A0" strokeWidth="0.5" />
            {/* Vertical line segment */}
            <line x1="40" y1="0" x2="40" y2="30" stroke="#00E5A0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-grid)" />
      </svg>

      {/* Floating accent nodes */}
      <div className="circuit-node" style={{ top: '15%', left: '10%', animationDelay: '0s' }} />
      <div className="circuit-node" style={{ top: '30%', left: '70%', animationDelay: '0.8s' }} />
      <div className="circuit-node" style={{ top: '60%', left: '25%', animationDelay: '1.6s' }} />
      <div className="circuit-node" style={{ top: '75%', left: '85%', animationDelay: '2.4s' }} />
      <div className="circuit-node" style={{ top: '45%', left: '50%', animationDelay: '3.2s' }} />

      {/* Glow orbs */}
      <div
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{
          width: 400,
          height: 400,
          top: '-10%',
          left: '60%',
          background: 'radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 70%)',
          animation: 'orbFloat 8s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{
          width: 300,
          height: 300,
          top: '50%',
          left: '-5%',
          background: 'radial-gradient(circle, rgba(0,229,160,0.05) 0%, transparent 70%)',
          animation: 'orbFloat 12s ease-in-out infinite reverse',
        }}
      />

      <style>{`
        .circuit-grid-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .circuit-node {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00E5A0;
          box-shadow: 0 0 12px rgba(0,229,160,0.6);
          animation: nodeGlow 4s ease-in-out infinite;
        }
        @keyframes nodeGlow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.4); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-30px) translateX(20px); }
          66% { transform: translateY(15px) translateX(-15px); }
        }
      `}</style>
    </div>
  );
}
