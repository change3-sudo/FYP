import * as THREE from 'three';
import React, { useRef, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Cylinder } from '@react-three/drei';

const Axis = ({ axis, rotation, onDrag, objectPosition, setOrbitEnabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(new THREE.Vector3());
  const { camera, raycaster } = useThree();
  const [hoveredAxis, setHoveredAxis] = useState(null);
  const planeRef = useRef(new THREE.Plane());
  const movementDirectionRef = useRef(new THREE.Vector3());

  const getMovementPlane = useCallback(() => {
    const planeNormal = new THREE.Vector3();
    switch (axis) {
      case 'x':
        movementDirectionRef.current.set(1, 0, 0);
        planeNormal.set(0, 1, 0);
        break;
      case 'y':
        movementDirectionRef.current.set(0, 1, 0);
        planeNormal.set(1, 0, 0);
        break;
      case 'z':
        movementDirectionRef.current.set(0, 0, 1);
        planeNormal.set(0, 1, 0);
        break;
    }
    planeRef.current.setFromNormalAndCoplanarPoint(
      planeNormal,
      new THREE.Vector3(...objectPosition)
    );
  }, [axis, objectPosition]);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    setIsDragging(true);
    setOrbitEnabled(false);
    getMovementPlane();

    // Calculate the intersection point
    const intersectionPoint = new THREE.Vector3();
    raycaster.setFromCamera(
      {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      },
      camera
    );
    raycaster.ray.intersectPlane(planeRef.current, intersectionPoint);
    dragStartRef.current.copy(intersectionPoint);

    e.target.setPointerCapture(e.pointerId);
  }, [camera, raycaster, getMovementPlane, setOrbitEnabled]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;

    const intersectionPoint = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  const planeNormal = cameraDirection.negate(); // Plane normal facing towards the camera
  const translationPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, dragStartRef.current);
    raycaster.setFromCamera(
      {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      },
      camera
    );
    raycaster.ray.intersectPlane(translationPlane, intersectionPoint);

    const movementVector = intersectionPoint.sub(dragStartRef.current);
    const projectedMovement = movementVector.projectOnVector(movementDirectionRef.current);

    // Apply a scaling factor to slow down the movement
    const scalingFactor = 0.15; // Adjust this value to control the speed (smaller = slower)
    projectedMovement.multiplyScalar(scalingFactor);

    onDrag(projectedMovement);
    dragStartRef.current.add(projectedMovement);
  }, [isDragging, camera, raycaster, onDrag]);

  const handlePointerUp = useCallback((e) => {
    setIsDragging(false);
    setOrbitEnabled(true);
    e.target.releasePointerCapture(e.pointerId);
  }, [setOrbitEnabled]);

  return (
    <Cylinder
      args={[hoveredAxis === axis ? 0.07 : 0.05, hoveredAxis === axis ? 0.07 : 0.05, 3, 5]}
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
        color={hoveredAxis === axis ? "red" : "green"} 
        opacity={hoveredAxis === axis ? 0.8 : 1}
        transparent
      />
    </Cylinder>
  );
};

export default Axis;