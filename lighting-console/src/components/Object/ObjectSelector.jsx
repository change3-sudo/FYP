import React, { useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ObjectSelector = ({ selectedObject, setSelectedObject, setEnableOrbit }) => {
    const { camera, raycaster, gl, scene } = useThree();
  
    const handleClick = useCallback((event) => {
        if (event.button !== 0) return;
  
        const rect = gl.domElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
  
        const mouse = new THREE.Vector2(
            (x / rect.width) * 2 - 1,
            -(y / rect.height) * 2 + 1
        );
  
        raycaster.setFromCamera(mouse, camera);
        
        // Filter out the volumetric spotlight meshes
        const selectableObjects = scene.children.filter(obj => {
            // Check if the object is not a volumetric spotlight
            return !(obj.material && obj.material.type === 'ShaderMaterial' && 
                    obj.material.uniforms && obj.material.uniforms.lightColor);
        });
        
        const intersections = raycaster.intersectObjects(selectableObjects, true);
  
        if (intersections.length > 0) {
            const nearestObject = intersections[0].object;
            const selectedId = nearestObject.userData.id || nearestObject.parent?.userData.id;
  
            if (selectedId) {
                if (selectedObject === selectedId) {
                    setSelectedObject(null);
                    setEnableOrbit(true);
                } else {
                    setSelectedObject(selectedId);
                    setEnableOrbit(false);
                }
            }
        } else {
            if (selectedObject) {
                setSelectedObject(null);
                setEnableOrbit(true);
            }
        }
    }, [camera, raycaster, scene, selectedObject, setSelectedObject, setEnableOrbit, gl]);
  
    useEffect(() => {
        const domElement = gl.domElement;
        domElement.addEventListener('click', handleClick);
        return () => {
            domElement.removeEventListener('click', handleClick);
        };
    }, [handleClick, gl]);
  
    return null;  // This component does not render anything
};

export default ObjectSelector;