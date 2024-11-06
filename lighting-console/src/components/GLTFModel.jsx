// GLTFModel.js
import React, { useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useThree } from '@react-three/fiber';

const GLTFModel = ({ url }) => {
  const ref = useRef();
  const { scene } = useThree();

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      ref.current = gltf.scene;
      scene.add(gltf.scene);
    });

    return () => {
      scene.remove(ref.current);
    };
  }, [url, scene]);

  return null; // This component doesn't render anything itself; it just adds to the scene
};

export default GLTFModel;