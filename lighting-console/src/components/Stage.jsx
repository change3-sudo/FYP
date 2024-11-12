import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import WebGPURenderer from 'three/src/renderers/webgpu/WebGPURenderer.js';
import './styles.css';
import LightDrag from './LightDrag'

// Three.js imports
import { Vector3, Vector2, Raycaster } from 'three';
import * as THREE from 'three';

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
async function initializeWebGPU(canvas) {
  if (!navigator.gpu) {
    console.error("WebGPU is not supported by your browser.");
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  // Additional WebGPU setup can be done here...
}

// PreloadedModel component
function PreloadedModel({ url }) {
  const gltf = useLoader(GLTFLoader, url);
  return <primitive object={gltf.scene} scale={0.75} />;
}
function generateShortId() {
  return Math.random().toString(36).substring(2, 6);
}

const LightGroup = ({ lightStack, selectedLight, onUpdateLight, currentChannel,isChannelSubmitted }) => {
  return (
    <group>
      {lightStack.map(light => (
        <LightRenderer
          key={light.id}
          light={light}
          isSelected={selectedLight === light.id}
          isChannelSubmitted={isChannelSubmitted} 
          currentChannel={currentChannel} 
        />
      ))}
        <LightDrag
          lightStack={lightStack}
          selectedLight={selectedLight}
           // Assuming it's a single ID
          
          onUpdateLight={onUpdateLight}
        />
      
    </group>
      
  );
};


const ObjectGroup = ({ objects, selectedObject, setEnableOrbit, updateObjects, objectDimensions }) => {
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
          objects={objects}//unit
          setEnableOrbit={setEnableOrbit}
          updateObjects={updateObjects}
          dimensions={objectDimensions}
        />
      )}
    </group>
  );
};


// Main Stage component
export default function Stage() {
  // all units
  const [units, setUnits] = useState([]);


// All lights
  const [lightStack, setLightStack] = useState([]); 
  const [selectedLightStack, setSelectedLightStack] = useState([]);
  const [isChannelSubmitted, setIsChannelSubmitted] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null); // New state for channel

  //cue
  const [cues, setCues] = useState([]);

