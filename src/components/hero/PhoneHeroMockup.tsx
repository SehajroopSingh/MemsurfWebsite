'use client'

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useReducedMotion } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows, Float, useGLTF, useTexture } from '@react-three/drei'
import {
  DoubleSide,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
} from 'three'

const MEMSURF_LOGO_ASPECT = 850 / 512
const MEMSURF_LOGO_SCREEN_WIDTH_RATIO = 0.78
const MEMSURF_LOGO_SURFACE_OFFSET = 0.08

const SCREEN_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SCREEN_FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uScreenUvMin;
  uniform vec2 uScreenUvRange;

  float blob(vec2 uv, vec2 center, vec2 radius) {
    vec2 delta = (uv - center) / radius;
    return exp(-dot(delta, delta) * 2.15);
  }

  void main() {
    vec2 uv = clamp((vUv - uScreenUvMin) / uScreenUvRange, vec2(0.0), vec2(1.0));
    float t = uTime;
    vec3 color = vec3(0.031, 0.075, 0.114);

    color += vec3(0.310, 0.620, 0.584) * blob(uv, vec2(0.24 + sin(t * 0.31) * 0.08, 0.30 + cos(t * 0.24) * 0.06), vec2(0.38, 0.28)) * 0.42;
    color += vec3(0.325, 0.463, 0.671) * blob(uv, vec2(0.80 + sin(t * 0.23) * 0.06, 0.44 + cos(t * 0.29) * 0.08), vec2(0.34, 0.36)) * 0.38;
    color += vec3(0.420, 0.341, 0.659) * blob(uv, vec2(0.32 + cos(t * 0.28) * 0.10, 0.78 + sin(t * 0.20) * 0.05), vec2(0.40, 0.30)) * 0.36;
    color += vec3(0.549, 0.396, 0.776) * blob(uv, vec2(0.66 + cos(t * 0.35) * 0.08, 0.76 + sin(t * 0.22) * 0.07), vec2(0.30, 0.34)) * 0.32;
    color += vec3(0.467, 0.761, 0.718) * blob(uv, vec2(0.48 + sin(t * 0.38) * 0.10, 0.16 + cos(t * 0.30) * 0.04), vec2(0.32, 0.22)) * 0.30;
    color += vec3(0.537, 0.690, 0.922) * blob(uv, vec2(0.86 + cos(t * 0.26) * 0.06, 0.18 + sin(t * 0.33) * 0.06), vec2(0.24, 0.24)) * 0.26;
    color += vec3(0.690, 0.541, 0.894) * blob(uv, vec2(0.16 + sin(t * 0.42) * 0.05, 0.66 + cos(t * 0.27) * 0.08), vec2(0.26, 0.32)) * 0.28;

    float edgeVignette = smoothstep(0.20, 0.78, distance(uv, vec2(0.5)));
    color = mix(color, vec3(0.012, 0.024, 0.038), edgeVignette * 0.45);

    float logoBackdrop = 1.0 - smoothstep(0.10, 0.46, distance(uv, vec2(0.5)));
    color = mix(color, vec3(0.008, 0.015, 0.026), logoBackdrop * 0.34);

    gl_FragColor = vec4(color, 1.0);
  }
