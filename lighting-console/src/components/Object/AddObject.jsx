import React, { useCallback,useState,useEffect } from 'react';
import ModelLoader from '../ModelLoader';
import * as THREE from "three";
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'

function TransformRow({ label, value, onChange, type }) {
  const convertToRadians = (degrees) => degrees * (Math.PI / 180);
  const convertToDegrees = (radians) => radians * (180 / Math.PI);
  
  const handleChange = (axis, inputValue) => {
    const newValue = parseFloat(inputValue);
    
    // Handle different types of transformations
    let processedValue;
    if (isNaN(newValue)) {
      processedValue = type === 'scale' ? 1 : 0;
    } else if (type === 'scale') {
      processedValue = Math.max(0.0001, newValue); // Prevent negative/zero scale
    } else if (type === 'rotation') {
      processedValue = convertToRadians(newValue);
    } else {
      processedValue = newValue;
    }

    onChange({
      ...value,
      [axis]: processedValue
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <label>{label}:</label>
      {['x', 'y', 'z'].map((axis) => (
        <input
          key={axis}
          type="number"
          step={type === 'scale' ? 0.1 : 1}
          min={type === 'scale' ? 0.0001 : undefined}
          className="w-12 p-1 bg-gray-700 text-white rounded"
          value={
            type === 'rotation' 
              ? (value?.[axis] ? convertToDegrees(value[axis]).toFixed(2) : 0)
              : (value?.[axis] || 0).toFixed(2)
          }
          onChange={(e) => handleChange(axis, e.target.value)}
        />
      ))}
    </div>
  );
}
const AddObject = React.memo(({ addObject, isVisible, selectedObject, updateObject }) => {
  const [geometry, setGeometry] = useState('box');
  const [color, setColor] = useState('#ff0000');
  const defaultWorldSpace = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  };
  const [showOverlay, setShowOverlay] = useState(false);
  const [worldSpace, setWorldSpace] = useState(defaultWorldSpace);
  const arrayToObject = (arr) => {
    if (!Array.isArray(arr)) {
      return { x: 0, y: 0, z: 0 }; // Return default values if input is not an array
    }
    return { x: arr[0], y: arr[1], z: arr[2] };
  };
  const objectToArray = (obj) => [
    isNaN(obj.x) ? 0 : obj.x,
    isNaN(obj.y) ? 0 : obj.y,
    isNaN(obj.z) ? 0 : obj.z
];

  useEffect(() => {
    if (!selectedObject) {
      setWorldSpace(defaultWorldSpace);}
    else{
      setWorldSpace({
        position: arrayToObject(selectedObject.position) || [0, 0, 0],
        rotation: arrayToObject(selectedObject.rotation) || [0, 0, 0],
        scale: arrayToObject(selectedObject.scale) || [1, 1, 1],
      });
    }
  }, [selectedObject]);

  const handlePositionChange = useCallback((newValue) => {
    setWorldSpace(prev => ({
      ...prev,
      position: newValue
    }));
    if (selectedObject) {
      updateObject(selectedObject.id, {
        type: 'position',
        value: objectToArray(newValue)
      });
    }
  }, [selectedObject]);
  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  // Render overlay
  const renderOverlay = () => (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg">
        <h2>Overlay Content</h2>
        <button onClick={toggleOverlay} className="mt-2 p-2 bg-blue-500 text-white rounded">Close</button>
      </div>
    </div>
  );

  const handleRotationChange = (newValue) => {
    setWorldSpace(prev => ({
      ...prev,
      rotation: newValue
    }));
    if (selectedObject) {
      updateObject(selectedObject.id, {
        type: 'rotation',
        value: objectToArray(newValue)
      });
    }
  };

  const handleScaleChange = (newValue) => {
    // Ensure all scale values are at least 0.0001
    const safeScale = {
      x: Math.max(0.1, newValue.x || 0.1),
      y: Math.max(0.1, newValue.y || 0.1),
      z: Math.max(0.1, newValue.z || 0.1)
    };
  
    setWorldSpace(prev => ({
      ...prev,
      scale: safeScale
    }));
  
    if (selectedObject) {
      updateObject(selectedObject.id, {
        type: 'scale',
        value: objectToArray(safeScale)
      });
    }
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (selectedObject) {
      updateObject(selectedObject.id, {
        type: 'color',
        value: newColor
      });
    }
  };

  const visibilityClass = isVisible ? 'flex-col' : 'hidden';

  return (
    <div className={`fixed z-40 bottom-15 w-full md:w-1/2 xl:w-1/3 h-full bg-gray-800 text-white pt-4 space-y-4 ${visibilityClass}`}>
      <div className="flex flex-col justify-between h-full">  {/* Adjusted for vertical layout */}
        <div className="px-4 flex-grow">

          <select value={geometry} onChange={e => setGeometry(e.target.value)} className="w-full p-2 rounded bg-gray-700">
            <option value="box">Box</option>
            <option value="sphere">Sphere</option>
            <option value="cone">Cone</option>
            <option value="torus">Torus</option>
          </select>
        
          <input 
            type="color" 
            value={selectedObject?.color || color} 
            onChange={e => handleColorChange(e.target.value)} 
            className="w-32 mt-4" 
          />
          <button onClick={() => addObject(geometry, color, worldSpace)} className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors mt-4">
            Render
          </button>
  
          <div className="flex-col mt-6 border-t border-gray-700 pt-4">
            <TransformRow 
              label="Position"
              value={worldSpace.position}
              onChange={handlePositionChange}
              type="Position"
            />
            <TransformRow 
              label="Rotation" 
              value={worldSpace.rotation}
              onChange={handleRotationChange}
              type="rotation"
            />
            <TransformRow 
              label="Scale" 
              value={worldSpace.scale}
              onChange={handleScaleChange}
            />
          </div>

  
        </div>

      </div>
    </div>
  );
    

})

export default AddObject;