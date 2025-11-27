import { useEffect, useState } from 'react';

/**
 * 纯 CSS 粒子动画 Hero
 * 避免 Three.js 依赖问题，使用 CSS 动画实现
 */

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

export function ParticleHeroCss() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [phase, setPhase] = useState<'gather' | 'burst' | 'idle'>('gather');

  useEffect(() => {
    // 检测 prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setPhase('idle');
      return;
    }

    // 生成粒子
    const particleCount = 100; // 减少数量以提高性能
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const colorChoice = Math.random();
      let color;
      if (colorChoice < 0.6) {
        color = 'rgba(247, 247, 245, 0.7)'; // 暖白
      } else {
        color = `rgba(${180 + Math.random() * 40}, ${190 + Math.random() * 30}, ${215 + Math.random() * 30}, 0.7)`; // 低饱和蓝紫
      }

      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 2 + Math.random() * 1,
        delay: Math.random() * 0.5,
        color,
      });
    }

    setParticles(newParticles);

    // 动画时间线
    const gatherTimer = setTimeout(() => setPhase('burst'), 2000);
    const burstTimer = setTimeout(() => setPhase('idle'), 4500);

    return () => {
      clearTimeout(gatherTimer);
      clearTimeout(burstTimer);
    };
  }, []);

  return (
    <div style={styles.container}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`particle particle-${phase}`}
          style={{
            ...styles.particle,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes gather {
          0% {
            transform: translate(0, 0);
            opacity: 0.3;
          }
          100% {
            transform: translate(
              calc(50vw - ${particles[0]?.x || 50}vw),
              calc(50vh - ${particles[0]?.y || 50}vh)
            );
            opacity: 0.8;
          }
        }

        @keyframes burst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(
              calc((var(--random-x, 0) - 50) * 4vw),
              calc((var(--random-y, 0) - 50) * 4vh)
            ) scale(0.5);
            opacity: 0.4;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(10px, -10px);
          }
          50% {
            transform: translate(-5px, 5px);
          }
          75% {
            transform: translate(-10px, -5px);
          }
        }

        .particle-gather {
          animation: gather ease-out forwards;
        }

        .particle-burst {
          animation: burst cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .particle-idle {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  },
};
