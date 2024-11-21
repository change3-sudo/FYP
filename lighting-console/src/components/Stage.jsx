import React, { useRef, useEffect,useMemo, useState, useCallback, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import './styles.css';
import LightDrag from './Light/LightDrag'
import { ShaderMaterial, WebGLRenderer } from 'three';
// Three.js imports
import { Vector3, Vector2, Raycaster } from 'three';
import * as THREE from 'three';
import { Environment } from '@react-three/drei'

// 在場景中添加



// Local component imports
import AddObject from './Object/AddObject';
import EditBar from './EditBar';
import ObjectSelector from './Object/ObjectSelector';
import CameraController from './CameraController';
import GeometryRenderer from './Object/GeometryRenderer';
import ModelLoader from './ModelLoader';
import Scene from './Scene';
import AddLight from './Light/AddLight';
import LightRenderer from './Light/LightRenderer';
import LightSelector from './Light/LightSelector';
import DragHandler from './DragHandler';
import { v4 as uuidv4 } from 'uuid';
import CueMode from './Cue/CueMode'

// Utility function for initializing WebGPU


// PreloadedModel component
function PreloadedModel({ url, enableShadows }) {
  const gltf = useLoader(GLTFLoader, url);

  // Traverse the model and enable receiveShadow on all meshes if enableShadows is true
  React.useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = enableShadows; // 根据 enableShadows 属性启用接收阴影
      }
    });
  }, [gltf, enableShadows]); // 添加 enableShadows 作为依赖项

  return <primitive object={gltf.scene} scale={0.75} />;
}

const LightGroup = React.memo(({ onUpdateLight, isHovered, onFixtureIdChange, setIsHovered, setEnableOrbit, selectedLightStack, setSelectedLightStack, lightStack, selectedLight, currentChannel, isChannelSubmitted }) => {
  return (
    <group>
      {lightStack.map(light => (
        <LightRenderer
          key={light.id}
          light={light}
          onFixtureIdChange={onFixtureIdChange}
          selectedLightStack={selectedLightStack}
          isSelected={selectedLight === light.id}
          isChannelSubmitted={isChannelSubmitted}
          currentChannel={currentChannel}
          isHovered={isHovered}
          setIsHovered={setIsHovered}
        />
      ))}
      <LightDrag
        selectedLightStack={selectedLightStack}
        onUpdateLight={onUpdateLight}
        setEnableOrbit={setEnableOrbit}
        setSelectedLightStack={setSelectedLightStack}
      />
    </group>
  );
});


const ObjectGroup = React.memo(({ objects, selectedObject, setEnableOrbit, updateObjects, objectDimensions }) => {

  return (

    <group>
      {objects.map(obj => (
        <GeometryRenderer
          key={obj.id}
          object={obj}
          isSelected={selectedObject === obj.id}
          onBoundsUpdate={dimensions => updateObjects(obj.id, { type: 'dimensions', value: dimensions })}
        />
      ))}
      {selectedObject && objects.find(obj => obj.id === selectedObject) && (
        <DragHandler
          selectedObject={selectedObject}
          objects={objects}
          setEnableOrbit={setEnableOrbit}
          updateObjects={updateObjects}
          dimensions={objectDimensions}
        />
      )}
    </group>
  );
});

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform vec3 ambientLightColor; // 环境光颜色
  uniform float ambientIntensity; // 环境光强度

  void main() {
    vec3 ambient = ambientLightColor * ambientIntensity; // 计算环境光
    gl_FragColor = vec4(ambient, 1.0);
  }
