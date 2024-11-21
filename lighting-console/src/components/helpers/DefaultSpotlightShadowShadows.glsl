// helpers/glsl/DefaultSpotlightShadowShadows.glsl

precision mediump float;

uniform sampler2D uShadowMap;
uniform float uTime;

varying vec2 vUv;

void main() {
  vec4 shadowColor = texture2D(uShadowMap, vUv);
  // Simple shadow effect: invert the shadow map
  gl_FragColor = vec4(vec3(1.0 - shadowColor.r), 1.0);
}
