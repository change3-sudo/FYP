import React, { createContext, useContext, useState } from 'react';

const DimensionsContext = createContext();

export const useDimensions = () => useContext(DimensionsContext);

export const DimensionsProvider = ({ children }) => {
  const [dimensions, setDimensions] = useState({ width: 1, height: 1, depth: 1 });

  const updateDimensions = (newDimensions) => {
    setDimensions(newDimensions);
  };

  return (
    <DimensionsContext.Provider value={{ dimensions, updateDimensions }}>
      {children}
    </DimensionsContext.Provider>
  );
};