import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { motion } from "motion/react";

function Constellation() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create nodes
  const count = 50;
  const nodes = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
       data.push({
         position: new THREE.Vector3(
           (Math.random() - 0.5) * 20,
           (Math.random() - 0.5) * 20,
           (Math.random() - 0.5) * 20
         ),
         color: Math.random() > 0.5 ? '#9D94FF' : '#2DD4BF'
       });
    }
    return data;
  }, []);

  const linePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < count; i++) {
       for (let j = i + 1; j < count; j++) {
          if (nodes[i].position.distanceTo(nodes[j].position) < 5) {
             positions.push(
               nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
               nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
             );
          }
       }
    }
    return new Float32Array(positions);
  }, [nodes]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ))}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </lineSegments>
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden glass-card glow-purple border-t border-white/10 mt-6 relative z-0">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} className="absolute inset-0 bg-[#0A0A0B]/80">
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#9D94FF" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#2DD4BF" />
        <Constellation />
      </Canvas>

      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none text-center">
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
         >
           <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
             <span className="text-glow-purple">Keep building.</span><br />
             <span className="text-glow-teal">Keep growing.</span>
           </h1>
           <p className="text-lg md:text-xl text-var(--color-text-secondary) max-w-2xl mx-auto font-medium">
             The Kolkata Tech Network is a living breathing ecosystem. Scan the code to instantly join the constellation and find your peers.
           </p>
         </motion.div>
      </div>
    </div>
  );
}
