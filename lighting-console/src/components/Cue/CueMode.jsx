import React, { useState, useEffect, useCallback } from 'react';

const CueMode = ({ isVisible, onRecordCue, cues, onCommand }) => {
  const [command, setCommand] = useState('');
  const [selectedLightChannel, setSelectedLightChannel] = useState(null);

  const handleCommandInput = (e) => {
    setCommand(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Handle command execution based on key combinations
    if (e.key === ' ') {
      if (e.ctrlKey) {
        onCommand('stop/back');
      } else {
        onCommand('go');
      }
    } else if (e.key === 'r') {
      onRecordCue();
    } else if (e.key === 'u') {
      onCommand('update');
    } else if (e.key === 'c') {
      onCommand('copy to');
    } else if (e.key === 'g') {
      onCommand('group');
    } else if (e.key === 'q') {
      onCommand('cue');
    } else if (e.key === 'l') {
      onCommand('label/note');
    } else if (e.key === 'b') {
      onCommand('block');
    } else if (e.key === 'x') {
      onCommand('cue only/track');
    } else if (e.key === 'f') {
      onCommand('full');
    } else if (e.key === 'o') {
      onCommand('out');
    } else if (e.key === 'Enter') {
      // Handle light selection by channel number
      const channelNumber = parseInt(command, 10);
      if (!isNaN(channelNumber)) {
        setSelectedLightChannel(channelNumber);
        onCommand(`select light ${channelNumber}`);
        setCommand('');
      }
    } else if (e.key === 'a' && selectedLightChannel !== null) {
      // Adjust intensity when a light is selected
      const intensityValue = parseInt(command, 10);
      if (!isNaN(intensityValue)) {
        onCommand(`adjust intensity ${selectedLightChannel} to ${intensityValue}`);
        setCommand('');
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [command, selectedLightChannel]);

  return (
    <div className={`fixed z-40 w-full md:w-1/2 xl:w-1/3 h-full bg-gray-800 text-white pt-4 space-y-4 ${isVisible ? 'flex-col' : 'hidden'}`}>
      <div>
        <input
          type="text"
          value={command}
          onChange={handleCommandInput}
          className="w-full p-2 bg-gray-700 text-white"
          placeholder="Enter command..."
        />
        <button 
          onClick={() => onRecordCue()}
          className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          Record Cue
        </button>
  
        {/* Cue List Display */}
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

export default CueMode;
