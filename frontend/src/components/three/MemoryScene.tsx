import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

// ─── Portal Ring ──────────────────────────────────────────────────────────────
function PortalRing({ revealed }: { revealed: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.z = t * 0.4;
      ref.current.scale.setScalar(revealed ? 1 + Math.sin(t * 1.5) * 0.04 : 0.8);
    }
    if (innerRef.current) {
      innerRef.current.rotation.z = -t * 0.6;
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <torusGeometry args={[2.8, 0.08, 16, 120]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={revealed ? 2 : 0.5}
          transparent
          opacity={revealed ? 0.95 : 0.4}
        />
      </mesh>
      <mesh ref={innerRef}>
        <torusGeometry args={[2.2, 0.04, 16, 100]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={revealed ? 1.5 : 0.3}
          transparent
          opacity={revealed ? 0.8 : 0.3}
        />
      </mesh>
    </group>
  );
}

// ─── Burst Particles ──────────────────────────────────────────────────────────
function BurstParticles({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 300;

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.05 + Math.random() * 0.1;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i * 3 + 2] = Math.cos(phi) * speed;
    }
    return { positions, velocities };
  }, []);

  useFrame(() => {
    if (!ref.current || !active) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} visible={active}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#f59e0b" transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function MemorySceneInner({ revealed }: { revealed: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 3]} color="#7c3aed" intensity={revealed ? 4 : 1} />
      <pointLight position={[3, 2, -2]} color="#06b6d4" intensity={2} />
      <Stars radius={60} depth={50} count={4000} factor={3} fade speed={0.8} />
      <PortalRing revealed={revealed} />
      <BurstParticles active={revealed} />
    </>
  );
}

export default function MemoryScene({ revealed = false }: { revealed?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <MemorySceneInner revealed={revealed} />
    </Canvas>
  );
}
