import React, { useState, useEffect, useCallback } from 'react';
import Axis from './Axis';
import { usePosition } from './PositionContext';

const LightDrag = React.memo(({ lightStack, selectedLight, onUpdateLight }) => {
  const { setPosition } = usePosition();
  const [currentPosition, setCurrentPosition] = useState([0, 0, 0]);

  useEffect(() => {
    if (selectedLight && selectedLight.position) {
      setCurrentPosition(selectedLight.position);
      setPosition(selectedLight.position);
    }
  }, [selectedLight, setPosition]);

  const handleDrag = useCallback((moveVector) => {
    if (!selectedLight || !selectedLight.id) return;
    const newPosition = [
      currentPosition[0] + moveVector.x,
      currentPosition[1] + moveVector.y,
      currentPosition[2] + moveVector.z,
    ];
    setCurrentPosition(newPosition);
    setPosition(newPosition);
    onUpdateLight(selectedLight.id, { type: 'position', value: newPosition });
    console.log('Selected Object Position:', newPosition);
  }, [currentPosition, selectedLight, setPosition, onUpdateLight]);

  if (!selectedLight || !selectedLight.id) {
    return null; // Render nothing if no light is selected
  }

  return (
    <>
      <Axis
        axis="x"
        rotation={[0, 0, Math.PI / 2]}
        onDrag={handleDrag}
        objectPosition={[currentPosition[0] + 1.5, currentPosition[1], currentPosition[2]]}
      />
      <Axis
        axis="y"
        rotation={[0, 0, 0]}
        onDrag={handleDrag}
        objectPosition={[currentPosition[0], currentPosition[1] + 1.5, currentPosition[2]]}
      />
      <Axis
        axis="z"
        rotation={[Math.PI / 2, 0, 0]}
        onDrag={handleDrag}
        objectPosition={[currentPosition[0], currentPosition[1], currentPosition[2] + 1.5]}
      />
    </>
  );
});

export default LightDrag;
