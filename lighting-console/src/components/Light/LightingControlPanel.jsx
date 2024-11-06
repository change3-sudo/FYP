import React from 'react';
import { useThree } from '@react-three/fiber';

export default function LightControlPanel({ lightRef }) {
  const { scene } = useThree();

  const handleColorChange = (event) => {
    const light = lightRef.current;
    light.color.set(event.target.value);
  };

  const handleIntensityChange = (event) => {
    const light = lightRef.current;
    light.intensity = parseFloat(event.target.value);
  };

  const handlePositionChange = (axis, value) => {
    const light = lightRef.current;
    light.position[axis] = parseFloat(value);
  };

  return (
    <div className="light-control-panel">
      <input type="color" onChange={handleColorChange} defaultValue="#ffffff" />
      <input type="range" min="0" max="1000" step="10" onChange={handleIntensityChange} defaultValue="500" />
      {['x', 'y', 'z'].map((axis) => (
        <input key={axis} type="number" step="0.1" onChange={(e) => handlePositionChange(axis, e.target.value)} defaultValue="0" />
      ))}
    </div>
  );
}