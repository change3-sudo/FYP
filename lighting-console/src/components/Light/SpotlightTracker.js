// SpotlightTracker.js
import { useEffect } from 'react';
import * as THREE from 'three';

const SpotlightTracker = ({ spotlightRef, targetPoint }) => {
  useEffect(() => {
    if (!spotlightRef.current) return;

    const updateSpotlight = () => {
      // Calculate the direction vector from spotlight to target point
      const direction = new THREE.Vector3().subVectors(targetPoint, spotlightRef.current.position).normalize();

      // Set the spotlight's target position
      spotlightRef.current.target.position.copy(targetPoint);

      // Adjust the spotlight's angle and other parameters as needed
      spotlightRef.current.angle = Math.PI / 8; // Example angle
      spotlightRef.current.penumbra = 0.1; // Example penumbra

      // Update the spotlight's direction
      spotlightRef.current.target.updateMatrixWorld();
      spotlightRef.current.lookAt(targetPoint);
    };

    // Call the update function initially and on each render
    updateSpotlight();

    // Optionally, listen for changes to the spotlight's position or target
    spotlightRef.current.addEventListener('change', updateSpotlight);

    return () => {
      spotlightRef.current.removeEventListener('change', updateSpotlight);
    };
  }, [spotlightRef, targetPoint]);

  return null;
};

export default SpotlightTracker;
