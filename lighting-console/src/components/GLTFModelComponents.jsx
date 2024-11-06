import React from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// GLTFModel component
function GLTFModel ({ buffer, ...props }) {
  const gltf = useLoader(GLTFLoader, buffer);
  return <primitive object={gltf.scene} {...props} />;
};

export default GLTFModel


