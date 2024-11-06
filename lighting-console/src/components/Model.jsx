import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'

function Model1(props) {
  const groupRef = useRef()
  const { nodes, materials } = useGLTF('/light.gltf')
  return (
    <group ref={groupRef} {...props} dispose={null}>
      <mesh castShadow receiveShadow geometry={nodes.Curve007_1.geometry} material={materials['Material.001']} />
      <mesh castShadow receiveShadow geometry={nodes.Curve007_2.geometry} material={materials['Material.002']} />
    </group>
  )
}

useGLTF.preload('/light.gltf')


export default function Model() {
  return (
    <div >
     <Model1/>
    </div>
  )
}