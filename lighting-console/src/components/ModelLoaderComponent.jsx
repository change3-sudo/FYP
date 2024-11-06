import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ModelLoaderComponent = ({ url, setModel }) => {
    const { scene } = useThree();

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            scene.add(gltf.scene);
            setModel(gltf.scene); // Optionally set the loaded model in a state for further use

            // Optional: Clean up URL object
            URL.revokeObjectURL(url);

            // Log model dimensions
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const size = new THREE.Vector3();
            box.getSize(size);
            console.log('Model Dimensions:', {
                width: size.x,
                height: size.y,
                depth: size.z
            });
        }, undefined, (error) => {
            console.error('An error happened:', error);
        });
    }, [url, setModel, scene]);

    return null; // This component does not render anything
};

export default ModelLoaderComponent;