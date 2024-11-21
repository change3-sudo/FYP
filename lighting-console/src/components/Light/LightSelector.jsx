import React, { useCallback,useState,useEffect } from 'react';
import { useThree } from '@react-three/fiber';

const LightSelector = React.memo(({ onSelectLight, setSelectedLightStack, setEnableOrbit, selectedLightStack, updateSelectedLightPositions }) => {
  const { raycaster, scene, camera, pointer, gl } = useThree();
  const [hoveringIds, setHoveringIds] = useState([]);

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
          const index = stack.findIndex(entry => entry.id === hitObjectId);
        
          if (index !== -1) {
            console.log('Light deselected:', hitObjectId);
            const newStack = stack.filter(entry => entry.id !== hitObjectId);
            setHoveringIds(newStack); // Update hover state
            updateSelectedLightPositions(prevPositions =>
              prevPositions.filter(entry => entry.id !== hitObjectId)
            );
            return newStack;
          } else {
            onSelectLight({
              id: hitObjectId,
              position: lightGroup.position.toArray(),
              intensity: displayIntensity,
              actualIntensity: actualIntensity,
              color: '#' + spotLight.color.getHexString(),
              target: spotLight.target.position.toArray(),
              isHovered: true // Set to hovered
            });
            const newEntry = { id: hitObjectId, position: lightGroup.position.toArray() };
            const newStack = [...stack, newEntry]; // Add new entry
            
            updateSelectedLightPositions(prevPositions => {
              // Check if the light is already in the list
              const positionExists = prevPositions.some(entry => entry.id === hitObjectId);
              if (!positionExists) {
                return [...prevPositions, newEntry];
              }
              return prevPositions;
            });
        
            setHoveringIds(newStack);
            return newStack;
          }
        });
        
      } else {
        // Handle clicks outside of lights here
        console.log('Clicked outside of lights');
        setEnableOrbit(true);
      }
    } 
  }, [raycaster, scene, camera, pointer, onSelectLight, setEnableOrbit, updateSelectedLightPositions]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [gl, handleClick]);

  useEffect(() => {
    console.log("Hovered Lights:", hoveringIds);
  }, [hoveringIds]);

  useEffect(() => {
    console.log("Selected Light Stack:", selectedLightStack);
  }, [selectedLightStack]);

  return null;
});

export default LightSelector;
