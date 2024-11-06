// src/useArtNetData.js
import { useState, useEffect } from 'react';

function fetchDMXData() {
  return {
    r: Math.floor(Math.random() * 255),
    g: Math.floor(Math.random() * 255),
    b: Math.floor(Math.random() * 255),
    intensity: Math.random(), // Simulate intensity between 0 and 1
    angle: Math.PI / 6 + Math.random() * (Math.PI / 6) // Random angle between PI/6 and PI/3
  };
}

export function useArtNetData() {
  const [dmxData, setDMXData] = useState({ r: 0, g: 0, b: 0, intensity: 1, angle: Math.PI / 6 });

  useEffect(() => {
    const interval = setInterval(() => {
      setDMXData(fetchDMXData());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return dmxData;
}