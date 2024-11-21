import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const SpotlightComponent = ({ spotlight, scene }) => {
  const previousPosition = useRef(new THREE.Vector3());
  const accumulatedChange = useRef(0);

  useEffect(() => {
    if (!spotlight.current) return;

    const updateSpotlight = () => {
      const currentPosition = spotlight.current.position.clone();
      const velocity = new THREE.Vector3().subVectors(currentPosition, previousPosition.current);
      const speed = velocity.length();

      spotlight.current.angle = Math.PI / 8 + speed * 0.05;
      accumulatedChange.current += speed;
      spotlight.current.angle += accumulatedChange.current * 0.001;

      previousPosition.current.copy(currentPosition);
    };

    spotlight.current.addEventListener('change', updateSpotlight);

    return () => {
      spotlight.current.removeEventListener('change', updateSpotlight);
    };
  }, [spotlight]);

  return null;
};

export default SpotlightComponent;