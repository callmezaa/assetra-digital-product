'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'

function FloatingShapes() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { mouse } = useThree()

  useFrame((state) => {
    if (!meshRef.current) return
    
    // Smoothly follow mouse with slight delay
    const targetX = mouse.x * 1.5
    const targetY = mouse.y * 1.5
    
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.03)
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.03)
    
    // Subtle rotation using elapsed time from state
    const t = state.clock.elapsedTime
    meshRef.current.rotation.x = t * 0.15
    meshRef.current.rotation.y = t * 0.2
  })

  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2.5}>
        <Sphere ref={meshRef} args={[1.2, 128, 128]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#3b82f6"
            attach="material"
            distort={0.45}
            speed={1.5}
            roughness={0.1}
            metalness={1}
            emissive="#1d4ed8"
            emissiveIntensity={0.2}
          />
        </Sphere>
      </Float>
      
      {/* Background ambient shapes */}
      <Float speed={1.2} position={[4, 2.5, -4]}>
        <mesh>
          <torusKnotGeometry args={[0.6, 0.2, 128, 16]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.1} metalness={0.9} emissive="#6d28d9" emissiveIntensity={0.2} />
        </mesh>
      </Float>

      <Float speed={1.8} position={[-5, -2, -5]}>
        <mesh>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#ec4899" roughness={0.1} metalness={0.9} emissive="#be185d" emissiveIntensity={0.2} />
        </mesh>
      </Float>
    </group>
  )
}

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 -z-10 opacity-70 dark:opacity-50 overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[-10, 20, 10]} angle={0.2} penumbra={1} intensity={2} />
        <FloatingShapes />
      </Canvas>
    </div>
  )
}
