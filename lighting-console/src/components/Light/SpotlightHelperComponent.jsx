// SpotLightHelperComponent.js
import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { SpotLightHelper } from 'three';
import * as THREE from 'three';

const SpotLightHelperComponent = ({ lightRef, color }) => {
  const helperRef = useRef();
  const { scene } = useThree();

  useEffect(() => {
    if (!lightRef.current) return;

    // Create a new SpotLightHelper
    helperRef.current = new SpotLightHelper(lightRef.current, color);

    // Add the helper to the scene
    scene.add(helperRef.current);

    // Update the helper when the light changes
    const updateHelper = () => {
      if (helperRef.current) {
        helperRef.current.update();
      }
    };

    // Listen for changes to the light's properties
    lightRef.current.addEventListener('change', updateHelper);

    // Clean up on component unmount
    return () => {
      if (helperRef.current) {
        scene.remove(helperRef.current);
        helperRef.current.dispose();
      }
      if (lightRef.current) {
        lightRef.current.removeEventListener('change', updateHelper);
      }
    };
  }, [lightRef, scene, color]);

  return null;
};

export default SpotLightHelperComponent;
