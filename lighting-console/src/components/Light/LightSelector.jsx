import { useThree } from '@react-three/fiber';
import { useCallback, useEffect } from 'react';

function LightSelector({ onSelectLight, setEnableOrbit, selectedLight }) {
  const { raycaster, scene, camera, pointer, gl } = useThree();

  const handleClick = useCallback((event) => {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      if (hitObject.type === 'Mesh' && hitObject.parent?.children.some(child => child.isSpotLight)) {
        const lightGroup = hitObject.parent;
        const spotLight = lightGroup.children.find(child => child.isSpotLight);
        const actualIntensity = spotLight.intensity;
        const displayIntensity = actualIntensity / 31.8;
console.log("spotlight data", spotLight.userData.id)

        // Only deselect if clicking the same light
        if (selectedLight ) {
          console.log("selectedLightid",selectedLight.id)
          console.log('Light deselected');
          onSelectLight({
            id: null,
            position: [0, 0, 0],
            intensity: 0,
            actualIntensity: 0,
            color: '#000000',
            target: [0, 0, 0]
          });
          setEnableOrbit(true);
        } else {
          // Select the new light regardless of whether another light was previously selected
          console.log('Light selected', spotLight.userData.id);
          onSelectLight({
            id: spotLight.userData.id,
            position: lightGroup.position.toArray(),
            intensity: displayIntensity,
            actualIntensity: actualIntensity,
            color: '#' + spotLight.color.getHexString(),
            target: spotLight.target.position.toArray()
          });
          setEnableOrbit(false);
        }
      }
      
    } 
  }, [raycaster, scene, camera, pointer, onSelectLight, setEnableOrbit, selectedLight]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [handleClick, gl.domElement]);

  return null;
}

export default LightSelector;
