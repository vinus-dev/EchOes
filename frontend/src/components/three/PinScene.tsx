import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

function CrystalGrid() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime * 0.05;
      meshRef.current.rotation.y = clock.elapsedTime * 0.03;
      meshRef.current.rotation.z = clock.elapsedTime * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <octahedronGeometry args={[3, 2]} />
      <meshStandardMaterial
        color="#7c3aed"
        wireframe
        transparent
        opacity={0.15}
        emissive="#7c3aed"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function FloatingSparks() {
  const ref = useRef<THREE.Points>(null!);
  const count = 100;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#06b6d4" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export default function PinScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[2, 2, 2]} color="#06b6d4" intensity={1.5} />
      <pointLight position={[-2, -2, -2]} color="#7c3aed" intensity={1.5} />
      <Stars radius={50} depth={40} count={1000} factor={2} fade speed={0.5} />
      <CrystalGrid />
      <FloatingSparks />
    </Canvas>
  );
}
