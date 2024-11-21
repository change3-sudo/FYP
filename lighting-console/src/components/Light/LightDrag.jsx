import React, { useCallback,useState,useEffect } from 'react';
import LightAxis from './LightAxis';
import * as THREE from 'three';
import { usePosition } from '../PositionContext';

const LightDrag = React.memo(({ 
  selectedLightStack, 
  onUpdateLight, 
  setEnableOrbit,
  setSelectedLightStack ,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState([]);

  useEffect(() => {
    if (selectedLightStack && selectedLightStack.length > 0) {
      const firstLightPosition = selectedLightStack[0]?.position || [0, 0, 0];
      console.log('Selected light position:', firstLightPosition);
      setCurrentPosition(firstLightPosition);
    } else {
      setCurrentPosition([0, 0, 0]);
    }
  }, [selectedLightStack]);

  const handleDrag = useCallback((movement) => {
    if (!selectedLightStack || selectedLightStack.length === 0) return;
    setEnableOrbit(false);

    const basePosition = selectedLightStack[0]?.position || [0, 0, 0];

    const newPosition = [
      basePosition[0] + movement.x,
      basePosition[1] + movement.y,
      basePosition[2] + movement.z
    ];

    const updatedLightStack = [...selectedLightStack];
    updatedLightStack[0] = { ...updatedLightStack[0], position: newPosition };

    setCurrentPosition(newPosition);
    setSelectedLightStack(updatedLightStack);

    onUpdateLight(updatedLightStack[0].id, {
      type: 'position',
      value: newPosition
    });
  }, [onUpdateLight, selectedLightStack, setEnableOrbit]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setEnableOrbit(true);

  }, [setEnableOrbit]);

  useEffect(() => {
    console.log('Rendering LightDrag with position:', currentPosition);
  }, [currentPosition]);

  if (!selectedLightStack || selectedLightStack.length === 0) {
    console.log('selectedLightStack:', selectedLightStack);
    return null;
  }

  return (
    <group>
      <LightAxis
        axis="x"
        rotation={[0, 0, Math.PI / 2]}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        objectPosition={[currentPosition[0] + 1.5, currentPosition[1], currentPosition[2]]}
        color="#FF0000"
      />
      <LightAxis
        axis="y"
        rotation={[0, 0, 0]}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        objectPosition={[currentPosition[0], currentPosition[1] + 1.5, currentPosition[2]]}
        color="#00FF00"
      />
      <LightAxis
        axis="z"
        rotation={[Math.PI / 2, 0, 0]}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        objectPosition={[currentPosition[0], currentPosition[1], currentPosition[2] + 1.5]}
        color="#0000FF"
      />
    </group>
  );
});

export default LightDrag;
