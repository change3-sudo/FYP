// utils/calculateCentralPosition.js
export const calculateCentralPosition = (selectedLights) => {
    if (!selectedLights.length) return [0, 0, 0];
  
    const sum = selectedLights.reduce(
      (acc, light) => {
        acc.x += light.position[0];
        acc.y += light.position[1];
        acc.z += light.position[2];
        return acc;
      },
      { x: 0, y: 0, z: 0 }
    );
  
    const count = selectedLights.length;
    return [sum.x / count, sum.y / count, sum.z / count];
  };
  