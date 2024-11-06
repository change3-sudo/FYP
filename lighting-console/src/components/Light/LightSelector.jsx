import { useThree } from '@react-three/fiber';
import { useCallback, useEffect , useState} from 'react';

function LightSelector({ onSelectLight, setSelectedLightid, setEnableOrbit, selectedLight, selectedLightid }) {
  const { raycaster, scene, camera, pointer, gl } = useThree();
  const [lastSelectedLightId, setLastSelectedLightId] = useState(null);
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
      // Use hitObject's userData.id for selection logic
      if (selectedLightid) {
        // Select the new light
        if (lastSelectedLightId === hitObjectId) {
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
          setLastSelectedLightId(null);}else{
        console.log('Light selected', hitObject.userData.id);
        onSelectLight({
          id: hitObject.userData.id,
          position: lightGroup.position.toArray(),
          intensity: displayIntensity,
          actualIntensity: actualIntensity,
          color: '#' + spotLight.color.getHexString(),
          target: spotLight.target.position.toArray()
        });
        setEnableOrbit(false);
        setLastSelectedLightId(hitObjectId);
      }

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
