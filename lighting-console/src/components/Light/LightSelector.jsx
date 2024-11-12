import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useState } from 'react';

function LightSelector({ onSelectLight, setSelectedLightStack, setEnableOrbit, selectedLightStack }) {
  const { raycaster, scene, camera, pointer, gl } = useThree();

  const handleClick = useCallback((event) => {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      if (hitObject.type === 'Mesh' && hitObject.parent?.children.some(child => child.isSpotLight)) {
        const lightGroup = hitObject.parent;
        const spotLight = lightGroup.children.find(child => child.isSpotLight);
        const hitObjectId = hitObject.userData.id;
        const actualIntensity = spotLight.intensity;
        const displayIntensity = actualIntensity / 31.8;
  
        setSelectedLightStack(prevStack => {
          const stack = Array.isArray(prevStack) ? prevStack : [];
          const index = stack.indexOf(hitObjectId);
  
          if (index !== -1) {
            // Deselect the light if it's already selected
            console.log('Light deselected:', hitObjectId);
            setEnableOrbit(true);
            return stack.filter(id => id !== hitObjectId);
          } else {
            // Select the light
            console.log('Light selected:', hitObjectId);
            onSelectLight({
              id: hitObjectId,
              position: lightGroup.position.toArray(),
              intensity: displayIntensity,
              actualIntensity: actualIntensity,
              color: '#' + spotLight.color.getHexString(),
              target: spotLight.target.position.toArray()
            });
  
            // Ensure orbit is disabled when a new light is selected
            setEnableOrbit(false);
  
            // Only keep the current selected light in the stack
            return [hitObjectId];
          }
        });
      }
    }
  }, [raycaster, scene, camera, pointer, onSelectLight, setEnableOrbit]);
  
  

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [handleClick, gl.domElement]);

  return null;
}

export default LightSelector;
