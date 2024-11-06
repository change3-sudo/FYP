import React, { useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import { Object3D, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import CustomVolSpotlight from './CustomVolSpotlight';
import * as THREE from 'three';

const Spot = forwardRef(({ color, position, focusPoint, intensity, id, ...props }, ref) => {
  const lightRef = useRef();
  const fixtureRef = useRef(); // Ref for the GLTF model
  const boxRef = useRef(); // Ref for the invisible box
  const { scene } = useThree();

  // Load the GLTF model
  const gltf = useLoader(GLTFLoader, './light.gltf');
  const staticTarget = useMemo(() => {
    const target = new Object3D();
    target.position.set(...focusPoint);
    scene.add(target);
    return target;
  }, [scene, focusPoint]);

  useImperativeHandle(ref, () => ({
    updateLight: ({ position, color, intensity }) => {
      if (lightRef.current) {
        if (position) lightRef.current.parent.position.set(...position);
        if (color) lightRef.current.color.set(color);
        if (intensity) lightRef.current.intensity = intensity;
      } else {
        console.error('燈光參考 (Light Reference) 尚未初始化！');
      }
      console.log("intensity sdas", intensity)
    }
  }));

  useEffect(() => () => scene.remove(staticTarget), [scene, staticTarget]);

  // Optional: Adjust the scale, position, or rotation of the GLTF model as needed
  const fixtureScale = [0.5, 0.5, 0.5]; // Adjust scale
  const fixturePosition = [0, 0, 0]; // Matches your original box geometry position
  const fixtureRotation = [0, 0, 0]; // Adjust rotation if needed
  const directionVector = new THREE.Vector3(0, -1, 0);

  // Assign a unique ID to the lightRef and boxRef
  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.userData.id = id;
    }
    if (boxRef.current) {
      boxRef.current.userData.id = id;
    }
  }, [id]);

  return (
    <group position={position}>
      <CustomVolSpotlight
        ref={lightRef}
        color={color}
        target={staticTarget}
        angle={0.20}
        penumbra={0.8}
        distance={6}
        intensity={intensity}
        {...props}
      />
      {/* Invisible box for raycasting */}
      <mesh
        ref={boxRef}
        geometry={new BoxGeometry(1, 1, 1)} // Adjust the size as needed
        position={[0, 0, 0]} // Centered with the GLTF model
        visible={false} // Make it invisible
        castShadow
      >
        <meshBasicMaterial transparent={true} opacity={0} />
      </mesh>
      {/* Render the GLTF model, positioned based on the spot's position */}
      <mesh
        ref={fixtureRef}
        scale={fixtureScale}
        position={fixturePosition}
        rotation={fixtureRotation}
        castShadow
      >
        <primitive object={gltf.scene.clone()} />
      </mesh>
      <primitive object={staticTarget} />
    </group>
  );
});

export default Spot;
