import React from 'react';
import Spot from './Spot';
const LightRenderer = ({ light, isSelected, intensity  }) => {
    if (!light) return null;
    console.log("Light light:", light);

    const props = {
        position: light.position,
        focusPoint: light.focusPoint,
        color: isSelected ? 'red' : (light.color || 'white'),
        intensity: intensity || light.intensity,
        userData: { id: light.id }
    };
    const materialProps = {
        color: isSelected ? 'red' : light.color, // Highlight if selected
      };
    // Log to see what's being passed to Spot
    console.log("light userData:", props.userData);

    return (
        
        <Spot {...materialProps} {...props} />
    );
};

export default LightRenderer;
