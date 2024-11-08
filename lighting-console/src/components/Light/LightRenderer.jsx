import React from 'react';
import Spot from './Spot';
const LightRenderer = ({ light, isSelected, intensity  }) => {
    if (!light) return null;

    const props = {
        position: light.position,
        focusPoint: light.focusPoint,
        color: isSelected ? 'red' : (light.color || 'white'),
        intensity: intensity || light.intensity,
        userData: { id: light.id },
        id:light.id
    };
    const materialProps = {
        color: isSelected ? 'red' : light.color, // Highlight if selected
      };
    // Log to see what's being passed to Spot

    return (
        
        <Spot {...materialProps} {...props}      shadow-mapSize-width={1024}
        shadow-mapSize-height={1024} />
    );
};

export default LightRenderer;
