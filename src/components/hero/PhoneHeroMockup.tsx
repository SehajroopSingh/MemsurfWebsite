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
  SRGBColorSpace,
} from 'three'

const HERO_PHONE_SCREEN_CONTENT = '/images/hero-phone-screen.png'
const SCREEN_CONTENT_INSET = 0.98
const SCREEN_SURFACE_OFFSET = 0.02

/** Aspect-ratio box for the WebGL canvas (tune after visual QA). */
const PHONE_HERO_ASPECT_CLASS = 'aspect-[672/470] md:aspect-[672/700]'

interface PhoneHeroMockupProps {
  className?: string
  screenContentSrc?: string
  onReady?: () => void
}

function PhoneHeroCanvasFrame({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`relative w-full h-fit overflow-visible ${className}`}>
      <div className={`relative w-full ${PHONE_HERO_ASPECT_CLASS} max-w-full`}>
        {children}
      </div>
    </div>
  )
}

function canCreateWebGLContext() {
  if (typeof window === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    const gl = window.WebGLRenderingContext
      ? canvas.getContext('webgl2') || canvas.getContext('webgl')
      : null

    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(gl)
  } catch {
    return false
  }
}

function PhoneHeroFallback({
  className = '',
  screenContentSrc = HERO_PHONE_SCREEN_CONTENT,
  onReady,
}: PhoneHeroMockupProps) {
  useEffect(() => {
    onReady?.()
  }, [onReady])

  return (
    <PhoneHeroCanvasFrame className={className}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[390px] w-[195px] -rotate-[7deg] rounded-[2.4rem] border border-white/25 bg-[#111318] shadow-[0_34px_90px_rgba(0,0,0,0.55)] md:h-[560px] md:w-[280px] md:rounded-[3.3rem]">
          <div className="absolute inset-[0.55rem] overflow-hidden rounded-[1.95rem] bg-[#08131d] md:inset-[0.75rem] md:rounded-[2.55rem]">
            <img
              src={screenContentSrc}
              alt="MemSurf app home screen"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </div>
          <div className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-black/65 md:top-5 md:h-7 md:w-28" />
        </div>
      </div>
    </PhoneHeroCanvasFrame>
  )
}

class PhoneHeroCanvasBoundary extends React.Component<
  {
    children: React.ReactNode
    fallback: React.ReactNode
  },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('PhoneHeroMockup WebGL failed', error)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
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
  screenContentSrc,
  isSmallViewport,
  onReady,
}: {
  screenContentSrc: string
  isSmallViewport: boolean
  onReady?: () => void
}) {
  const gltf = useGLTF('/models/iphone17pro.glb') as any
  const { gl } = useThree()
  const screenTexture = useTexture(screenContentSrc)
  const screenOverlayRefs = useRef<Mesh[]>([])

  useEffect(() => {
    screenTexture.colorSpace = SRGBColorSpace
    screenTexture.flipY = true
    screenTexture.minFilter = LinearFilter
    screenTexture.magFilter = LinearFilter
    const maxAniso = gl.capabilities.getMaxAnisotropy?.() ?? 1
    screenTexture.anisotropy = maxAniso
    screenTexture.needsUpdate = true
  }, [screenTexture, gl])

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
            const screenHeight = maxY - minY
            const centerX = (minX + maxX) / 2
            const centerY = (minY + maxY) / 2
            const centerZ = (minZ + maxZ) / 2

            if (
              screenWidth > 0.001 &&
              screenHeight > 0.001 &&
              Number.isFinite(centerX) &&
              Number.isFinite(centerY) &&
              Number.isFinite(centerZ)
            ) {
              const planeWidth = screenWidth * SCREEN_CONTENT_INSET
              const planeHeight = screenHeight * SCREEN_CONTENT_INSET
              const screenGeometry = new PlaneGeometry(planeWidth, planeHeight)
              const screenMaterial = new MeshBasicMaterial({
                map: screenTexture,
                toneMapped: false,
                depthWrite: false,
                side: DoubleSide,
              })
              const screenMesh = new Mesh(screenGeometry, screenMaterial)

              screenMesh.name = 'HeroPhoneScreenContent'
              screenMesh.position.set(centerX, centerY - SCREEN_SURFACE_OFFSET, centerZ)
              screenMesh.rotation.x = Math.PI / 2
              screenMesh.renderOrder = 8

              child.add(screenMesh)
              screenOverlayRefs.current.push(screenMesh)
            }
          }

          const screenBgMaterial = new MeshBasicMaterial({
            color: '#08131d',
            toneMapped: false,
          })
          screenBgMaterial.name = 'HeroPhoneScreen'
          return screenBgMaterial
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
      screenOverlayRefs.current.forEach((overlay) => {
        overlay.parent?.remove(overlay)
        overlay.geometry.dispose()
        const materials = Array.isArray(overlay.material) ? overlay.material : [overlay.material]
        materials.forEach((material) => material.dispose())
      })
      screenOverlayRefs.current = []
      scene.traverse((child: any) => {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((m: any) => {
          if (m?.name === 'HeroPhoneScreen') m.dispose()
        })
      })
    }
  }, [onReady, scene, screenTexture])

  const modelScale = isSmallViewport ? 1.02 : 1.08

  return (
    <group position={[0, 0, 0]} dispose={null} rotation={[0, 0, 0]} scale={modelScale}>
      <primitive object={scene} />
    </group>
  )
}

