// AmbientLight.jsx
import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
const AmbientLight = ({ 
  color = [1.0, 1.0, 1.0], 
  intensity = 0.5,
  onReady = () => {} 
}) => {
  const { scene } = useThree();

  useEffect(() => {
    // 創建 Three.js 環境光
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color(color[0], color[1], color[2]),
      intensity
    );

    // 添加到場景
    scene.add(ambientLight);

    // 通知準備完成
    onReady();

    // 清理函數
    return () => {
      scene.remove(ambientLight);
    };
  }, [scene, color, intensity, onReady]);

  // AmbientLight 是一個空組件，不需要渲染任何內容
  return null;
};

export default AmbientLight;
