import React, { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';

const calculatePower = (intensity) => {
  return intensity * 100; // Example scaling factor
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

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    uniform vec3 lightColor;
    uniform vec3 spotPosition;
    uniform float attenuation;
    uniform float anglePower;
    uniform vec3 viewVector;
    uniform float intensity;

    void main() {
      float distanceIntensity;
      distanceIntensity = distance(vWorldPosition, spotPosition) / attenuation;
      distanceIntensity = 1.0 - clamp(distanceIntensity, 0.0, 1.0);
      vec3 normal = vec3(vNormal.x, vNormal.y, abs(vNormal.z));
      vec3 viewDir = normalize(viewVector - vWorldPosition);
      float viewAngle = max(dot(normal, viewDir), 0.0);
      float angleIntensity = pow(viewAngle, anglePower);
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
      viewVector: { value: new THREE.Vector3() }, // Placeholder, updated in render loop
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
  const { scene } = useThree();

  const {
    angle = 0.3,
    penumbra = 0.1,
    distance = 5000,
    color = 'white',
    intensity = 1,
    position = new THREE.Vector3(0, 0, 0),
    target = new THREE.Object3D(),
  } = props;

  useEffect(() => {
    if (custom.current) {
      custom.current.renderOrder = 2; // Ensure it renders after other objects
    }
    if (spotlight.current) {
      spotlight.current.renderOrder = 1;
    }
  }, []);

  useEffect(() => {
    if (!custom.current || !spotlight.current) return;

    spotlight.current.target.position.copy(target.position);
    scene.add(spotlight.current.target);

    const radius = Math.tan(angle / 2) * distance;
    const height = distance;

    custom.current.geometry = new THREE.ConeGeometry(radius, height, 64, 30, 40, true);
    custom.current.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -height / 2, 0));
    custom.current.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    // Set shader uniforms
    if (custom.current.material) {
      custom.current.material.uniforms.lightColor.value = new THREE.Color(color);
      custom.current.material.uniforms.intensity.value = intensity;
    }
  }, [scene, color, position, angle, distance, target, intensity]);

  useFrame(({ camera }) => {
    if (!custom.current) return;

    custom.current.lookAt(target.position);

    const fovHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.far;
    const fovWidth = fovHeight * camera.aspect;
    const scale = Math.max(fovWidth, fovHeight);
    custom.current.scale.set(scale, scale, camera.far);

    if (custom.current.material) {
      custom.current.material.uniforms.viewVector.value.setFromMatrixPosition(camera.matrixWorld);
    }
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
        angle={angle}
        penumbra={penumbra}
        distance={0}
        color={color}
        decay={0}
        power={calculatePower(intensity)} // Use calculated power
        raycast={() => null}
        renderOrder={1}
      />

      <mesh ref={setRef} position={position} renderOrder={2} raycast={() => null}>
        <primitive
          attach="material"
          object={VolumetricSpotlightMaterial({
            lightColor: color,
            attenuation: 30,
            anglePower: 8,
            intensity: intensity, // Use the same intensity
          })}
        />
      </mesh>
    </>
  );
});

export default CustomVolSpotlight;