`;

// 创建自定义环境光材质
const AmbientLightMaterial = new ShaderMaterial({
  uniforms: {
    ambientLightColor: { value: new THREE.Color(1.0, 1.0, 1.0) }, // 白色环境光
    ambientIntensity: { value: 0.5 } // 环境光强度
  },
  vertexShader,
  fragmentShader,
});

// Main Stage component
export default function Stage() {
  const [fixtureId, setFixtureId] = useState(null);
  const handleFixtureIdChange = (id) => {
    setFixtureId(id);
  };
  // all units
 
  const [units, setUnits] = useState(() => {
    const savedObjects = localStorage.getItem('threeObjects');
    if (savedObjects) {
    const parsedObjects = JSON.parse(savedObjects).map(obj => ({
    ...obj,
    id: parseInt(obj.id)
    }));
    return parsedObjects;
    }
    return [];
    });
  const [objectDimensions, setObjectDimensions] = useState({});
  const [selectedObject, setSelectedObject] = useState(null);


// All lights
const [lightStack, setLightStack] = useState([

  {
    position: [5, 5, 0],
    color: 'red',
    intensity: 0.7,
    id: 'light-2',
  },

]);  const [selectedLightStack, setSelectedLightStack] = useState([]);
  const [selectedLightStackPos, setSelectedLightStackPos] = useState([
    [], // 存储灯光信息的数组
    [0, 0, 0] // 默认位置
  ]);
  const [isChannelSubmitted, setIsChannelSubmitted] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null); // New state for channel
  const [isHovered, setIsHovered] = useState(false);

// Function to update the selected light positions
const updateSelectedLightPositions = useCallback((positions) => {
  // Directly set the new array of objects
  setSelectedLightStackPos(positions);
}, []);

// Effect to log changes to the state



  const handleClick = useCallback(() => {
    setIsHovered(selectedLightStack.length > 0);
  }, [selectedLightStack, setIsHovered]);
  
  //cue
  const [cues, setCues] = useState([]);
  const [highlightedCueIndex, setHighlightedCueIndex] = useState(-1);
// All objects
  

  const [currentCueIndex, setCurrentCueIndex] = useState(-1);
  const [modelUrl, setModelUrl] = useState('/untitled.gltf');
  const [renderer, setRenderer] = useState(null);
  const [isButtonsVisible, setIsButtonsVisible] = useState(false);
  const [isCueControlVisible, setIsCueControlVisible] = useState(false);
  const [isLightControlVisible, setIsLightControlVisible] = useState(false);
    const [camera, setCamera] = useState(null);
  const [orbitEnabled, setEnableOrbit] = useState(true);
  const canvasRef = useRef();

  const toggleButtonsVisibility = useCallback(() => {
    setIsButtonsVisible(prev => !prev);
    setIsCueControlVisible(false);
    setIsLightControlVisible(false);
  }, []);


  //Object functions
  const updateObjects = useCallback((id, update) => {
    setUnits(prevObjects => {
      // Check if the update would actually change anything
      const objectToUpdate = prevObjects.find(obj => obj.id === id);
      if (!objectToUpdate) return prevObjects;
  
      if (update.type === 'dimensions') {
        const currentDimensions = objectToUpdate.dimensions || {};
        const newDimensions = update.value;
        if (JSON.stringify(currentDimensions) === JSON.stringify(newDimensions)) {
          return prevObjects; // Skip update if dimensions haven't changed
        }
      }
  
      return prevObjects.map(obj => {
        if (obj.id === id) {
          return update.type 
            ? { ...obj, [update.type]: update.value }
            : { ...obj, position: update };
        }
        return obj;
      });
    });
    
  }, []);
  

  const handleObjectAdd = useCallback((geometry, color, worldSpace) => {
    const newObject = {
      id: Math.random(),
      type: geometry,
      color: color,
      position: [
        Math.random() * 10 - 5,
        Math.random() * 10 + 5,
        Math.random() * 10 - 5
      ],
      rotation: [0, 0, 0],
      scale:  [1, 1, 1]
    };
    setUnits(prevObjects => [...prevObjects, newObject]);

  }, []);



  const handleBoundsUpdate = useCallback((dimensions) => {
    setObjectDimensions(dimensions);
  }, []);


  const handleLightAdd = useCallback((id,intensity, color, channel, position,isHovered) => {
    const randomPosition = [Math.random() * 10 - 5, 5, 0];
    const newLight = {
      id: id,
      type: 'spotLight',
      position: randomPosition,
      color: color,
      intensity: intensity,
      channel: currentChannel,
      focusPoint: [randomPosition[0], 0, randomPosition[2]],
      isHovered: isHovered
    };

    setLightStack(prevLights => [...prevLights, newLight]);
  }, [currentChannel, lightStack]);
  
  
  

  
  const onUpdateLight = useCallback((id, { type, value }) => {
    setLightStack(prevLights => {
      if (type === 'remove') {
        // Remove the light with the specified ID
        return prevLights.filter(light => light.id !== id);
      }
      // Update the light with the specified ID
      return prevLights.map(light =>
        light.id === id ? { ...light, [type]: value } : light
      );
    });
    if (type === 'channel') {
      setCurrentChannel(value); // Update the current channel state
      setIsChannelSubmitted(true);
    }
    if (type === 'remove') {
    }
  }, []);
  
  


  const toggleLightControl = useCallback(() => {
    setIsLightControlVisible(prev => !prev);
    setIsButtonsVisible(false);
    setIsCueControlVisible(false);
  }, []);
  const toggleCueControl = useCallback(() => {
    setIsCueControlVisible(prev => !prev);
    setIsButtonsVisible(false);
    setIsLightControlVisible(false);
  }, []);
  const handleCuesUpdate = useCallback((updatedCues) => {
    setCues(updatedCues);
  }, []);

  const goToNextCue = () => {
    setHighlightedCueIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % sortedCues.length;
      fadeToCue(nextIndex); // Call fadeToCue with the next index
      return nextIndex;
    });
  };
  
  const goToPreviousCue = () => {
    setHighlightedCueIndex((prevIndex) => {
      const prevIndexAdjusted = (prevIndex - 1 + sortedCues.length) % sortedCues.length;
      fadeToCue(prevIndexAdjusted); // Call fadeToCue with the previous index
      return prevIndexAdjusted;
    });
  };
  

  const extractCueNumber = (cueName) => {
    const match = cueName.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : null;
  };
  const sortedCues = [...cues].sort((a, b) => {
    const numA = extractCueNumber(a.name);
    const numB = extractCueNumber(b.name);
    return numA - numB;
  });
  const onCommand = useCallback((command) => {
    console.log(`Executing command: ${command}`);
    switch (command) {
      case 'record':
        console.log('Record');
        recordCue(5);
        // Add logic for recording
        break;
      case 'u':
        console.log('Update');
        // Add logic to update something
        break;
      case 'c':
        console.log('Copy to');
        copyCue(1,2) 
        // Add logic to copy something
        break;
      case 'g':
        console.log('Group');
        // Add logic to group items
        break;
      case 'q':
        console.log('Cue');
        // Add logic to handle cue
        break;
      case 'l':
        console.log('Label/Note');
        // Add logic to handle label or note
        break;
      case 'b':
        console.log('Block');
        // Add logic to block something
        break;
      case 'x':
        console.log('Cue only/Track');
        // Add logic for cue only or track
        break;
      case 'f':
        console.log('Full');
        // Add logic to set something to full
        break;
      case 'o':
        console.log('Out');
        // Add logic to go out
        break;
      default:
        if (command.startsWith('select light')) {
          const channelNumber = command.split(' ')[2];
          console.log(`Select light channel: ${channelNumber}`);
          // Example: Select light logic
        } else if (command.startsWith('adjust intensity')) {
          const parts = command.split(' ');
          const channelNumber = parts[2];
          const intensityValue = parts[4];
          console.log(`Adjust intensity of light channel ${channelNumber} to ${intensityValue}`);
          // Example: Adjust intensity logic
        }
        break;
    }
  }, [cues, lightStack]);


  const copyCue = (source, target) => {
    console.log(`Copying cue from ${source} to ${target}`);
    const sourceCue = cues.find(cue => extractCueNumber(cue.name) === source);
    console.log(sourceCue)
    if (sourceCue) {
      console.log(`Source cue found: ${sourceCue.name}`);
  
      // Create a new cue by copying the source cue's properties
      const newCue = {
        id: uuidv4(),
        name: `Cue ${target}`,
        lightState: [...sourceCue.lightState],
      };
  
      // Update the cues state with the new cue and capture the index
      setCues(prevCues => {
        const updatedCues = [...prevCues, newCue];
        console.log('Updated cues:', updatedCues);
  
        // Find the index of the newly added cue
        const newCueIndex = updatedCues.findIndex(cue => cue.id === newCue.id);
        console.log('New cue index:', newCueIndex);
  
        return updatedCues;
      });
    } else {
      console.error(`Source cue ${source} not found`);
    }
  };
  
  const handleSelectLight = (lightData) => {
    console.log('Light data received:', lightData);
    setIsHovered(lightData.isHovered)
      
      
    }
    // Perform additional actions with the selected light data
  
  const recordCue = useCallback((cueNumber) => {
    const currentLightsState = lightStack.map(light => ({
      id: light.id,
      position: light.position,
      intensity: light.intensity,
      color: light.color,
      focusPoint: light.focusPoint,
    }));
  
    // Use the provided cue number if available, otherwise default to auto-generated
    const cueName = `Cue ${cueNumber}`;
  
    const newCue = {
      id: uuidv4(),
      name: cueName,
      lightState: currentLightsState,
    };
  
    setCues(prevCues => {
      const updatedCues = [...prevCues, newCue];
      console.log('Updated cues:', updatedCues); // Log inside the callback
      return updatedCues;
    });
  
    console.log('Cue recorded:', newCue);
  }, [lightStack, cues]);

  const fadeToCue = (targetCueIndex, duration = 3000) => {
    const targetCue = cues[targetCueIndex];
    if (!targetCue) return; // Ensure the target cue exists
  
    const { lightState: targetLightState } = targetCue;
    const startTime = performance.now();
  
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // Calculate animation progress
  
      targetLightState.forEach(targetLight => {
        const currentLight = lightStack.find(light => light.id === targetLight.id);
        if (!currentLight) return;
  
        const interpolate = (start, end) => start + (end - start) * progress;
  
        const newPosition = [
          interpolate(currentLight.position[0], targetLight.position[0]),
          interpolate(currentLight.position[1], targetLight.position[1]),
          interpolate(currentLight.position[2], targetLight.position[2])
        ];
  
        const newIntensity = interpolate(currentLight.intensity, targetLight.intensity);
        // const newColor = interpolateColor(currentLight.color, targetLight.color, progress);
  
        // Update light properties
        onUpdateLight(targetLight.id, { type: 'position', value: newPosition });
        onUpdateLight(targetLight.id, { type: 'intensity', value: newIntensity });
        // onUpdateLight(targetLight.id, { type: 'color', value: newColor });
      });
  
      if (progress < 1) {
        requestAnimationFrame(animate); // Continue animation if not complete
      } else {
        setCurrentCueIndex(targetCueIndex); // Update current cue index when animation completes
      }
    };
  
    requestAnimationFrame(animate); // Start animation
  };
  // Helper function to interpolate colors
  const interpolateColor = (startColor, endColor, progress) => {
    const startRGB = parseColor(startColor);
    const endRGB = parseColor(endColor);
  
    const interpolate = (start, end) => Math.round(start + (end - start) * progress);
  
    return `rgb(${interpolate(startRGB[0], endRGB[0])}, ${interpolate(startRGB[1], endRGB[1])}, ${interpolate(startRGB[2], endRGB[2])})`;
  };
  
  // Helper function to parse color strings into RGB arrays
  const parseColor = (color) => {
    const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
  };

  const memoizedLightStack = useMemo(() => [...lightStack], [lightStack]);
  const memoizedSortedCues = useMemo(() => [...sortedCues], [sortedCues]);

  useEffect(()=>{
    console.log("now index is", highlightedCueIndex)
  }, [highlightedCueIndex])


  
  // Helper function to interpolate colors
 

  // Effects
  
  useEffect(() => {
    useLoader.preload(GLTFLoader, './stage.gltf');
    useLoader.preload(GLTFLoader, modelUrl);
  }, [modelUrl]);

  const selectedLight = Array.isArray(selectedLightStack) && selectedLightStack.length > 0 ? selectedLightStack[0] : null;
  // Render
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>

      <ModelLoader onModelSelect={(file) => {
        const url = URL.createObjectURL(file);
        setModelUrl(url);
      }} />
      <EditBar toggleButtonsVisibility={toggleButtonsVisibility} toggleLightControl={toggleLightControl} toggleCueControl={toggleCueControl} />
      <AddObject
        addObject={handleObjectAdd}
        updateObject={updateObjects}
        isVisible={isButtonsVisible}
        selectedObject={selectedObject && units.find(obj => obj.id === selectedObject)}
      />
      <AddLight
        isVisible={isLightControlVisible}
        onLightAdd={handleLightAdd}
        selectedLight= {selectedLight && lightStack.find(light => light.id === selectedLight)}
        setSelectedLightStack={setSelectedLightStack}
        onCuesUpdate={handleCuesUpdate}
        cues={cues}
        copyCue={copyCue}
        onRecordCue={recordCue}
        goToNextCue={goToNextCue}
        goToPreviousCue={goToPreviousCue} 
        onUpdateLight={onUpdateLight}  // Pass the onUpdate function
      />
      <CueMode isVisible={isCueControlVisible} onRecordCue = {recordCue} copyCue={copyCue}onCommand={onCommand} goToNextCue = { goToNextCue}  goToPreviousCue= {goToPreviousCue} cues = {sortedCues} highlightedCueIndex={highlightedCueIndex}/>
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
      gl={(canvas) => {
        return new WebGLRenderer({ 
          canvas,
          antialias: true,
          alpha: true, // 允许透明背景
          powerPreference: "high-performance", // 优先使用高性能模式
          context: canvas.getContext('webgl2'), // 确保使用 WebGL2
        })
      }}
    
        >



          
            <>

              <color attach="background" args={['#202020']} />
              {orbitEnabled && <OrbitControls enableDamping dampingFactor={0.1} />}              
              <Suspense fallback={null}>
                <PreloadedModel url={modelUrl} enableShadows={true} />
              </Suspense>
  
              <CameraController />
              <ObjectSelector selectedObject={selectedObject} setSelectedObject={setSelectedObject} setEnableOrbit={setEnableOrbit} />
              <LightSelector
              onSelectLight={handleSelectLight}
              updateSelectedLightPositions={updateSelectedLightPositions}
              setEnableOrbit={setEnableOrbit}
              lights={lightStack} // Pass all lights here
              setSelectedLightStack={setSelectedLightStack}
            />
              <LightGroup
              lightStack={lightStack}
              selectedLightStack={selectedLightStack}
              selectedLight= {selectedLight && lightStack.find(light => light.id === selectedLight)}
              onUpdateLight={onUpdateLight}
              currentChannel={currentChannel} 
              setEnableOrbit={setEnableOrbit}
              setSelectedLightStack={setSelectedLightStack} 
              isHovered={isHovered} setIsHovered={setIsHovered}
              isChannelSubmitted={isChannelSubmitted} 
              onFixtureIdChange={handleFixtureIdChange}
            />


        <ObjectGroup
          objects={units}
          selectedObject={selectedObject}
          setEnableOrbit={setEnableOrbit}
          updateObjects={updateObjects}
          objectDimensions={objectDimensions}
        />
              {lightStack.map(light => (
        <Scene 
          handleUpdateLight={onUpdateLight}
          setSelectedLightStack={setSelectedLightStack}
          selectedLightStack={selectedLightStack}
          setEnableOrbit={setEnableOrbit}
          isChannelSubmitted={isChannelSubmitted} 
          currentChannel={currentChannel} 
          isHovered={isHovered}
          setIsHovered={setIsHovered}
          key={light.id}
          light={light}
        />
      ))}
              <PerspectiveCamera makeDefault position={[0, 1, 30]} />
            </>
          
        </Canvas>
      
      </div>
    </div>
  );
}