`

interface PhoneHeroMockupProps {
  className?: string
  screenLogoSrc?: string
  onReady?: () => void
}

type PhoneDragRefs = {
  isDraggingRef: React.MutableRefObject<boolean>
  dragTargetRef: React.MutableRefObject<{ x: number; y: number }>
  dragCurrentRef: React.MutableRefObject<{ x: number; y: number }>
  dragVelocityRef: React.MutableRefObject<{ x: number; y: number }>
}

function clampDrag(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** Shared drag state for the full-area overlay + ScrollAnimatedPhone spring. */
function usePhoneHeroDrag() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const activePointerIdRef = useRef<number | null>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const dragTargetRef = useRef({ x: 0, y: 0 })
  const dragCurrentRef = useRef({ x: 0, y: 0 })
  const dragVelocityRef = useRef({ x: 0, y: 0 })

  const dragRefs: PhoneDragRefs = useMemo(
    () => ({
      isDraggingRef,
      dragTargetRef,
      dragCurrentRef,
      dragVelocityRef,
    }),
    []
  )

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    isDraggingRef.current = true
    activePointerIdRef.current = e.pointerId
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    overlayRef.current?.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || activePointerIdRef.current !== e.pointerId) return
    e.preventDefault()
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    dragTargetRef.current.x = clampDrag(-dy * 0.003, -0.45, 0.45)
    dragTargetRef.current.y = clampDrag(dx * 0.0035, -0.65, 0.65)
  }, [])

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return
    isDraggingRef.current = false
    activePointerIdRef.current = null
    try {
      overlayRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* capture may already be released */
    }
  }, [])

  return {
    overlayRef,
    dragRefs,
    overlayProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    } as const,
  }
}

function PhoneModel({
  screenLogoSrc,
  reduceMotion,
  isSmallViewport,
  onReady,
}: {
  screenLogoSrc: string
  reduceMotion: boolean | null
  isSmallViewport: boolean
  onReady?: () => void
}) {
  const gltf = useGLTF('/models/iphone17pro.glb') as any
  const { gl } = useThree()
  const logoTexture = useTexture(screenLogoSrc)
  const screenMaterialRef = useRef<ShaderMaterial | null>(null)
  const logoOverlayRefs = useRef<Mesh[]>([])

  useEffect(() => {
    logoTexture.colorSpace = SRGBColorSpace
    logoTexture.flipY = true
    logoTexture.minFilter = LinearFilter
    logoTexture.magFilter = LinearFilter
    const maxAniso = gl.capabilities.getMaxAnisotropy?.() ?? 1
    logoTexture.anisotropy = maxAniso
    logoTexture.needsUpdate = true
  }, [logoTexture, gl])

  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])

  useEffect(() => {
    if (!scene) return
    let readyFrame: number | null = null

    scene.traverse((child: any) => {
      if (!child.isMesh || !child.material) return

      const materials = Array.isArray(child.material) ? child.material : [child.material]
      const nextMaterials = materials.map((material: any) => {
        const nextMaterial = material.clone()

        if (nextMaterial.name === 'Screen_BG' || nextMaterial.name === 'HeroPhoneScreen') {
          const position = child.geometry?.attributes?.position
          const uv = child.geometry?.attributes?.uv
          const uvMin = new Vector2(0, 0)
          const uvRange = new Vector2(1, 1)
          let minX = Infinity
          let minY = Infinity
          let minZ = Infinity
          let maxX = -Infinity
          let maxY = -Infinity
          let maxZ = -Infinity

          if (position) {
            for (let i = 0; i < position.count; i += 1) {
              const x = position.getX(i)
              const y = position.getY(i)
              const z = position.getZ(i)
              minX = Math.min(minX, x)
              minY = Math.min(minY, y)
              minZ = Math.min(minZ, z)
              maxX = Math.max(maxX, x)
              maxY = Math.max(maxY, y)
              maxZ = Math.max(maxZ, z)
            }

            const screenWidth = maxX - minX
            const centerX = (minX + maxX) / 2
            const centerY = (minY + maxY) / 2
            const centerZ = (minZ + maxZ) / 2

            if (screenWidth > 0.001 && Number.isFinite(centerX) && Number.isFinite(centerY) && Number.isFinite(centerZ)) {
              const logoWidth = screenWidth * MEMSURF_LOGO_SCREEN_WIDTH_RATIO
              const logoHeight = logoWidth / MEMSURF_LOGO_ASPECT
              const logoGeometry = new PlaneGeometry(logoWidth, logoHeight)
              const logoMaterial = new MeshBasicMaterial({
                map: logoTexture,
                transparent: true,
                toneMapped: false,
                depthWrite: false,
                side: DoubleSide,
              })
              const logoMesh = new Mesh(logoGeometry, logoMaterial)

              logoMesh.name = 'HeroPhoneLogoOverlay'
              logoMesh.position.set(centerX, centerY - MEMSURF_LOGO_SURFACE_OFFSET, centerZ)
              logoMesh.rotation.x = Math.PI / 2
              logoMesh.renderOrder = 8

              child.add(logoMesh)
              logoOverlayRefs.current.push(logoMesh)
            }
          }

          if (uv) {
            let minU = Infinity
            let minV = Infinity
            let maxU = -Infinity
            let maxV = -Infinity

            for (let i = 0; i < uv.count; i += 1) {
              const u = uv.getX(i)
              const v = uv.getY(i)
              minU = Math.min(minU, u)
              minV = Math.min(minV, v)
              maxU = Math.max(maxU, u)
              maxV = Math.max(maxV, v)
            }

            if (Number.isFinite(minU) && Number.isFinite(minV) && Number.isFinite(maxU) && Number.isFinite(maxV)) {
              uvMin.set(minU, minV)
              uvRange.set(Math.max(maxU - minU, 0.0001), Math.max(maxV - minV, 0.0001))
            }
          }

          const screenMaterial = new ShaderMaterial({
            uniforms: {
              uTime: { value: 0 },
              uScreenUvMin: { value: uvMin },
              uScreenUvRange: { value: uvRange },
            },
            vertexShader: SCREEN_VERTEX_SHADER,
            fragmentShader: SCREEN_FRAGMENT_SHADER,
            toneMapped: false,
          })
          screenMaterial.name = 'HeroPhoneScreen'
          screenMaterialRef.current = screenMaterial
          return screenMaterial
        }

        if (nextMaterial.name === 'Screen_Glass') {
          nextMaterial.transparent = true
          nextMaterial.opacity = 0.24
          nextMaterial.depthWrite = false
        }

        return nextMaterial
      })

      child.material = Array.isArray(child.material) ? nextMaterials : nextMaterials[0]
    })

    readyFrame = window.requestAnimationFrame(() => {
      onReady?.()
    })

    return () => {
      if (readyFrame != null) {
        window.cancelAnimationFrame(readyFrame)
      }
      logoOverlayRefs.current.forEach((overlay) => {
        overlay.parent?.remove(overlay)
        overlay.geometry.dispose()
        const materials = Array.isArray(overlay.material) ? overlay.material : [overlay.material]
        materials.forEach((material) => material.dispose())
      })
      logoOverlayRefs.current = []
      scene.traverse((child: any) => {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((m: any) => {
          if (m?.name === 'HeroPhoneScreen') m.dispose()
        })
      })
      screenMaterialRef.current = null
    }
  }, [logoTexture, onReady, scene])

  useFrame(({ clock }) => {
    const m = screenMaterialRef.current
    if (!m) return
    m.uniforms.uTime.value = reduceMotion ? 0 : clock.getElapsedTime()
  })

  const modelScale = isSmallViewport ? 1.02 : 1.08

  return (
    <group position={[0, 0, 0]} dispose={null} rotation={[0, 0, 0]} scale={modelScale}>
      <primitive object={scene} />
    </group>
  )
}

// Preload to avoid pop-in
useGLTF.preload('/models/iphone17pro.glb')

// Internal component to handle scroll-linked rotation/translation via useFrame
function ScrollAnimatedPhone({
  screenLogoSrc,
  reduceMotion,
  isSmallViewport,
  dragRefs,
  onReady,
}: {
  screenLogoSrc: string
  reduceMotion: boolean | null
  isSmallViewport: boolean
  dragRefs: PhoneDragRefs
  onReady?: () => void
}) {
  const groupRef = React.useRef<any>(null)
  const { isDraggingRef, dragTargetRef, dragCurrentRef, dragVelocityRef } = dragRefs

  useFrame(() => {
    if (!groupRef.current) return
    
    // Calculate scroll progress (0 to 1 over first 800px)
    const scrollY = window.scrollY || 0
    const progress = reduceMotion ? 0 : Math.min(scrollY / 800, 1)
    
    // Lerp from initial to final values based on scroll progress
    // Desktop: tighter sweep + less outer offset so phone stays nearer layout center.
    const startX = isSmallViewport ? -0.45 : -0.55
    const endX = isSmallViewport ? 0.45 : 0.55
    // Desktop: higher Y = phone sits toward top of canvas (aligns with headline row)
    const startY = isSmallViewport ? -1.95 : -1.55
    const endY = isSmallViewport ? -1.15 : -0.75
    
    const targetRotX = -0.55 * (1 - progress)
    const targetRotY = -0.45 * (1 - progress)
    const targetRotZ = -0.065 * (1 - progress)
    const targetPosX = startX + (endX - startX) * progress
    const targetPosY = startY + (endY - startY) * progress

    // When not dragging, spring target returns to zero so it "bounces back" to base pose.
    if (!isDraggingRef.current) {
      dragTargetRef.current.x = 0
      dragTargetRef.current.y = 0
    }

    // Spring back to base pose when released (softer settle, less wobble).
    const springK = 0.11
    const damping = 0.88
    dragVelocityRef.current.x =
      (dragVelocityRef.current.x + (dragTargetRef.current.x - dragCurrentRef.current.x) * springK) * damping
    dragVelocityRef.current.y =
      (dragVelocityRef.current.y + (dragTargetRef.current.y - dragCurrentRef.current.y) * springK) * damping
    dragCurrentRef.current.x += dragVelocityRef.current.x
    dragCurrentRef.current.y += dragVelocityRef.current.y

    groupRef.current.rotation.x +=
      (targetRotX + dragCurrentRef.current.x - groupRef.current.rotation.x) * 0.05
    groupRef.current.rotation.y +=
      (targetRotY + dragCurrentRef.current.y - groupRef.current.rotation.y) * 0.05
    groupRef.current.rotation.z += (targetRotZ - groupRef.current.rotation.z) * 0.04
    groupRef.current.position.x += (targetPosX - groupRef.current.position.x) * 0.04
    groupRef.current.position.y += (targetPosY - groupRef.current.position.y) * 0.04
  })

  return (
    <group
      ref={groupRef}
      rotation={[-0.55, -0.45, -0.065]} // Y: stronger turn toward viewer; keep in sync with targetRotY at scroll 0
      // Nudge starting Y down slightly on mobile so the top isn't cut off when scaled up
      position={[isSmallViewport ? -0.45 : -0.55, isSmallViewport ? -1.95 : -1.55, 0]}
      scale={isSmallViewport ? 1.26 : 1.14}
    >
      <Suspense
        fallback={
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[1.1, 2.2, 0.12]} />
            <meshStandardMaterial color="#2a2a2c" metalness={0.85} roughness={0.2} />
          </mesh>
        }
      >
        <PhoneModel
          key={screenLogoSrc}
          screenLogoSrc={screenLogoSrc}
          reduceMotion={reduceMotion}
          isSmallViewport={isSmallViewport}
          onReady={onReady}
        />
      </Suspense>
    </group>
  )
}

function ScrollAnimatedShadow({ isSmallViewport, reduceMotion }: any) {
  const shadowRef = React.useRef<any>(null)

  useFrame(() => {
    if (!shadowRef.current) return
    const scrollY = window.scrollY || 0
    const progress = reduceMotion ? 0 : Math.min(scrollY / 800, 1)

    // Calculate exact same horizontal path as the phone
    const startX = isSmallViewport ? -0.45 : -0.55
    const endX = isSmallViewport ? 0.45 : 0.55
    const targetPosX = startX + (endX - startX) * progress

    // Smooth dampening to match phone exactly
    shadowRef.current.position.x += (targetPosX - shadowRef.current.position.x) * 0.04
  })

  // Shadow stays fixed at Y floor (-2.7 is below the phone bounds)
  // Small +X on ContactShadows nudges blob under the tilted body.
  return (
    <group ref={shadowRef} position={[isSmallViewport ? -0.45 : -0.55, isSmallViewport ? -2.7 : -2.25, 0]}>
      <ContactShadows
        position={[0.35, 0, 0]}
        opacity={0.65}
        scale={isSmallViewport ? 14 : 12}
        blur={2.5}
        far={4.5}
        color="#000000"
      />
    </group>
  )
}

export default function PhoneHeroMockup({
  screenLogoSrc = '/logos/memsurf-logo.svg',
  className = '',
  onReady,
}: PhoneHeroMockupProps) {
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [isSmallViewport, setIsSmallViewport] = useState(false)
  const { overlayRef, dragRefs, overlayProps } = usePhoneHeroDrag()
  const allowDragRotation = !isSmallViewport

  // Avoid SSR issues with R3F
  useEffect(() => {
    setMounted(true)
    const checkViewport = () => {
      setIsSmallViewport(window.innerWidth < 1024)
    }
    checkViewport()
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [])

  if (!mounted) return <div className={`relative w-full min-h-[470px] md:min-h-[700px] ${className}`} />

  return (
    <div className={`relative w-full h-[470px] md:h-[700px] overflow-visible ${className}`}>
      <Canvas
        camera={{ position: [0, 1.55, 7.15], fov: 43 }}
        dpr={[1, 2]}
        className="w-full h-full"
        style={{ pointerEvents: 'none' }}
        onCreated={({ camera }) => {
          const desktop = typeof window !== 'undefined' && window.innerWidth >= 1024
          if (desktop) {
            camera.position.set(0, 1.45, 6.85)
            camera.lookAt(0, -1.22, 0)
          } else {
            camera.position.set(0, 1.65, 7.6)
            camera.lookAt(0, -1.65, 0)
          }
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.2} />
        
        <Environment preset="city" />

        {/* Group containing both phone and shadow so they move together if needed,
            but here we just position the shadow relative to the base */}
        <group position={[isSmallViewport ? 0 : 0.35, isSmallViewport ? 0.2 : 0.45, 0]}>
          <Float
            speed={reduceMotion ? 0 : 2.85}
            rotationIntensity={reduceMotion ? 0 : 0.55}
            floatIntensity={reduceMotion ? 0 : 0.5}
            floatingRange={[-0.12, 0.12]}
          >
            <ScrollAnimatedPhone
              screenLogoSrc={screenLogoSrc}
              reduceMotion={reduceMotion}
              isSmallViewport={isSmallViewport}
              dragRefs={dragRefs}
              onReady={onReady}
            />
          </Float>
          {/* Shadow tracks horizontal scroll but remains flat on the floor */}
          <ScrollAnimatedShadow isSmallViewport={isSmallViewport} reduceMotion={reduceMotion} />
        </group>
      </Canvas>
      {allowDragRotation && (
        /* Full-area hit target: drag anywhere in this block to rotate the phone (canvas stays non-interactive for WebGL). */
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 cursor-grab touch-none select-none active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          aria-label="Drag to rotate the phone preview"
          {...overlayProps}
        />
      )}
    </div>
  )
}
