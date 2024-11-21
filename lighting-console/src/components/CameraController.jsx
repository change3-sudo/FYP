import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

function CameraController() {
    const { camera } = useThree();
    const lastUpdate = useRef(0);

    useFrame(() => {
        const now = performance.now();
        if (now - lastUpdate.current < 32) return; // 约30fps就足够了
        
        if (camera.position.y < 1.1) {
            requestAnimationFrame(() => {
                camera.position.y = 1.1;
            });
        }
        
        lastUpdate.current = now;
    });

    return null; // 该组件不渲染任何内容
}

export default React.memo(CameraController);