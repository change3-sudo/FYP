// cueUtils.js
export const recordCue = (allLights, cues, calculateFocusPoint, onCuesUpdate) => {
  if (!allLights || allLights.length === 0) return cues;

  const newCue = {
    name: `Cue ${cues.length + 1}`,
    lightStates: allLights.map(light => ({
      id: light.id,
      position: { ...light.position },
      intensity: light.intensity,
      color: light.color,
      focusPoint: calculateFocusPoint(light.position)
    }))
  };

  const updatedCues = [...cues, newCue];
  console.log(updatedCues);

  if (onCuesUpdate) {
    onCuesUpdate(updatedCues);
  }

  return updatedCues;
};
