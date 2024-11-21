import { Vector3 } from 'three'
import React, { useMemo } from 'react'
import { Plane, Box } from '@react-three/drei'
import * as THREE from 'three'

function Scene() {
  const boxes = useMemo(() => {
    const positions = [
      [0, 3, 0],
      [2, 3, 0],
      [1, 3, 0],
      [-1, 3, 0],
      [-2, 3, 0],
      [-3, 3, 0],
      [3, 3, 0]
    ];

    return positions.map((pos, index) => (
      <Box 
        key={index}
        position={pos} 
        scale={[0.5, 0.5, 0.5]} 
        castShadow 
        receiveShadow
      >
        <meshStandardMaterial 
          color="orange" 
          side={THREE.FrontSide}
        />
      </Box>
    ));
  }, []);

  const lights = useMemo(() => (
    <>
      <ambientLight intensity={0.2} />
      <pointLight
        position={[5, 10, 5]}
        intensity={8}
        color="white"
        castShadow
        shadow-mapSize-width={128}
        shadow-mapSize-height={128}
      />
      <pointLight
        position={[-5, 5, 5]}
        intensity={2}
        color="lightblue"
        shadow-mapSize-width={128}
        shadow-mapSize-height={128}
      />
      <pointLight
        position={[0, 10, -10]}
        intensity={3}
        color="lightyellow"
        shadow-mapSize-width={128}
        shadow-mapSize-height={128}
      />
      
    </>
  ), []);

  const ground = useMemo(() => (
    <Plane
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0, 0]}
      args={[1000, 1000]}
    >
      <meshStandardMaterial 
        attach="material" 
        color="gray"
        roughness={1}
        metalness={0}
        side={THREE.FrontSide}
      />
    </Plane>
  ), []);

  return (
    <>
      {boxes}
      {lights}
      {ground}
      
      <mesh
        position={[0, 0.5, 0]}
        castShadow
        receiveShadow
      >
        <fog attach="fog" args={["white", 0, 40]} />
        <meshStandardMaterial 
          color="#000000"
          roughness={1}
          metalness={0}
          side={THREE.FrontSide}
        />
      </mesh>
    </>
  );
}

export default React.memo(Scene);