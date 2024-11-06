import React, { useState } from 'react';
import Buttons from './Buttons';
import ObjectInspector from './ObjectInspector';

const SceneEditor = () => {
  const [selectedObject, setSelectedObject] = useState(null);

  const updateObject = (property, value) => {
    // Update the selected object's property in your 3D scene or state
    console.log(`Update ${property}:`, value);
  };

  return (
    <div>
      <Buttons addObject={console.log} isVisible={true} />
      {selectedObject && <ObjectInspector selectedObject={selectedObject} updateObject={updateObject} />}
    </div>
  );
};

export default SceneEditor;