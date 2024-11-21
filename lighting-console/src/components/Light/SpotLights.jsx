// SpotLight.js

import React, { useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react'
import {
  Mesh,
  DepthTexture,
  Vector3,
  CylinderGeometry,
  Matrix4,
  SpotLight as SpotLightImpl,
  DoubleSide,
  Texture,
  WebGLRenderTarget,
  ShaderMaterial,
  RGBAFormat,
  RepeatWrapping,
  Object3D,
} from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { FullScreenQuad } from 'three-stdlib'
import { SpotLightMaterial } from './materials/SpotLightMaterial'

// Import your custom shader

// Function to check if an Object3D is a SpotLight
const isSpotLight = (child) => {
  return child && child.isSpotLight
}

// VolumetricMesh Component
function VolumetricMesh({
  opacity = 1,
  radiusTop,
  radiusBottom,
  depthBuffer,
  color = 'white',
  distance = 5,
  angle = 0.15,
  attenuation = 5,
  anglePower = 5,
}) {
  const mesh = useRef()
  const { size, camera, viewport } = useThree()
  const dpr = viewport.dpr
  const [material] = useMemo(() => [new SpotLightMaterial()], [])
  const [vec] = useMemo(() => [new Vector3()], [])

  radiusTop = radiusTop === undefined ? 0.1 : radiusTop
  radiusBottom = radiusBottom === undefined ? angle * 7 : radiusBottom

  useFrame(() => {
    if (mesh.current) {
      material.uniforms.spotPosition.value.copy(mesh.current.getWorldPosition(vec))
      if (mesh.current.parent && mesh.current.parent.target) {
        mesh.current.lookAt(mesh.current.parent.target.getWorldPosition(vec))
      }
    }
  })

  const geometry = useMemo(() => {
    const geom = new CylinderGeometry(radiusTop, radiusBottom, distance, 128, 64, true)
    geom.applyMatrix4(new Matrix4().makeTranslation(0, -distance / 2, 0))
    geom.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2))
    return geom
  }, [distance, radiusTop, radiusBottom])

  return (
    <mesh ref={mesh} geometry={geometry} raycast={() => null}>
      <primitive
        object={material}
        attach="material"
        uniforms-opacity-value={opacity}
        uniforms-lightColor-value={color}
        uniforms-attenuation-value={attenuation}
        uniforms-anglePower-value={anglePower}
        uniforms-depth-value={depthBuffer}
        uniforms-cameraNear-value={camera.near}
        uniforms-cameraFar-value={camera.far}
        uniforms-resolution-value={depthBuffer ? [size.width * dpr, size.height * dpr] : [0, 0]}
      />
    </mesh>
  )
}

// Hook for common spotlight functionalities
function useCommon(spotlight, mesh, width, height, distance) {
  const [pos, dir] = useMemo(() => [new Vector3(), new Vector3()], [])

  useEffect(() => {
    if (isSpotLight(spotlight.current)) {
      spotlight.current.shadow.mapSize.set(width, height)
      spotlight.current.shadow.needsUpdate = true
    } else {
      throw new Error('SpotlightShadow must be a child of a SpotLight')
    }
  }, [spotlight, width, height])

  useFrame(() => {
    if (!spotlight.current) return

    const A = spotlight.current.position
    const B = spotlight.current.target.position

    dir.copy(B).sub(A)
    const len = dir.length()
    dir.normalize().multiplyScalar(len * distance)
    pos.copy(A).add(dir)

    mesh.current.position.copy(pos)
    mesh.current.lookAt(spotlight.current.target.position)
  })
}

