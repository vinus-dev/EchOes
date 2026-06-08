import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

// ─── Particle Ring ────────────────────────────────────────────────────────────
function ParticleRing() {
  const ref = useRef<THREE.Points>(null!);
  const count = 2000;

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * 6;
      const spread = (Math.random() - 0.5) * 3;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = spread;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      const t = Math.random();
      colors[i * 3] = 0.48 + t * 0.3;
      colors[i * 3 + 1] = 0.23 + t * 0.3;
      colors[i * 3 + 2] = 0.93 + t * 0.07;
    }
    return { positions, colors };
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Floating Orbs ────────────────────────────────────────────────────────────
function FloatingOrb({
  position,
  color,
  scale,
}: {
  position: [number, number, number];
  color: string;
  scale: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = 0.3 + Math.random() * 0.4;
  const offset = Math.random() * Math.PI * 2;

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed + offset) * 0.5;
      ref.current.rotation.x += 0.005;
      ref.current.rotation.z += 0.003;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[scale, 1]} />
      <meshStandardMaterial
        color={color}
        wireframe
        transparent
        opacity={0.35}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} color="#7c3aed" intensity={3} distance={20} />
      <pointLight position={[5, 3, -5]} color="#06b6d4" intensity={2} distance={15} />
      <Stars radius={80} depth={60} count={5000} factor={4} saturation={0} fade speed={1} />
      <ParticleRing />
      <FloatingOrb position={[-4, 1, -3]} color="#7c3aed" scale={0.8} />
      <FloatingOrb position={[4, -1, -2]} color="#06b6d4" scale={0.6} />
      <FloatingOrb position={[0, 2.5, -4]} color="#f59e0b" scale={0.5} />
      <FloatingOrb position={[-3, -2, -2]} color="#f43f5e" scale={0.45} />
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function SplashScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
    </Canvas>
  );
}
