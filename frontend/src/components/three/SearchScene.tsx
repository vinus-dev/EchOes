import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

// ─── Floating Particles ───────────────────────────────────────────────────────
function FloatingParticles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 300;

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      speeds[i] = 0.2 + Math.random() * 0.6;
    }
    return { positions, speeds };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.01;
      if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = clock.elapsedTime * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#7c3aed"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Cyan Accent Particles ────────────────────────────────────────────────────
function AccentParticles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 150;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = -clock.elapsedTime * 0.06;
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#06b6d4" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// ─── Gold Spark ───────────────────────────────────────────────────────────────
function GoldSparks() {
  const ref = useRef<THREE.Points>(null!);
  const count = 60;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(theta) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = Math.sin(theta) * r;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#f59e0b" transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

export default function SearchScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 65 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 5]} color="#7c3aed" intensity={2} />
      <Stars radius={60} depth={50} count={3000} factor={3} fade speed={0.5} />
      <FloatingParticles />
      <AccentParticles />
      <GoldSparks />
    </Canvas>
  );
}