// Preload to avoid pop-in
useGLTF.preload('/models/iphone17pro.glb')
useTexture.preload(HERO_PHONE_SCREEN_CONTENT)

// Internal component to handle scroll-linked rotation/translation via useFrame
function ScrollAnimatedPhone({
  screenContentSrc,
  reduceMotion,
  isSmallViewport,
  dragRefs,
  onReady,
}: {
  screenContentSrc: string
  reduceMotion: boolean | null
  isSmallViewport: boolean
  dragRefs: PhoneDragRefs
  onReady?: () => void
}) {
  const groupRef = React.useRef<any>(null)
  const { isDraggingRef, dragTargetRef, dragCurrentRef, dragVelocityRef } = dragRefs

  useFrame(() => {
    if (!groupRef.current) return

    const scrollY = window.scrollY || 0
    const progress = reduceMotion ? 0 : Math.min(scrollY / 800, 1)

    const startX = isSmallViewport ? -0.45 : -0.55
    const endX = isSmallViewport ? 0.45 : 0.55
    const startY = isSmallViewport ? -1.95 : -1.55
    const endY = isSmallViewport ? -1.15 : -0.75

    const targetRotX = -0.55 * (1 - progress)
    const targetRotY = -0.45 * (1 - progress)
    const targetRotZ = -0.065 * (1 - progress)
    const targetPosX = startX + (endX - startX) * progress
    const targetPosY = startY + (endY - startY) * progress

    if (!isDraggingRef.current) {
      dragTargetRef.current.x = 0
      dragTargetRef.current.y = 0
    }

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
      rotation={[-0.55, -0.45, -0.065]}
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
          key={screenContentSrc}
          screenContentSrc={screenContentSrc}
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

    const startX = isSmallViewport ? -0.45 : -0.55
    const endX = isSmallViewport ? 0.45 : 0.55
    const targetPosX = startX + (endX - startX) * progress

    shadowRef.current.position.x += (targetPosX - shadowRef.current.position.x) * 0.04
  })

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
  screenContentSrc = HERO_PHONE_SCREEN_CONTENT,
  className = '',
  onReady,
}: PhoneHeroMockupProps) {
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [isSmallViewport, setIsSmallViewport] = useState(false)
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null)
  const { overlayRef, dragRefs, overlayProps } = usePhoneHeroDrag()
  const allowDragRotation = !isSmallViewport

  useEffect(() => {
    setMounted(true)
    setWebglAvailable(canCreateWebGLContext())
    const checkViewport = () => {
      setIsSmallViewport(window.innerWidth < 1024)
    }
    checkViewport()
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [])

  if (!mounted || webglAvailable === null) {
    return (
      <PhoneHeroCanvasFrame className={className}>
        <div className="absolute inset-0" aria-hidden />
      </PhoneHeroCanvasFrame>
    )
  }

  const fallback = (
    <PhoneHeroFallback
      className={className}
      screenContentSrc={screenContentSrc}
      onReady={onReady}
    />
  )

  if (!webglAvailable) return fallback

  return (
    <PhoneHeroCanvasBoundary fallback={fallback}>
      <PhoneHeroCanvasFrame className={className}>
        <Canvas
          camera={{ position: [0, 1.55, 7.15], fov: 43 }}
          dpr={[1, 2]}
          className="absolute inset-0 h-full w-full"
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

          <group position={[isSmallViewport ? 0 : 0.35, isSmallViewport ? 0.2 : 0.45, 0]}>
            <Float
              speed={reduceMotion ? 0 : 2.85}
              rotationIntensity={reduceMotion ? 0 : 0.55}
              floatIntensity={reduceMotion ? 0 : 0.5}
              floatingRange={[-0.12, 0.12]}
            >
              <ScrollAnimatedPhone
                screenContentSrc={screenContentSrc}
                reduceMotion={reduceMotion}
                isSmallViewport={isSmallViewport}
                dragRefs={dragRefs}
                onReady={onReady}
              />
            </Float>
            <ScrollAnimatedShadow isSmallViewport={isSmallViewport} reduceMotion={reduceMotion} />
          </group>
        </Canvas>
        {allowDragRotation && (
          <div
            ref={overlayRef}
            className="absolute inset-0 z-10 cursor-grab touch-none select-none active:cursor-grabbing"
            style={{ touchAction: 'none' }}
            aria-label="Drag to rotate the phone preview"
            {...overlayProps}
          />
        )}
      </PhoneHeroCanvasFrame>
    </PhoneHeroCanvasBoundary>
  )
}