// All objects
  
  const [selectedObject, setSelectedObject] = useState(null);

  const [currentCueIndex, setCurrentCueIndex] = useState(-1);
  const [modelUrl, setModelUrl] = useState('/stage.gltf');
  const [renderer, setRenderer] = useState(null);
  const [isButtonsVisible, setIsButtonsVisible] = useState(false);
  const [isCueControlVisible, setIsCueControlVisible] = useState(false);
  const [isLightControlVisible, setIsLightControlVisible] = useState(false);
  const [orbitEnabled, setEnableOrbit] = useState(true);
  const [objectDimensions, setObjectDimensions] = useState({});
  const canvasRef = useRef();





  
  const toggleButtonsVisibility = useCallback(() => {
    setIsButtonsVisible(prev => !prev);
  }, []);


  //Object functions
  const updateObjects = useCallback((id, update) => {
    setUnits(prevObjects => prevObjects.map(obj => {
      if (obj.id === id) {
        return update.type ? { ...obj, [update.type]: update.value } : { ...obj, position: update };
      }
      return obj;
    }));
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
      rotation: worldSpace.rotation || [0, 0, 0],
      scale: worldSpace.scale || [1, 1, 1]
    };
    setUnits(prevObjects => [...prevObjects, newObject]);
  }, []);



  const handleBoundsUpdate = useCallback((dimensions) => {
    setObjectDimensions(dimensions);
  }, []);


  const handleLightAdd = useCallback((id,intensity, color, channel, position) => {
    const randomPosition = [Math.random() * 10 - 5, 5, 0];
    const newLightId = generateShortId();
    const newLight = {
      id: id,
      type: 'spotLight',
      position: randomPosition,
      color: color,
      intensity: intensity,
      channel:currentChannel,
      focusPoint: [randomPosition[0], 0, randomPosition[2]],
      
    };
  
    setLightStack(prevLights => [...prevLights, newLight]);
    console.log('Light added:', newLight);
  }, []);
  
  
  

  
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
      console.log('Channel updated for light with ID:', id, 'New Channel:', value);
    }
    if (type === 'remove') {
      console.log('Removed light with ID:', id);
    }
  }, []);
  
  


  const toggleLightControl = useCallback(() => {
    setIsLightControlVisible(prev => !prev);
  }, []);
  const toggleCueControl = useCallback(() => {
    setIsCueControlVisible(prev => !prev);
  }, []);
  const handleCuesUpdate = useCallback((updatedCues) => {
    setCues(updatedCues);
    console.log("Cues updated:", updatedCues);
  }, []);


  const handleSelectLight = (lightData) => {
    console.log('Light data received:', lightData);
    // Perform additional actions with the selected light data
  };
  
  const recordCue = useCallback(() => {
    const currentLightsState = lightStack.map(light => ({
      id: light.id,
      position: light.position,
      intensity: light.intensity,
      color: light.color,
      focusPoint: light.focusPoint,
    }));
  
    const newCue = {
      id: uuidv4(),
      name: `Cue ${1 + cues.length}`,
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
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
  
        if (event.shiftKey) {
          // Shift + Space: Previous Cue
          const newIndex = currentCueIndex > 0 ? currentCueIndex - 1 : cues.length - 1;
          fadeToCue(newIndex);
          console.log("cue number", newIndex + 1);
        } else if(currentCueIndex !== cues.length) {
          // Space: Next Cue
          const newIndex = (currentCueIndex + 1) % cues.length;
          fadeToCue(newIndex);
          console.log("cue number", newIndex + 1);
        }
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCueIndex, cues.length, fadeToCue]);

  
  // Helper function to interpolate colors
 

  // Effects
  useEffect(() => {
    useLoader.preload(GLTFLoader, './stage.gltf');
    useLoader.preload(GLTFLoader, modelUrl);
  }, [modelUrl]);

  useEffect(() => {
    const initWebGPU = async () => {
      if (!navigator.gpu) {
        console.error("WebGPU not supported");
        return;
      }
      const adapter = await navigator.gpu.requestAdapter();
      const device = await adapter.requestDevice();
    };
    initWebGPU();
  }, []);
  useEffect(() => {
    console.log('Lights Updated:', selectedLightStack);
  }, [selectedLightStack]);
  useEffect(() => {
    console.log('unit Updated:', units);
  }, [units]);
  useEffect(() => {
    console.log('EnableOrbit Updated:', orbitEnabled);
  }, [orbitEnabled]);

  
  
  

  useEffect(() => {
    console.log("selectedLightStack:",selectedLightStack);
  }, [selectedLightStack]);
  useEffect(() => {
    console.log("LightStack:",lightStack);
  }, [lightStack]);
  useEffect(() => {
    const canvas = document.getElementById('myCanvas');
    initializeWebGPU(canvas);
  }, []);
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
        onRecordCue={recordCue} 
        onUpdateLight={onUpdateLight}  // Pass the onUpdate function

      />
      <CueMode isVisible={isCueControlVisible} onRecordCue = {recordCue} cues = {cues}/>
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <Canvas
          gl={async (canvas) => {
            if (!navigator.gpu) {
              throw new Error('WebGPU not supported');
            }
            const adapter = await navigator.gpu.requestAdapter();
            const device = await adapter.requestDevice();
            const renderer = new WebGPURenderer({
              canvas,
              antialias: true,
              device,
              alpha: true
            });
            await renderer.init();
            renderer.setClearColor('#202020');
            renderer.setSize(window.innerWidth, window.innerHeight);
            return renderer;
          }}
          onCreated={({ gl }) => {
            setRenderer(gl);
          }}
          fallback={<span>WebGPU not supported</span>}
        >
          {renderer && (
            <>
              <color attach="background" args={['#202020']} />
              <OrbitControls enabled={orbitEnabled} />
              <Suspense fallback={null}>
                <PreloadedModel url={modelUrl} />
              </Suspense>
              <CameraController />
              <ambientLight intensity={0.5} />
              <ObjectSelector selectedObject={selectedObject} setSelectedObject={setSelectedObject} setEnableOrbit={setEnableOrbit} />
              <LightSelector
  onSelectLight={handleSelectLight}
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
  isChannelSubmitted={isChannelSubmitted} 
/>


        <ObjectGroup
          objects={units}
          selectedObject={selectedObject}
          setEnableOrbit={setEnableOrbit}
          updateObjects={updateObjects}
          objectDimensions={objectDimensions}
        />
              <Scene />
              <PerspectiveCamera makeDefault position={[0, 1, 30]} />
            </>
          )}
        </Canvas>
      </div>
    </div>
  );
}