// SpotlightShadowWithShader Component
function SpotlightShadowWithShader({
  distance = 0.4,
  alphaTest = 0.5,
  map,
  shader = SpotlightShadowShader,
  width = 512,
  height = 512,
  scale = 1,
  children,
  ...rest
}) {
  const mesh = useRef()
  const spotlight = rest.spotlightRef
  const debug = rest.debug

  useCommon(spotlight, mesh, width, height, distance)

  const renderTarget = useMemo(
    () =>
      new WebGLRenderTarget(width, height, {
        format: RGBAFormat,
        stencilBuffer: false,
      }),
    [width, height]
  )

  const uniforms = useMemo(() => ({
    uShadowMap: { value: map },
    uTime: { value: 0 },
  }), [map])

  useEffect(() => {
    if (uniforms.uShadowMap.value !== map) {
      uniforms.uShadowMap.value = map
    }
  }, [map, uniforms])

  const fsQuad = useMemo(() => new FullScreenQuad(
    new ShaderMaterial({
      uniforms: uniforms,
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: shader,
    })
  ), [shader, uniforms])

  useEffect(() => {
    return () => {
      fsQuad.material.dispose()
      fsQuad.dispose()
    }
  }, [fsQuad])

  useEffect(() => {
    return () => {
      renderTarget.dispose()
    }
  }, [renderTarget])

  useFrame(({ gl }, dt) => {
    uniforms.uTime.value += dt

    gl.setRenderTarget(renderTarget)
    fsQuad.render(gl)
    gl.setRenderTarget(null)
  })

  return (
    <mesh ref={mesh} scale={scale} castShadow>
      <planeGeometry />
      <meshBasicMaterial
        transparent
        side={DoubleSide}
        alphaTest={alphaTest}
        alphaMap={renderTarget.texture}
        map-wrapS={RepeatWrapping}
        map-wrapT={RepeatWrapping}
        opacity={debug ? 1 : 0}
      >
        {children}
      </meshBasicMaterial>
    </mesh>
  )
}

// SpotlightShadowWithoutShader Component
function SpotlightShadowWithoutShader({
  distance = 0.4,
  alphaTest = 0.5,
  map,
  width = 512,
  height = 512,
  scale,
  children,
  ...rest
}) {
  const mesh = useRef()
  const spotlight = rest.spotlightRef
  const debug = rest.debug

  useCommon(spotlight, mesh, width, height, distance)

  return (
    <mesh ref={mesh} scale={scale} castShadow>
      <planeGeometry />
      <meshBasicMaterial
        transparent
        side={DoubleSide}
        alphaTest={alphaTest}
        alphaMap={map}
        map-wrapS={RepeatWrapping}
        map-wrapT={RepeatWrapping}
        opacity={debug ? 1 : 0}
      >
        {children}
      </meshBasicMaterial>
    </mesh>
  )
}

// SpotLightShadow Component
export function SpotLightShadow(props) {
  if (props.shader) return <SpotlightShadowWithShader {...props} />
  return <SpotlightShadowWithoutShader {...props} />
}

// SpotLight Component
const SpotLight = forwardRef(({
  // Volumetric
  opacity = 1,
  radiusTop,
  radiusBottom,
  depthBuffer,
  color = 'white',
  distance = 5,
  angle = 0.15,
  attenuation = 5,
  anglePower = 5,
  volumetric = true,
  debug = false,
  children,
  ...props
}, ref) => {
  const spotlight = useRef(null)
  useImperativeHandle(ref, () => spotlight.current)

  return (
    <group>
      {debug && spotlight.current && <spotLightHelper args={[spotlight.current]} />}

      <spotLight
        ref={spotlight}
        angle={angle}
        color={color}
        distance={distance}
        castShadow
        {...props}
      >
        {volumetric && (
          <VolumetricMesh
            debug={debug}
            opacity={opacity}
            radiusTop={radiusTop}
            radiusBottom={radiusBottom}
            depthBuffer={depthBuffer}
            color={color}
            distance={distance}
            angle={angle}
            attenuation={attenuation}
            anglePower={anglePower}
          />
        )}
      </spotLight>

      {children &&
        React.cloneElement(children, {
          spotlightRef: spotlight,
          debug: debug,
        })
      }
    </group>
  )
})

export default SpotLight
