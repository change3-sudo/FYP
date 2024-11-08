import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import WebGPURenderer from 'three/src/renderers/webgpu/WebGPURenderer.js';
import './styles.css';

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

// Main Stage component
export default function Stage() {
  // State and refs
  const [objects, setObjects] = useState([]);
  const [lights, setLights] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [selectedModelPosition, setSelectedModelPosition] = useState([0, 0, 0]);
  const [selectedModelRotation, setSelectedModelRotation] = useState([0, 0, 0]);
  const [selectedModelScale, setSelectedModelScale] = useState([1, 1, 1]);
  const [selectedModelColor, setSelectedModelColor] = useState([1, 1, 1]);
  const [selectedModelIntensity, setSelectedModelIntensity] = useState(1);
  const [selectedModelFocusPoint, setSelectedModelFocusPoint] = useState([0, 0, 0]);

  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedLight, setSelectedLight] = useState(null);
  const [selectedLightId, setSelectedLightId] = useState(null);
  const [cues, setCues] = useState([]);
  const [currentCueIndex, setCurrentCueIndex] = useState(-1);
  const [modelUrl, setModelUrl] = useState('/stage.gltf');
  const [renderer, setRenderer] = useState(null);
  const [isButtonsVisible, setIsButtonsVisible] = useState(false);
  const [isLightControlVisible, setIsLightControlVisible] = useState(false);
  const [orbitEnabled, setEnableOrbit] = useState(true);
  const [objectDimensions, setObjectDimensions] = useState({});
  const canvasRef = useRef();

  // Callbacks and handlers
  const updateObjects = useCallback((id, update) => {
    setObjects(prevObjects => prevObjects.map(obj => {
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
    setObjects(prevObjects => [...prevObjects, newObject]);
  }, []);

  const handleLightAdd = useCallback((intensity, color) => {
    const randomPosition = [Math.random() * 10 - 5, 5, 0];
    const newLight = {
      id: Math.random(),
      type: 'spotLight',
      position: randomPosition,
      color: color,
      intensity: intensity,
      focusPoint: [randomPosition[0], 0, randomPosition[2]]
    };
    setSelectedLightId(newLight.id);
    setObjects(prevLights => [...prevLights, newLight]);
  }, []);
  const onUpdateLight = useCallback((id, { type, value }) => {
    setObjects(prevLights =>
      prevLights.map(light =>
        light.id === id ? { ...light, [type]: value } : light
      )
    );
  }, []);

  const applyCue = useCallback((cueIndex) => {
    if (cueIndex < 0 || cueIndex >= cues.length) return;
    const cue = cues[cueIndex];
    const { position, intensity, color, focusPoint } = cue.lightState;
    console.log("position", position)
    setObjects(prevLights => prevLights.map(light => 
      light.id === selectedLightId 
        ? { 
            ...light, 
            position: [position[0], position[1], position[2]],
            intensity,
            color,
            focusPoint: [focusPoint[0], focusPoint[1], focusPoint[2]],
          }
        : light
    ));
    console.log("HI here the light is ",cue)

    setCurrentCueIndex(cueIndex);
  }, [cues, selectedLightId]); 

  const toggleButtonsVisibility = useCallback(() => {
    setIsButtonsVisible(prev => !prev);
  }, []);

  const toggleLightControl = useCallback(() => {
    setIsLightControlVisible(prev => !prev);
  }, []);

  const handleCuesUpdate = useCallback((updatedCues) => {
    setCues(updatedCues);
    console.log("Cues updated:", updatedCues);
  }, []);
  const handleBoundsUpdate = useCallback((dimensions) => {
    setObjectDimensions(dimensions);
  }, []);

  const handleSelectLight = useCallback((lightData) => {
    setSelectedLight(lightData);
  }, []);

  const handleUpdateLight = useCallback((id, { type, value }) => {
    setObjects(lights.map(light => 
      light.id === id ? { ...light, [type]: value } : light
    ));
  }, []);

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
    console.log('Lights Updated:', objects);
  }, [objects]);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault(); // Prevent default spacebar behavior

        if (event.shiftKey) {
          // Shift + Space: Previous Cue
          const newIndex = currentCueIndex > 0 ? currentCueIndex - 1 : cues.length - 1;
          applyCue(newIndex);
        } else {
          // Space: Next Cue
          const newIndex = (currentCueIndex + 1) % cues.length;
          applyCue(newIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCueIndex, cues.length, applyCue]);

  useEffect(() => {
    console.log("Updated selectedLightId:", selectedLightId);
  }, [selectedLightId]);

  useEffect(() => {
    const canvas = document.getElementById('myCanvas');
    initializeWebGPU(canvas);
  }, []);

  // Render
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <ModelLoader onModelSelect={(file) => {
        const url = URL.createObjectURL(file);
        setModelUrl(url);
      }} />
      <EditBar toggleButtonsVisibility={toggleButtonsVisibility} toggleLightControl={toggleLightControl} />
      <AddObject
        addObject={handleObjectAdd}
        updateObject={updateObjects}
        isVisible={isButtonsVisible}
        selectedObject={selectedObject && objects.find(obj => obj.id === selectedObject)}
      />
      <AddLight
        isVisible={isLightControlVisible}
        onLightAdd={handleLightAdd}
        selectedLight={selectedLight}
        onUpdateLight={onUpdateLight}  // Pass the onUpdate function
        onCuesUpdate={handleCuesUpdate} // Example cue update handler

        cues={cues}
      />
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
                onUpdateLight={handleUpdateLight}
                setEnableOrbit={setEnableOrbit}
                selectedLightid={selectedLightId}
                selectedLight={selectedLight}
                setselectedLightid={setSelectedLightId}
              />
              <group>
                {objects.map((item) => {
                  switch (item.type) {
                    case 'spotLight':
                      return (
                        <LightRenderer
                          key={`light-${item.id}`}
                          light={item}
                          isSelected={selectedLight === item.id}
                        />
                      );
                    default:
                      return (
                        <GeometryRenderer
                          key={`geo-${item.id}`}
                          object={item}
                          isSelected={selectedObject === item.id}
                          onBoundsUpdate={handleBoundsUpdate}
                        />
                      );
                  }
                })}
                <DragHandler
                  selectedObject={selectedObject}
                  objects={objects}
                  setEnableOrbit={setEnableOrbit}
                  updateObjects={updateObjects}
                  dimensions={objectDimensions}
                />
              </group>
              <Scene />
              <PerspectiveCamera makeDefault position={[0, 1, 30]} />
            </>
          )}
        </Canvas>
      </div>
    </div>
  );
}
