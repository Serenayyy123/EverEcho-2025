import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Three.js 粒子动画 - 行星 + 环
 * 聚合 → 蓄力闪 → 3D 爆散
 * 纯 Three.js，不用 @react-three/fiber
 */

interface ParticleConfig {
  planetCount: number;      // 行星粒子数
  ringCount: number;         // 环粒子数
  planetRadius: number;      // 行星半径
  ringInnerRadius: number;   // 环内径
  ringOuterRadius: number;   // 环外径
  gatherDuration: number;    // 聚合时长(ms)
  chargeDuration: number;    // 蓄力时长(ms)
  burstDuration: number;     // 爆散时长(ms)
  loopDelay: number;         // 循环延迟(ms)
}

const DEFAULT_CONFIG: ParticleConfig = {
  planetCount: 800,
  ringCount: 400,
  planetRadius: 1.8,
  ringInnerRadius: 2.8,
  ringOuterRadius: 3.6,
  gatherDuration: 2500,
  chargeDuration: 300,
  burstDuration: 2000,
  loopDelay: 1000,
};

export function HomeParticles({ config = DEFAULT_CONFIG }: { config?: Partial<ParticleConfig> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particle data
    interface ParticleData {
      startPos: THREE.Vector3;
      targetPos: THREE.Vector3;
      burstVel: THREE.Vector3;
      color: THREE.Color;
      type: 'planet' | 'ring';
    }

    const particles: ParticleData[] = [];
    const positions: Float32Array = new Float32Array((fullConfig.planetCount + fullConfig.ringCount) * 3);
    const colors: Float32Array = new Float32Array((fullConfig.planetCount + fullConfig.ringCount) * 3);

    // Generate planet particles (Fibonacci sphere)
    for (let i = 0; i < fullConfig.planetCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / fullConfig.planetCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = fullConfig.planetRadius * Math.sin(phi) * Math.cos(theta);
      const y = fullConfig.planetRadius * Math.sin(phi) * Math.sin(theta);
      const z = fullConfig.planetRadius * Math.cos(phi);

      const startAngle = Math.random() * Math.PI * 2;
      const startDist = 8 + Math.random() * 4;
      const startPos = new THREE.Vector3(
        Math.cos(startAngle) * startDist,
        (Math.random() - 0.5) * 10,
        Math.sin(startAngle) * startDist
      );

      const targetPos = new THREE.Vector3(x, y, z);

      // Burst velocity with spiral
      const burstDir = targetPos.clone().normalize();
      const tangent = new THREE.Vector3(-burstDir.y, burstDir.x, 0).normalize();
      const burstVel = burstDir.multiplyScalar(3 + Math.random() * 2)
        .add(tangent.multiplyScalar((Math.random() - 0.5) * 1.5));

      // Planet colors: blue-purple-cyan gradient
      const colorChoice = Math.random();
      let color: THREE.Color;
      if (colorChoice < 0.4) {
        color = new THREE.Color(0.2 + Math.random() * 0.2, 0.3 + Math.random() * 0.3, 0.6 + Math.random() * 0.3);
      } else if (colorChoice < 0.7) {
        color = new THREE.Color(0.4 + Math.random() * 0.2, 0.2 + Math.random() * 0.2, 0.7 + Math.random() * 0.2);
      } else {
        color = new THREE.Color(0.2 + Math.random() * 0.2, 0.5 + Math.random() * 0.3, 0.6 + Math.random() * 0.3);
      }

      particles.push({ startPos, targetPos, burstVel, color, type: 'planet' });
    }

    // Generate ring particles
    for (let i = 0; i < fullConfig.ringCount; i++) {
      const t = (i / fullConfig.ringCount) * Math.PI * 2;
      const radius = fullConfig.ringInnerRadius + Math.random() * (fullConfig.ringOuterRadius - fullConfig.ringInnerRadius);

      const x = radius * Math.cos(t);
      const y = radius * Math.sin(t) * 0.15; // Flatten
      const z = radius * Math.sin(t) * 0.3;

      // Tilt ring
      const tiltAngle = 20 * (Math.PI / 180);
      const yRotated = y * Math.cos(tiltAngle) - z * Math.sin(tiltAngle);
      const zRotated = y * Math.sin(tiltAngle) + z * Math.cos(tiltAngle);

      const startAngle = Math.random() * Math.PI * 2;
      const startDist = 8 + Math.random() * 4;
      const startPos = new THREE.Vector3(
        Math.cos(startAngle) * startDist,
        (Math.random() - 0.5) * 10,
        Math.sin(startAngle) * startDist
      );

      const targetPos = new THREE.Vector3(x, yRotated, zRotated);

      const burstDir = new THREE.Vector3(x, yRotated, 0).normalize();
      const burstVel = burstDir.multiplyScalar(4 + Math.random() * 2);

      // Ring colors: light gold-purple
      const color = new THREE.Color(
        0.7 + Math.random() * 0.2,
        0.6 + Math.random() * 0.3,
        0.8 + Math.random() * 0.2
      );

      particles.push({ startPos, targetPos, burstVel, color, type: 'ring' });
    }

    // Initialize positions at start
    particles.forEach((p, i) => {
      positions[i * 3] = p.startPos.x;
      positions[i * 3 + 1] = p.startPos.y;
      positions[i * 3 + 2] = p.startPos.z;
      colors[i * 3] = p.color.r;
      colors[i * 3 + 1] = p.color.g;
      colors[i * 3 + 2] = p.color.b;
    });

    // Create particle system
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation state
    let phase: 'gather' | 'charge' | 'burst' | 'wait' = 'gather';
    let phaseStartTime = Date.now();
    let animationId: number;

    // Animation loop
    function animate() {
      animationId = requestAnimationFrame(animate);

      const now = Date.now();
      const elapsed = now - phaseStartTime;
      const posAttr = geometry.getAttribute('position');

      if (phase === 'gather') {
        const t = Math.min(elapsed / fullConfig.gatherDuration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad

        particles.forEach((p, i) => {
          const pos = p.startPos.clone().lerp(p.targetPos, eased);
          posAttr.setXYZ(i, pos.x, pos.y, pos.z);
        });

        if (t >= 1) {
          phase = 'charge';
          phaseStartTime = now;
        }
      } else if (phase === 'charge') {
        const t = elapsed / fullConfig.chargeDuration;
        const flash = Math.sin(t * Math.PI * 4) * 0.3 + 1; // Flash effect

        material.opacity = 0.9 * flash;
        material.size = 0.05 * (1 + Math.sin(t * Math.PI * 2) * 0.3);

        if (elapsed >= fullConfig.chargeDuration) {
          phase = 'burst';
          phaseStartTime = now;
          material.opacity = 0.9;
          material.size = 0.05;
        }
      } else if (phase === 'burst') {
        const t = Math.min(elapsed / fullConfig.burstDuration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic

        particles.forEach((p, i) => {
          const burstPos = p.targetPos.clone().add(p.burstVel.clone().multiplyScalar(eased * 3));
          posAttr.setXYZ(i, burstPos.x, burstPos.y, burstPos.z);
        });

        material.opacity = 0.9 * (1 - t * 0.7);

        if (t >= 1) {
          phase = 'wait';
          phaseStartTime = now;
        }
      } else if (phase === 'wait') {
        if (elapsed >= fullConfig.loopDelay) {
          // Reset
          particles.forEach((p, i) => {
            posAttr.setXYZ(i, p.startPos.x, p.startPos.y, p.startPos.z);
          });
          material.opacity = 0.9;
          phase = 'gather';
          phaseStartTime = now;
        }
      }

      posAttr.needsUpdate = true;

      // Slow rotation
      points.rotation.y += 0.0005;

      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [fullConfig]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
