import React from 'react';
import Buttons from './Buttons'; // Assuming you have a Buttons component
import FileInput from './FileInput'; // Import FileInput component

function ControlPanel({ addObject, setGeometry, setColor, color }) {
    return (
      <div>
        <Buttons addObject={addObject} setGeometry={setGeometry} setColor={setColor} color={color} />
        <FileInput onLoadOBJ={loadOBJ} onLoadGLTF={loadGLTF} />
      </div>
    );
  }