import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Phase = 'gather' | 'burst' | 'idle';

interface ParticleSystemProps {
  phase: Phase;
  elapsed: number;
}

function ParticleSystem({ phase, elapsed }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 2000;

  // 初始化粒子位置和目标位置
  const { positions, targets, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const targets = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // 初始位置：随机分布在屏幕四周
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      // 目标位置：中心聚合点
      targets[i3] = (Math.random() - 0.5) * 0.5;
      targets[i3 + 1] = (Math.random() - 0.5) * 0.5;
      targets[i3 + 2] = (Math.random() - 0.5) * 0.5;

      // 颜色：低饱和蓝紫/白
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        // 暖白色
        colors[i3] = 0.95;
        colors[i3 + 1] = 0.93;
        colors[i3 + 2] = 0.90;
      } else {
        // 低饱和蓝紫
        colors[i3] = 0.7 + Math.random() * 0.2;
        colors[i3 + 1] = 0.75 + Math.random() * 0.15;
        colors[i3 + 2] = 0.85 + Math.random() * 0.15;
      }
    }

    return { positions, targets, colors };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;

    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const positions = positionAttribute.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      if (phase === 'gather') {
        // Phase A: 聚合 (0-2s)
        const t = Math.min(elapsed / 2, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        
        positions[i3] = THREE.MathUtils.lerp(
          positions[i3],
          targets[i3],
          eased * 0.05
        );
        positions[i3 + 1] = THREE.MathUtils.lerp(
          positions[i3 + 1],
          targets[i3 + 1],
          eased * 0.05
        );
        positions[i3 + 2] = THREE.MathUtils.lerp(
          positions[i3 + 2],
          targets[i3 + 2],
          eased * 0.05
        );
      } else if (phase === 'burst') {
        // Phase B: 扩散 (2-4.5s)
        const t = Math.min((elapsed - 2) / 2.5, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
        const angle = Math.atan2(positions[i3 + 1], positions[i3]);
        const noise = (Math.random() - 0.5) * 0.3;
        const burstRadius = 2 + Math.random() * 1.5;
        
        positions[i3] += Math.cos(angle + noise) * eased * 0.08 * burstRadius;
        positions[i3 + 1] += Math.sin(angle + noise) * eased * 0.08 * burstRadius;
        positions[i3 + 2] += (Math.random() - 0.5) * eased * 0.05;
      } else if (phase === 'idle') {
        // Phase C: 轻微漂浮
        const time = elapsed * 0.3;
        positions[i3] += Math.sin(time + i * 0.01) * 0.0005;
        positions[i3 + 1] += Math.cos(time + i * 0.015) * 0.0005;
        positions[i3 + 2] += Math.sin(time * 0.5 + i * 0.02) * 0.0003;
      }
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={phase === 'burst' ? 0.9 : 0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function ParticleHero() {
  const [phase, setPhase] = useState<Phase>('gather');
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // 检测 prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setPhase('idle');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      setElapsed(elapsed);

      if (elapsed < 2) {
        setPhase('gather');
      } else if (elapsed < 4.5) {
        setPhase('burst');
      } else {
        setPhase('idle');
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ParticleSystem phase={phase} elapsed={elapsed} />
      </Canvas>
    </div>
  );
}
