import React, { createContext, useContext, useState } from 'react';

const PositionContext = createContext(null);

export const usePosition = () => useContext(PositionContext);

export const PositionProvider = ({ children }) => {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

  return (
    <PositionContext.Provider value={{ position, setPosition }}>
      {children}
    </PositionContext.Provider>
  );
};