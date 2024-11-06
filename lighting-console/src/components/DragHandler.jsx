
import React from 'react';
import Axis from './Axis'; // Import the Axis component
import { usePosition } from './PositionContext';
function DragHandler({ selectedObject, objects, setEnableOrbit, updateObjects , dimensions }) {
  // Ensure that there is a selected object
  const { setPosition } = usePosition();
  if (selectedObject === null || !objects.find(obj => obj.id === selectedObject)) {
    return null;
  }


  const selectedObj = objects.find(obj => obj.id === selectedObject);
  const position = selectedObj?.position || [0, 0, 0];
console.log(position);
  console.log('Selected Object Dimensions:', dimensions);
  // Use passed dimensions instead of selectedObj.dimensions
  const x = position[0] - (dimensions?.width || 1) / 2;
  const y = position[1] - (dimensions?.height || 1) / 2;
  const z = position[2] + (dimensions?.depth || 1) / 2;
  // Assuming dimensions are available and position is the center
console.log(x,y,z);
  // This function handles the drag operation
  const handleDrag = (moveVector) => {
    // Calculate new position based on moveVector
    if (!position) return;
    const newPosition = [
      position[0] + moveVector.x,
      position[1] + moveVector.y,
      position[2] + moveVector.z,
    ];

    // Update objects with new position
    updateObjects(selectedObject, newPosition);
    setPosition(newPosition);
    console.log('Selected Object Position:', newPosition);  // Log the position of the selected object
  };

  return (
    <>
      <Axis
        axis="x"
        rotation={[0, 0, Math.PI / 2]}
        onDrag={handleDrag}
        objectPosition={[x+1.5, y, z]}
        setOrbitEnabled={setEnableOrbit}
      />
      <Axis
        axis="y"
        rotation={[0, 0, 0]}
        onDrag={handleDrag}
        objectPosition={[x, y+1.5, z]}
        setOrbitEnabled={setEnableOrbit}
      />
      <Axis
        axis="z"
        rotation={[Math.PI / 2, 0, 0]}
        onDrag={handleDrag}
        objectPosition={[x, y, z+1.5]}
        setOrbitEnabled={setEnableOrbit}
      />
    </>
  );
}

export default DragHandler;

