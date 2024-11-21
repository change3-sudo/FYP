import React from 'react';
import Spot from './Spot';

const LightRenderer = React.memo(({ light, onFixtureIdChange }) => {
  if (!light) return null;

  const props = {
    position: light.position,
    color: light.color || 'white',
    intensity: light.intensity,
    id: light.id,
    onFixtureIdChange,
  };

  return <Spot {...props} />;
});

export default LightRenderer;

