import React, { useState } from 'react';
import EditBar from './EditBar';
import AddObject from './Object/AddObject';
const Library = () => {
  const [showButtons, setShowButtons] = useState(false);
  const [geometry, setGeometry] = useState('box');
  const [color, setColor] = useState('#000000');

  const addObject = () => {
    console.log('Adding object:', { geometry, color });
    // Logic to add the object goes here
  };

  return (
    <div>
      <EditBar onEdit={() => setShowButtons(!showButtons)} />
      {showButtons && (
        <AddObject
          addObject={addObject}
          setGeometry={setGeometry}
          setColor={setColor}
          color={color}
        />
      )}
    </div>
  );
};

export default Library;