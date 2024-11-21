// components/materials/SpotLightMaterial.js

import * as THREE from 'three'

export class SpotLightMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        spotPosition: { value: new THREE.Vector3() },
        lightColor: { value: new THREE.Color(0xffffff) },
        attenuation: { value: 1.0 },
        anglePower: { value: 2.0 },
        opacity: { value: 1.0 },
        depth: { value: null },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 1000 },
        resolution: { value: new THREE.Vector2() },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 lightColor;
        uniform float attenuation;
        uniform float anglePower;
        uniform float opacity;
        uniform vec3 spotPosition;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform vec2 resolution;
        uniform sampler2D depth;

        varying vec3 vWorldPosition;

        void main() {
          // Calculate distance from light position
          float distance = length(vWorldPosition - spotPosition);
          float atten = 1.0 / (1.0 + attenuation * distance * distance);

          // Apply angle softening
          float intensity = pow(atten, anglePower);

          gl_FragColor = vec4(lightColor * intensity, opacity * intensity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })
  }
}
