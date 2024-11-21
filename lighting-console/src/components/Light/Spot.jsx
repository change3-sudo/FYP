import React, { useRef, useEffect, useMemo, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useThree, useLoader,useFrame } from '@react-three/fiber';
import { Object3D, BoxGeometry, MeshBasicMaterial ,Vector3} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const calculatePower = (intensity) => {
  const scalingFactor = 150 * Math.pow(intensity, 2);
  return intensity * scalingFactor;
};

function VolumetricSpotlightMaterial({
  lightColor = "cyan",
  spotPosition = new THREE.Vector3(0, 0, 0),
  attenuation = 5.0,
  anglePower = 1.2,
  intensity = 0.4,
} = {}) {
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    uniform vec3 lightColor;
    uniform vec3 spotPosition;
    uniform float attenuation;
    uniform float anglePower;
    uniform vec3 viewVector;
    uniform float intensity;
    uniform float eclipseRadius;

    void main() {
      float distanceIntensity;
      distanceIntensity = distance(vWorldPosition, spotPosition) / attenuation;
      distanceIntensity = 1.0 - clamp(distanceIntensity, 0.0, 1.0);
      
      vec3 normal = vec3(vNormal.x, vNormal.y, abs(vNormal.z));
      vec3 viewDir = normalize(viewVector - vWorldPosition);
      float viewAngle = max(dot(normal, viewDir), 0.0);
      float angleIntensity = pow(viewAngle, anglePower);
      
      vec2 centered = vUv * 2.0 - 1.0;
      float dist = length(centered);
      
      distanceIntensity *= mix(1.0, angleIntensity, 0.5);
      
      gl_FragColor = vec4(lightColor, distanceIntensity * intensity);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      attenuation: { value: attenuation },
      anglePower: { value: anglePower },
      spotPosition: { value: spotPosition },
      lightColor: { value: new THREE.Color(lightColor) },
      intensity: { value: intensity },
      viewVector: { value: new THREE.Vector3() },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
  });

  return material;
}

const CustomVolSpotlight = React.forwardRef(function MyVolSpotlight(props, ref) {
  const custom = useRef();
  const spotlight = useRef();
  const spotlightHelper = useRef();
  const { scene, camera, gl } = useThree();

  useEffect(() => {
    if (spotlight.current) {
      // Create the SpotLightHelper
      spotlightHelper.current = new THREE.SpotLightHelper(spotlight.current);
      scene.add(spotlightHelper.current);

      // Cleanup function to remove the helper when the component unmounts
      return () => {
        scene.remove(spotlightHelper.current);
      };
    }
  }, [scene]);

  useFrame(() => {
    if (spotlightHelper.current) {
      spotlightHelper.current.update();
    }
  });

  useEffect(() => {
    // Enable shadow maps in the renderer
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.BasicShadowMap;
  }, [gl]);

  const {
    angle = 0.3,
    penumbra = 0.1,
    distance = 5000,
    color = 'white',
    intensity = 1,
    position = new THREE.Vector3(0, 0, 0),
    target = new THREE.Object3D(),
    attenuation=30
  } = props;

  useEffect(() => {
    if (custom.current) {
      custom.current.renderOrder = 2;
    }
    if (spotlight.current) {
      spotlight.current.renderOrder = 1;
    }
  }, []);

  useEffect(() => {
    if (!custom.current || !spotlight.current) return;
  
    spotlight.current.target.position.copy(target.position);
    scene.add(spotlight.current.target);
  
    const radius = Math.tan(angle /2) * distance;
    const height = distance;
  
    custom.current.geometry = new THREE.ConeGeometry(radius, height, 32, 30, 40, true);
    custom.current.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -height / 2, 0));
    custom.current.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  
    if (custom.current.material) {
      custom.current.material.uniforms.lightColor.value = new THREE.Color(color);
      custom.current.material.uniforms.intensity.value = intensity;
      custom.current.material.uniforms.spotPosition.value.copy(position);
      custom.current.material.uniforms.attenuation.value = attenuation;
      custom.current.material.uniforms.anglePower.value = penumbra *30; // Adjust for penumbra effect
      custom.current.material.uniforms.anglePower.value = angle; // 或通过一个转换公式
    }
  }, [scene, color, position, angle, penumbra, camera, distance, target, intensity,attenuation]);
  
