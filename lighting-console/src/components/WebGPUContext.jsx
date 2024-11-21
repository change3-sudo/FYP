import React, { createContext, useContext, useState } from 'react';

const WebGPUContext = createContext();

export const WebGPUProvider = ({ children }) => {
  const [isWebGPUAvailable, setIsWebGPUAvailable] = useState(false);
  const [isWebGPU, setIsWebGPU] = useState(false);
  const [device, setDevice] = useState(null);

  return (
    <WebGPUContext.Provider value={{ isWebGPUAvailable, isWebGPU, device, setIsWebGPUAvailable, setIsWebGPU, setDevice }}>
      {children}
    </WebGPUContext.Provider>
  );
};

export const useWebGPU = () => {
  return useContext(WebGPUContext);
}; 