import React, { Suspense } from 'react';
import { GLTFModel, OBJModel } from './3DModels'; // Import your model components
import { Sphere, Cone, Torus, Box } from './Primitives'; // Import primitives
import useFileLoader from './useFileLoader'; // Import the custom hook

const GeometryRenderer = ({ object }) => {
  if (!object) return null;
  
  const props = {
    position: object.position,
    userData: { id: object.id },
  };

  // Use the useFileLoader hook for 'gltf' and 'obj' types
  const loadedObject = (object.type === 'gltf' || object.type === 'obj') ? useFileLoader(object.file, object.type) : null;

  return (
    <group key={object.id} userData={{ id: object.id }}>
      {(() => {
        switch (object.type) {
          case 'gltf':
          case 'obj':
            // Handle the loading state and render loaded model
            return loadedObject ? (
              <primitive object={loadedObject} {...props} />
            ) : (
              <Suspense fallback={<div>Loading...</div>}>{/* Placeholder for loading state */}</Suspense>
            );
          case 'sphere':
            return <Sphere {...props} color={object.color} />;
          case 'cone':
            return <Cone {...props} color={object.color} />;
          case 'torus':
            return <Torus {...props} color={object.color} />;
          default:
            return <Box {...props} color={object.color} />;
        }
      })()}
    </group>
  );
};

export default GeometryRenderer;