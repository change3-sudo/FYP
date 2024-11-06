import React, { Suspense, useRef, useEffect } from 'react';
import { Sphere, Cone, Torus, Box } from '@react-three/drei';
import GLTFModel from '../GLTFModelComponents';
import * as THREE from 'three';
const GeometryRenderer = ({ object , isSelected,  onBoundsUpdate}) => {
  if (!object) return null;
    const meshRef = useRef();

    useEffect(() => {
      if (meshRef.current) {
        const bbox = new THREE.Box3().setFromObject(meshRef.current);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        
        // Calculate dimensions based on the scale and bounding box
        const dimensions = {
          width: size.x , // Multiply by scale
          height: size.y ,
          depth: size.z
        };
        
        onBoundsUpdate?.(dimensions);
      }
    }, [object]);
  const props = {
    position: object.position,
    scale: object.scale || [1, 1, 1],
    rotation: object.rotation,
    userData: { id: object.id },
  };
  const materialProps = {
    color: isSelected ? 'red' : object.color, // Highlight if selected
  };
  return (
    <group ref={meshRef} key={object.key} userData={props.userData}>
      {(() => {
        switch (object.type) {

          case 'sphere':
            return <Sphere {...props}><meshStandardMaterial  {...materialProps} color={object.color} /></Sphere>;
          case 'cone':
            return <Cone {...props}><meshStandardMaterial {...materialProps} color={object.color} /></Cone>;
          case 'torus':
            return <Torus {...props}><meshStandardMaterial {...materialProps} color={object.color} /></Torus>;
          default:
            return <Box {...props}><meshStandardMaterial  {...materialProps} color={object.color} /></Box>;
        }
      })()}
    </group>
  );
};

export default GeometryRenderer;