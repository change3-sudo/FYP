import * as THREE from "three";

function VolumetricSpotlight({
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
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
  });

  return material;
}

export default VolumetricSpotlight;
