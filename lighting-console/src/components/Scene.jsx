import { Vector3 } from 'three'
import React from 'react'
import Spot  from './Light/Spot' // Assuming Spot is in a separate file
import * as THREE from 'three'
import { useGLTF, SpotLight, useDepthBuffer, Plane,Box,Sphere, Cone, Torus,  OrbitControls, PerspectiveCamera, TransformControls  } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
function Scene() {
  // const gltf = useLoader(GLTFLoader, '/Poimandres.gltf')


    return (
      <>
 {/* <primitive object={gltf.scene} /> */}


        <Plane
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0, 0]}
          args={[1000, 1000]}
          
        >
          <meshStandardMaterial attach="material" color= "#4d4c4c" />
        </Plane>
        <mesh
          position={[0, 0.5, 0]}
          castShadow
        receiveShadow
        >
          <fog attach="fog" args={["white", 0, 40]} />
    
          <meshStandardMaterial color="000000" />
        </mesh>
      </>
    )
  }

export default Scene