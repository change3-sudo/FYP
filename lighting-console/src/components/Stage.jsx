
import { Vector3, Vector2, Raycaster } from 'three'
import React, { useRef, useEffect, useState,useCallback, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { useGLTF, SpotLight, useDepthBuffer, Plane,Box,Sphere, Cone, Torus,  OrbitControls, PerspectiveCamera, TransformControls  } from '@react-three/drei'
import './styles.css'
import * as THREE from 'three'
import AddObject from './Object/AddObject';
import EditBar from './EditBar';
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import ObjectSelector  from './Object/ObjectSelector'
import CameraController from './CameraController'
import GeometryRenderer from './Object/GeometryRenderer'
import ModelLoader from './ModelLoader'
import GeometryManager from './Object/GeometryManager'
import Scene from './Scene'
import AddLight from './Light/AddLight'
import LightManager from './Light/LightManager'
import LightRenderer from './Light/LightRenderer'
import WebGPURenderer from 'three/src/renderers/webgpu/WebGPURenderer.js'
import LightSelector from './Light/LightSelector'
import ModelLoaderComponent from './ModelLoaderComponent'; // The component that loads the model
import DragHandler from './DragHandler'
async function initializeWebGPU(canvas) {
  if (!navigator.gpu) {
      console.error("WebGPU is not supported by your browser.");
      return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  
  // Continue with setting up WebGPU for the canvas...
}
function PreloadedModel({ url }) {
  const gltf = useLoader(GLTFLoader, url);
  return <primitive object={gltf.scene} scale={0.75} />;
}
export default function Stage() {
//   // In your Parent Component
// const stagef = () => {
//   const stagef = useGLTF("./stage.gltf")
//   return(
//   <mesh>
//   <pointLight intensity={1} />
//   <primitive
//       object={stagef.scene}
//       scale={0.75}
//       position={[0, -3.25, 1.5]}
//       rotation={[-0.01, -0.2, -0.1]}
//   />
// </mesh>
//   )
// };
  const updateFixture = useCallback((id, update) => {
    setObjects(prevObjects => prevObjects.map(obj => {
      if (obj.id === id) {
        // Fixture-specific updates
        if (update.type === 'intensity') {
          return {
            ...obj,
            intensity: update.value
          };
        }
        if (update.type === 'beam') {
          return {
            ...obj,
            angle: update.value
          };
        }
        if (update.type === 'color') {
          return {
            ...obj,
            color: update.value
          };
        }
        // Generic transform updates
        if (update.type) {
          return {
            ...obj,
            [update.type]: update.value
          };
        }
        // Position updates from DragHandler
        return {
          ...obj,
          position: update
        };
      }
      return obj;
    }));
  }, []);
  
  useEffect(() => {
    // Preload all your models
    useLoader.preload(GLTFLoader, './stage.gltf')
    // Add any other models you need to preload
  }, [])
    // Handle new objects added from GeometryManager
  // Function to add objects with a random position
  const spotRefs = useRef({});  // Store refs for all spotlights

  const canvasRef = useRef();

  useEffect(() => {
    const initWebGPU = async () => {
      if (!navigator.gpu) {
        console.error("WebGPU not supported");
        return;
      }

      const adapter = await navigator.gpu.requestAdapter();
      const device = await adapter.requestDevice();

      // 設置 WebGPU 渲染邏輯
      // ...
    };

    initWebGPU();
  }, []);
  

  const [objectDimensions, setObjectDimensions] = useState({});
  const handleBoundsUpdate = (dimensions) => {
    setObjectDimensions(dimensions);
  };
  const [selectedFixture, setSelectedFixture] = useState(null);
    const [orbitEnabled, setEnableOrbit] = useState(true);
    const [selectedObject, setSelectedObject] = useState(null);
    const [highestId, setHighestId] = useState(0);
    
    const [objects, setObjects] = useState([]);
// In your main component where you manage lights
const handleLightAdd = (intensity, color) => {
  // Generate a random position for the new light
  const randomPosition = [
    Math.random() * 10 - 5, // Random X from -5 to 5
    5,                     // Fixed Y
    0  // Random Z from -5 to 5
  ];

  // Create a new light object
  const newLight = {
    id: Math.random(),
    type: 'spotLight',
    position: randomPosition, // Assign the generated random position
    color: color,
    intensity: intensity,
    focusPoint: [randomPosition[0], 0, randomPosition[2]] // Use the same X and Z for focus
  };
  setSelectedLightId(newLight.id);  // Update the state with the new light
  setObjects(prevLights => [...prevLights, newLight]);
  // Log the new light position for debugging
  console.log("New light position is:", newLight.position);
  console.log("Focus point is:", newLight.focusPoint);
};
const [selectedLight, setSelectedLight] = useState(null);
const handleSelectLight = (lightData) => {
  console.log("Light selected:", lightData);
  setSelectedLight(lightData);
};
    const [renderer, setRenderer] = useState(null);
    const [isLightControlVisible, setIsLightControlVisible] = useState(false);
  const [lights, setLights] = useState([]);
  const [selectedLightId, setSelectedLightId] = useState(null);
  const [modelUrl, setModelUrl] = useState('/stage.gltf');
  useEffect(() => {
    // Preload the model
    useLoader.preload(GLTFLoader, modelUrl);
  }, [modelUrl]);


  const handleUpdateLight = (id, { type, value }) => {
    setLights(lights.map(light => 
      light.id === id ? { ...light, [type]: value } : light
    ));
  };

  
    const toggleLightControl = () => {
      setIsLightControlVisible(prev => !prev);
    };
  
    useEffect(() => {
      const canvas = document.getElementById('myCanvas');
      initializeWebGPU(canvas);
    }, []);
    const defaultModelUrl = "./light.gltf";
    // Function to toggle visibility
    const handleObjectAdd = (geometry, color, worldSpace) => {
      const newObject = {
        id: Math.random(),
        type: geometry,
        color: color,
        position: [
          //0,3,0
          Math.random() * 10 - 5, // Random X from -5 to 5
          Math.random() * 10 + 5, // Random Y from -5 to 5
          Math.random() * 10 - 5 // Random Z from -5 to 5
          ],
        rotation: worldSpace.rotation ? [worldSpace.rotation.x, worldSpace.rotation.y, worldSpace.rotation.z] : [0, 0, 0],
        scale: worldSpace.scale ? [worldSpace.scale.x, worldSpace.scale.y, worldSpace.scale.z] : [1, 1, 1] 
      };
      setObjects(prevObjects => [...prevObjects, newObject]);
    };
    const [isButtonsVisible, setIsButtonsVisible] = useState(false);
    const toggleButtonsVisibility = () => {
      setIsButtonsVisible(prev => {
        const newValue = !prev;
        console.log("Is Buttons Visible:", newValue); // Log the new value
        return newValue;
      });
    };
      // ... other states
      const updateObjects = useCallback((id, update) => {
        setObjects(prevObjects => prevObjects.map(obj => {
          if (obj.id === id) {
            // For transform updates coming from Buttons.jsx
            if (update.type === 'color') {
              return {
                ...obj,
                color: update.value
              };
            }
            if (update.type) {
              return {
                ...obj,
                [update.type]: update.value
              };
            }
            // For position updates coming from DragHandler
            return {
              ...obj,
              position: update
            };
          }
          return obj;
        }));
      }, []);

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
        <GeometryManager onObjectAdd={handleObjectAdd} />
        <AddLight
        isVisible={isLightControlVisible}
        onLightAdd={handleLightAdd}
        selectedLight={selectedLight}
        onUpdateLight={handleUpdateLight}
      />
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <Canvas
        gl={async (canvas) => {
          if (!navigator.gpu) {
            throw new Error('WebGPU not supported');
          }
          
          // Wait for adapter and device
          const adapter = await navigator.gpu.requestAdapter();
          const device = await adapter.requestDevice();
          
          const renderer = new WebGPURenderer({
            canvas,
            antialias: true,
            device,
            alpha: true
          });
          
          await renderer.init(); // Important!
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
              <OrbitControls enabled={orbitEnabled}/>
              <Suspense fallback={null}>
        <PreloadedModel url={modelUrl} />
      </Suspense>
              <CameraController />
              <ambientLight intensity={0.5} />
              <ObjectSelector selectedObject={selectedObject} setSelectedObject={setSelectedObject} setEnableOrbit={setEnableOrbit} />
              <LightSelector
  onSelectLight={(lightData) => handleSelectLight(lightData)}
  // 或者直接寫成
  // onSelectLight={handleSelectLight}
  onUpdateLight={handleUpdateLight}
  setEnableOrbit={setEnableOrbit}
  selectedLight={selectedLight}  // 注意這裡傳入 selectedLight 而不是 selectedLightId
/>
                {/* Lights group */}
                <group>
  {objects.map((item) => {
    switch(item.type) {
      case 'spotLight':
        console.log("Mapping item:", item);
        return (
          <LightRenderer
          key={`light-${item.id}`}
         light={item} // Assuming object contains position, color, intensity, etc.
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