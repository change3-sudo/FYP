import React, { useState, useEffect } from 'react';

const DEFAULT_INTENSITY = 0.5;
const MAX_INTENSITY = 1;
const DISPLAY_MULTIPLIER = 100; // Factor to convert between display and actual values
const DEFAULT_COLOR = '#ffffff';
const DEFAULT_POSITION = { x: 0, y: 8, z: 0 };

const AddLight = ({ 
  isVisible, 
  onLightAdd, 
  selectedLight, 
  onUpdateLight, 
  onCuesUpdate, 
  onCueSelect 
}) => {
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [cues, setCues] = useState([]);
  const [currentCueIndex, setCurrentCueIndex] = useState(-1);

  const calculateFocusPoint = (position) => {
    // Example: Focus directly below the light
    return { x: position.x, y: 0, z: position.z };
  };

  const recordCue = () => {
    if (!selectedLight) return;

    const newCue = {
      name: `Cue ${cues.length + 1}`,
      lightState: {
        position: { ...position },
        intensity,
        color,
        focusPoint: calculateFocusPoint(position)
      }
    };

    const updatedCues = [...cues, newCue];
    setCues(updatedCues);

    // Notify parent about the updated cues list
    if (onCuesUpdate) {
      onCuesUpdate(updatedCues);
    }
  };

  useEffect(() => {
    if (selectedLight) {
      setPosition(arrayToObject(selectedLight.position));
      setIntensity(selectedLight.intensity); // Store actual intensity
      setColor(selectedLight.color || DEFAULT_COLOR);
    } else {
      setPosition(DEFAULT_POSITION);
      setIntensity(DEFAULT_INTENSITY);
      setColor(DEFAULT_COLOR);
    }
  }, [selectedLight]);

  const handlePositionChange = (axis, value) => {
    const newValue = parseFloat(value);
    setPosition(prev => ({
      ...prev,
      [axis]: newValue
    }));
    if (selectedLight) {
      onUpdateLight(selectedLight.id, {
        type: 'position',
        value: objectToArray({...position, [axis]: newValue})
      });
    }
  };

  const handleIntensityChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setIntensity(newValue); 
    if (selectedLight) {
      onUpdateLight(selectedLight.id, {
        type: 'intensity',
        value: newValue
      });
    }
  };

  const handleColorChange = (newValue) => {
    setColor(newValue);
    if (selectedLight) {
      onUpdateLight(selectedLight.id, {
        type: 'color',
        value: newValue
      });
    }
  };

  const arrayToObject = (arr) => {
    return Array.isArray(arr) 
      ? { x: arr[0] || 0, y: arr[1] || 0, z: arr[2] || 0 }
      : DEFAULT_POSITION;
  };

  const objectToArray = (obj) => [obj.x, obj.y, obj.z];

  const handleAdd = () => {
    const positionArray = objectToArray(position);
    onLightAdd(intensity, color, {
      x: positionArray[0], 
      y: positionArray[1], 
      z: positionArray[2] 
    });
  };

  // Calculate display intensity (actual value * DISPLAY_MULTIPLIER)
  const displayIntensity = intensity * DISPLAY_MULTIPLIER;

  return (
    <div className={`fixed z-40 w-full md:w-1/2 xl:w-1/3 h-full bg-gray-800 text-white pt-4 space-y-4 ${isVisible ? 'flex-col' : 'hidden'}`}>
      <div className="px-4">
        <div className="mb-4">
          <label>Position X:</label>
          <input 
            type="number" 
            value={position.x}
            onChange={(e) => handlePositionChange('x', e.target.value)}
            className="w-full bg-gray-700 p-1"
          />
          <label>Position Y:</label>
          <input 
            type="number" 
            value={position.y}
            onChange={(e) => handlePositionChange('y', e.target.value)}
            className="w-full bg-gray-700 p-1"
          />
          <label>Position Z:</label>
          <input 
            type="number" 
            value={position.z}
            onChange={(e) => handlePositionChange('z', e.target.value)}
            className="w-full bg-gray-700 p-1"
          />
        </div>
        <div className="mb-4">
          <label>Intensity: {Math.round(displayIntensity)}</label>
          <input 
            type="range" 
            min="0" 
            max={MAX_INTENSITY}
            step="0.01"
            value={intensity}
            onChange={handleIntensityChange} 
            className="w-full bg-gray-700 p-1"
          />
        </div>
        <input 
          type="color" 
          value={color} 
          onChange={e => handleColorChange(e.target.value)} 
          className="w-32 mt-4" 
        />

        <button 
          onClick={handleAdd}
          className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          Add Light
        </button>
        <button 
          onClick={recordCue}
          className="w-full p-2 bg-green-500 rounded hover:bg-green-600 transition-colors mt-2"
        >
          Record Cue
        </button>
        <div className="mt-4">
          <h3 className="text-xl mb-2">Cue List</h3>
          <ul>
            {cues.map((cue, index) => (
              <li key={index} className="mb-1">
                {cue.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddLight;