//it may be the problem
  const updateCount = useRef(0);
  const lastUpdate = useRef(0);

  useFrame(({ camera }) => {
    const now = performance.now();
    if (now - lastUpdate.current < 16.67) return; // 限制为约60fps
    
    if (!custom.current) return;
    updateCount.current++;

    if (updateCount.current % 3 === 0) {
      requestAnimationFrame(() => {
        if (!custom.current) return;
        
        custom.current.lookAt(target.position);
        
        // 缓存计算结果
        const fovCalculation = THREE.MathUtils.degToRad(camera.fov) / 2;
        const scale = 2 * Math.tan(fovCalculation) * camera.far;
        
        custom.current.scale.setScalar(scale);
        
        if (custom.current.material?.uniforms) {
          custom.current.material.uniforms.viewVector.value.setFromMatrixPosition(camera.matrixWorld);
        }
      });
    }
    
    lastUpdate.current = now;
  });

  const setRef = useCallback((el) => {
    custom.current = el;
    if (ref) {
      ref.current = el;
    }
  }, [ref]);

  return (
    <>
      <spotLight
        castShadow
        ref={spotlight}
        angle={angle / 2}
        penumbra={penumbra}
        distance={10}
        color={"red"}
        decay={0}
        power={calculatePower(intensity)}
        raycast={() => null}
        renderOrder={1}
        position={position}
        target={target}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      <mesh ref={setRef} position={position} renderOrder={2} raycast={() => null}>
        <primitive
          attach="material"
          object={VolumetricSpotlightMaterial({
            lightColor: "red",
            attenuation: attenuation * 1.5,
            anglePower: angle,
            intensity: intensity,
          })}
        />
      </mesh>
    </>
  );
});
const Spot = React.memo(forwardRef(({ selectedLightStack, angle, color, distance, penumbra, attenuation, position, focusPoint, intensity, id, onFixtureIdChange, ...props }, ref) => {
  const lightRef = useRef();
  const fixtureRef = useRef();
  const boxRef = useRef();
  const { scene } = useThree();

  // Load the GLTF model
  const gltf = useLoader(GLTFLoader, './fixture.gltf');

  // Create a static target for the spotlight
  const staticTarget = useMemo(() => {
    const target = new Object3D();
    scene.add(target);
    return target;
  }, [scene]);

  useImperativeHandle(ref, () => ({
    updateLight: ({ position, color, intensity, newFocusPoint }) => {
      if (lightRef.current) {
        if (position) {
          fixtureRef.current.position.set(...position);
        }
        if (color) lightRef.current.color.set(color);
        if (intensity) lightRef.current.intensity = intensity;
        if (newFocusPoint) {
          staticTarget.position.set(...newFocusPoint);
          updateFixtureOrientation();
        }
      }
    },
    getFixtureRef: () => fixtureRef.current
  }));

  useEffect(() => () => scene.remove(staticTarget), [scene, staticTarget]);

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.userData.id = id;
    }
    if (boxRef.current) {
      boxRef.current.userData.id = id;
    }
  }, [id]);

  const clonedScene = useMemo(() => {
    const clone = gltf.scene.clone();
    clone.userData.spotId = id;
    clone.traverse((child) => {
      if (child.isMesh) {
        child.userData.spotId = id;
        child.material = child.material.clone();
      }
    });
    return clone;
  }, [gltf.scene, id]);

  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child.isMesh && child.userData.spotId === id) {
          const isSelected = Array.isArray(selectedLightStack) && selectedLightStack.includes(id);
          child.material.color.set(isSelected ? '#ffff00' : '#ffffff');
        }
      });
    }
  }, [selectedLightStack, clonedScene, id]);

  useFrame(() => {
    if (fixtureRef.current && staticTarget) {
      // 限制更新频率
      if (fixtureRef.current.updateCount === undefined) {
        fixtureRef.current.updateCount = 0; // 初始化计数器
      }
      fixtureRef.current.updateCount++;

      if (fixtureRef.current.updateCount % 5 === 0) { // 每5帧更新一次
        const direction = new THREE.Vector3();
        direction.subVectors(staticTarget.position, fixtureRef.current.position);
        direction.normalize();

        const rotation = new THREE.Euler();
        rotation.setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(1, 0, 0),
          direction
        ));

        fixtureRef.current.rotation.set(
          rotation.x + Math.PI / 2,
          rotation.y + Math.PI / 2,
          rotation.z - Math.PI / 2
        );
      }
    }
  });

  useEffect(() => {
    if (fixtureRef.current) {
      fixtureRef.current.userData.id = id;
      if (onFixtureIdChange) {
        onFixtureIdChange(id);
      }
    }
  }, [id, onFixtureIdChange]);

  // Function to update fixture orientation
  const updateFixtureOrientation = () => {
    if (fixtureRef.current && staticTarget) {
      const fixturePosition = new Vector3();
      fixtureRef.current.getWorldPosition(fixturePosition);

      // Calculate direction from fixture to target
      const direction = new Vector3().subVectors(
        new Vector3(...focusPoint),
        fixturePosition
      ).normalize();

      // Apply rotation to fixture
      fixtureRef.current.lookAt(new Vector3(...focusPoint));
      
      // Adjust for your model's default orientation if needed
      fixtureRef.current.rotation.x += Math.PI / 2;
    }
  }

  return (
    <group position={position}>
      <CustomVolSpotlight
        ref={lightRef}
        target={staticTarget}
        position={[0, 0, 0]}
        angle={angle}
        penumbra={penumbra}
        distance={distance}
        attenuation={attenuation}
        color={color}
        intensity={intensity}
        {...props}
      />
      <mesh
        ref={boxRef}
        geometry={new BoxGeometry(0.5, 0.5, 0.5)}
        position={[0, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        visible={true} // Set to true for debugging
        castShadow
      >
        <meshBasicMaterial transparent={true} opacity={0} />
      </mesh>
      <group ref={fixtureRef} rotation={[0, 0, 0]}>
        <mesh
          scale={[0.5, 0.5, 0.5]}
          position={[0, 0, 0]}
          castShadow
        >
          <primitive object={clonedScene} />
        </mesh>
      </group>
      <primitive object={staticTarget} />
    </group>
  );
}));

export default Spot;
