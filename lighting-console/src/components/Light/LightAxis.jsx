import * as THREE from 'three';
import React, { useRef, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Cylinder } from '@react-three/drei';

const LightAxis = React.memo(({ 
  axis, 
  rotation, 
  onDrag, 
  onDragEnd, 
  objectPosition,
  color = '#FFD700',
  length = 3, // 修改为与 Axis 相同的长度
  radius = 0.05 // 修改为与 Axis 相同的半径
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartRef = useRef(new THREE.Vector3());
  const { camera, raycaster } = useThree();
  const [hoveredAxis, setHoveredAxis] = useState(null);
  const planeRef = useRef(new THREE.Plane());
  const movementDirectionRef = useRef(new THREE.Vector3());

  // 获取移动平面
  const getMovementPlane = useCallback(() => {
    const planeNormal = new THREE.Vector3();
    switch (axis) {
      case 'x':
        movementDirectionRef.current.set(1, 0, 0);
        planeNormal.set(0, 0, 1);
        break;
      case 'y':
        movementDirectionRef.current.set(0, 1, 0);
        planeNormal.set(0, 0, 1);
        break;
      case 'z':
        movementDirectionRef.current.set(0, 0, 1);
        planeNormal.set(1, 0, 0);
        break;
      default:
        console.warn(`Unknown axis: ${axis}`);
    }
    planeRef.current.setFromNormalAndCoplanarPoint(
      planeNormal,
      new THREE.Vector3(...objectPosition)
    );
  }, [axis, objectPosition]);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    setIsDragging(true);
    getMovementPlane();

    const intersectionPoint = new THREE.Vector3();
    raycaster.setFromCamera(
      {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      },
      camera
    );
    raycaster.ray.intersectPlane(planeRef.current, intersectionPoint);
    dragStartRef.current.copy(intersectionPoint);
    e.target.setPointerCapture(e.pointerId);
  }, [camera, raycaster, getMovementPlane]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;

    const intersectionPoint = new THREE.Vector3();
    raycaster.setFromCamera(
      {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      },
      camera
    );

    if (raycaster.ray.intersectPlane(planeRef.current, intersectionPoint)) {
      const movementVector = intersectionPoint.clone().sub(dragStartRef.current);
      const projectedMovement = new THREE.Vector3();
      projectedMovement.copy(movementDirectionRef.current);
      projectedMovement.multiplyScalar(movementVector.dot(movementDirectionRef.current));

      const scalingFactor = 0.05;
      projectedMovement.multiplyScalar(scalingFactor);

      onDrag?.({
        x: projectedMovement.x,
        y: projectedMovement.y,
        z: projectedMovement.z,
      });
      dragStartRef.current.copy(intersectionPoint);
    }
  }, [isDragging, camera, raycaster, onDrag]);

  const handlePointerUp = useCallback((e) => {
    if (isDragging && onDragEnd) {
      onDragEnd();
    }
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  }, [isDragging, onDragEnd]);

  return (
    <Cylinder
      args={[hoveredAxis === axis ? 0.07 : 0.05, hoveredAxis === axis ? 0.07 : 0.05, 3, 5]} // 修改参数以匹配 Axis
      position={objectPosition}
      rotation={rotation}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={() => setHoveredAxis(axis)}
      onPointerOut={() => setHoveredAxis(null)}
    >
      <meshBasicMaterial
        attach="material"
        color={hoveredAxis === axis ? 'red' : 'green'}
        opacity={hoveredAxis === axis ? 0.8 : 1}
        transparent
      />
    </Cylinder>
  );
});

export default LightAxis; 