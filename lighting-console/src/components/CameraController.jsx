import React from 'react';
import { useThree, useFrame } from '@react-three/fiber';

function CameraController() {
    const { camera } = useThree();
    const saveObjectToDatabase = async (object) => {
      const response = await fetch('/api/objects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(object),
      });
      return response.json(); // Assuming the backend responds with the stored object
    };
    useFrame(() => {
      // Example: Prevent the camera from moving below the y = 0 plane
      if (camera.position.y < 1) {
        camera.position.y = 1;
      }
    });
  
    return null; // This component does not render anything itself
  }

export default CameraController;