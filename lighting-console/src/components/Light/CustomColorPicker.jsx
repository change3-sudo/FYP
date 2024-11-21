import React, { useRef, useEffect, useState } from 'react';

const CustomColorPicker = ({ onChange }) => {
  const canvasRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState('#ffffff');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Draw the color gradient (example using a simple linear gradient)
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.17, 'yellow');
    gradient.addColorStop(0.33, 'green');
    gradient.addColorStop(0.5, 'cyan');
    gradient.addColorStop(0.67, 'blue');
    gradient.addColorStop(0.83, 'magenta');
    gradient.addColorStop(1, 'red');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add a gradient for brightness
    const brightnessGradient = ctx.createLinearGradient(0, 0, 0, height);
    brightnessGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    brightnessGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = brightnessGradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const color = `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
    setSelectedColor(color);
    onChange(color);
  };

  return (
    <div>
      <canvas ref={canvasRef} width={300} height={300} onClick={handleClick} />
      <div style={{ backgroundColor: selectedColor, width: '100px', height: '100px', marginTop: '10px' }}></div>
    </div>
  );
};

export default CustomColorPicker;
