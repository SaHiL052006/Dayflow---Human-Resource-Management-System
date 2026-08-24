import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

// 1. Refined Ambient Wireframe Geometries
const AmbientWireframeMesh = () => {
  const mesh1Ref = useRef();
  const mesh2Ref = useRef();
  const mesh3Ref = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (mesh1Ref.current) {
      mesh1Ref.current.rotation.x += delta * 0.08;
      mesh1Ref.current.rotation.y += delta * 0.12;
    }
    if (mesh2Ref.current) {
      mesh2Ref.current.rotation.y -= delta * 0.09;
      mesh2Ref.current.rotation.z += delta * 0.07;
    }
    if (mesh3Ref.current) {
      mesh3Ref.current.rotation.z += delta * 0.06;
      mesh3Ref.current.rotation.x -= delta * 0.05;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.04;
      ringRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group>
      {/* Central Ambient Wireframe Octahedron */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={mesh1Ref} position={[0, 0, 0]} scale={2.0}>
          <octahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#64748B"
            wireframe={true}
            transparent={true}
            opacity={0.45}
            roughness={0.7}
          />
        </mesh>
      </Float>

      {/* Primary Kinetic Orbit Ring */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh ref={mesh2Ref} position={[0, 0, 0]} scale={2.8}>
          <torusGeometry args={[1, 0.018, 16, 80]} />
          <meshStandardMaterial
            color="#94A3B8"
            transparent={true}
            opacity={0.5}
            roughness={0.6}
          />
        </mesh>
      </Float>

      {/* Secondary Outer Gimbal Ring */}
      <Float speed={0.9} rotationIntensity={0.25} floatIntensity={0.35}>
        <mesh ref={ringRef} position={[0, 0, 0]} scale={3.4}>
          <torusGeometry args={[1, 0.012, 16, 80]} />
          <meshStandardMaterial
            color="#CBD5E1"
            transparent={true}
            opacity={0.35}
            roughness={0.8}
          />
        </mesh>
      </Float>

      {/* Floating Low-Poly Geometric Node (Right) */}
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh ref={mesh3Ref} position={[2.5, 1.3, -0.8]} scale={0.75}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#94A3B8"
            wireframe={true}
            transparent={true}
            opacity={0.35}
          />
        </mesh>
      </Float>

      {/* Second Floating Geometric Node (Left) */}
      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[-2.6, -1.1, -0.8]} scale={0.65}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#94A3B8"
            wireframe={true}
            transparent={true}
            opacity={0.32}
          />
        </mesh>
      </Float>
    </group>
  );
};

// 2. Soft Ambient Particles Dust
const AmbientDustParticles = ({ isMobile }) => {
  const count = isMobile ? 14 : 28;
  const particles = React.useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 6,
        z: (Math.random() - 0.5) * 4,
        size: Math.random() * 0.035 + 0.018,
        speed: Math.random() * 0.6 + 0.4,
      });
    }
    return list;
  }, [count]);

  return (
    <group>
      {particles.map((p, idx) => (
        <Float key={idx} speed={p.speed} floatIntensity={0.6}>
          <mesh position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[p.size, 6, 6]} />
            <meshBasicMaterial color="#64748B" transparent={true} opacity={0.35} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// 3. Fallback Art when WebGL is unavailable
const FallbackBackground = () => (
  <div className="w-full h-full bg-radial-gradient from-slate-100 to-[#FAFAFA]" />
);

/**
 * Minimal Grayscale 3D Scene rendered quietly in the background
 */
export const Dayflow3DScene = () => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (!hasWebGL) {
    return <FallbackBackground />;
  }

  return (
    <div className="w-full h-full pointer-events-none select-none">
      <Suspense fallback={<FallbackBackground />}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          dpr={[1, 1.5]}
          className="w-full h-full"
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 8, 5]} intensity={0.7} color="#F8FAFC" />
          <directionalLight position={[-5, -5, -5]} intensity={0.4} color="#CBD5E1" />
          <AmbientWireframeMesh />
          <AmbientDustParticles isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Dayflow3DScene;
