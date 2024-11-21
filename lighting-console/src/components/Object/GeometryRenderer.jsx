import React, { Suspense, useRef, useEffect } from 'react';
import { Sphere, Cone, Torus, Box } from '@react-three/drei';
import GLTFModel from '../GLTFModelComponents';
import * as THREE from 'three';
const GeometryRenderer = ({ object, isSelected, onBoundsUpdate }) => {
  if (!object) return null;
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      const bbox = new THREE.Box3().setFromObject(meshRef.current);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      console.log(`GeometryRenderer (${object.id}) size:`, size);

      const dimensions = {
        width: size[0],
        height: size[1],
        depth: size[2]
      };

      onBoundsUpdate?.(dimensions);
    }
  }, [object]);

  const props = {
    position: object.position,
    scale: object.scale || [1, 1, 1],
    rotation: object.rotation || [0, 0, 0],
    userData: { id: object.id },
  };

  const materialProps = {
    color: isSelected ? 'red' : object.color,
  };

  return (
    <group ref={meshRef} userData={props.userData}>
      {(() => {
        switch (object.type) {
          case 'sphere':
            return (
              <Sphere {...props} castShadow receiveShadow>
                <meshStandardMaterial {...materialProps} />
              </Sphere>
            );
          case 'cone':
            return (
              <Cone {...props} castShadow receiveShadow>
                <meshStandardMaterial {...materialProps} />
              </Cone>
            );
          case 'torus':
            return (
              <Torus {...props} castShadow receiveShadow>
                <meshStandardMaterial {...materialProps} />
              </Torus>
            );
          default:
            return (
              <Box {...props} castShadow receiveShadow>
                <meshStandardMaterial {...materialProps} />
              </Box>
            );
        }
      })()}
    </group>
  );
};


export default GeometryRenderer;