import React, { useState, useEffect } from 'react';

const DEFAULT_INTENSITY = 0.5;
const MAX_INTENSITY = 1;
const DISPLAY_MULTIPLIER = 100; // Factor to convert between display and actual values
const DEFAULT_COLOR = '#ffffff';
const DEFAULT_POSITION = { x:2, y: 8, z: 0 };

const AddLight = ({ 
  isVisible, 
  onLightAdd, 
  selectedLight,
  setSelectedLightStack, 
  onUpdateLight, 
  onCuesUpdate, 
  onRecordCue,
  cues = [] 
}) => {
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY);
  const [displayIntensity, setDisplayIntensity] = useState(Math.round(DEFAULT_INTENSITY * DISPLAY_MULTIPLIER));
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [channelInputVisible, setChannelInputVisible] = useState(false);
  const [channelNumber, setChannelNumber] = useState(0);
  const [newLightId, setNewLightId] = useState(null);

  useEffect(() => {
    if (selectedLight) {
      setPosition(arrayToObject(selectedLight.position));
      setIntensity(selectedLight.intensity ?? DEFAULT_INTENSITY);
      setColor(selectedLight.color || DEFAULT_COLOR);
    } else {
      setPosition(DEFAULT_POSITION);
      setIntensity(DEFAULT_INTENSITY);
      setColor(DEFAULT_COLOR);
    }
  }, [selectedLight]);
  const handleRecordButtonClick = () => {
    if (onRecordCue) {
      onRecordCue();
    }
    console.log("cues", cues)
  };
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
    const newDisplayIntensity = Math.round(newValue * DISPLAY_MULTIPLIER);
    setDisplayIntensity(newDisplayIntensity);
  
    if (selectedLight.id) {
      onUpdateLight(selectedLight.id, {
        type: 'intensity',
        value: newValue
      });
      onUpdateLight(selectedLight.id, {
        type: 'displayIntensity',
        value: newDisplayIntensity
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
  function generateShortId() {
    return Math.random().toString(36).substring(2, 6);
  }
  
  const handleAdd = () => {
    const positionArray = objectToArray(position);
    const id = generateShortId();
    setNewLightId(id);
  
    // Initially add the light without a channel number if it's to be added later
    onLightAdd(id, intensity, color, {
      x: positionArray[0], 
      y: positionArray[1], 
      z: positionArray[2],
    });
  
    setChannelInputVisible(true); // Prompt for channel number input
    // Do not clear channelNumber here if you need it for submission
  };
  const handleChannelSubmit = () => {
    console.log("Attempting to assign channel:", channelNumber, "to light ID:", newLightId);
  
    if (newLightId && channelNumber) {
      onUpdateLight(newLightId, { type: 'channel', value: channelNumber });
      setChannelInputVisible(false);
      setChannelNumber(''); // Clear after successful submission
      console.log("Channel assigned successfully.");
    } else {
      console.log("Failed to assign channel. Missing light ID or channel number.");
    }
  };


  

  const handleRemove = () => {
    if (selectedLight) {
      onUpdateLight(selectedLight.id, { type: 'remove' });
      setSelectedLightStack(null);
    } else {
      console.log('No light selected to remove.');
    }
  };

  const arrayToObject = (arr) => {
    return Array.isArray(arr) 
      ? { x: arr[0] ?? 0, y: arr[1] ?? 0, z: arr[2] ?? 0 }
      : DEFAULT_POSITION;
  };

  const objectToArray = (obj) => [obj.x, obj.y, obj.z];

  const generateNewLightId = () => {
    return `light-${Date.now()}`;
  };

  return (
    <div className={`fixed z-40 w-full md:w-1/2 xl:w-1/3 h-full bg-gray-800 text-white pt-4 space-y-4 ${isVisible ? 'flex-col' : 'hidden'}`}>
      <div className="px-4">
        <div className="mb-4">
          <label>Position X:</label>
          <input 
            type="number" 
            value={position.x ?? 0}
            onChange={(e) => handlePositionChange('x', e.target.value)}
            className="w-full bg-gray-700 p-1"
          />
          <label>Position Y:</label>
          <input 
            type="number" 
            value={position.y ?? 0}
            onChange={(e) => handlePositionChange('y', e.target.value)}
            className="w-full bg-gray-700 p-1"
          />
          <label>Position Z:</label>
          <input 
            type="number" 
            value={position.z ?? 0}
            onChange={(e) => handlePositionChange('z', e.target.value)}
            className="w-full bg-gray-700 p-1"
          />
        </div>
        <div className="mb-4">
          <label>Intensity: {displayIntensity}</label>
          <input 
            type="range" 
            min="0" 
            max={MAX_INTENSITY}
            step="0.01"
            value={intensity ?? DEFAULT_INTENSITY}
            onChange={handleIntensityChange} 
            className="w-full bg-gray-700 p-1"
          />
        </div>
        <input 
          type="color" 
          value={color ?? DEFAULT_COLOR} 
          onChange={e => handleColorChange(e.target.value)} 
          className="w-32 mt-4" 
        />

        <button 
          onClick={handleAdd}
          className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          Add Light
        </button>

        {channelInputVisible && (
          <div className="mt-4">
            <label>Enter Channel Number:</label>
            <input 
              type="text"
              value={channelNumber}
              onChange={(e) => setChannelNumber(e.target.value)}
              className="w-full bg-gray-700 p-1 mb-2"
            />
            <button 
              onClick={handleChannelSubmit}
              className="w-full p-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
            >
              Assign Channel
            </button>
          </div>
        )}

        <button 
          onClick={handleRemove}
          className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          Remove Selected Light
        </button>

        <button 
          onClick={handleRecordButtonClick}
          className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          Record Cue
        </button>

        <div className="mt-4">
          <h3 className="text-xl mb-2">Cue List</h3>
          <ul>
            {cues.map(cue => (
              <li key={cue.id} className="mb-1">
                <strong>{cue.name}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddLight;
