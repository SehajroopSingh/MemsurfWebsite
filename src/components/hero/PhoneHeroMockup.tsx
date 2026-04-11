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
  DataTexture,
  LinearFilter,
  RGBAFormat,
  ShaderMaterial,
  SRGBColorSpace,
  UnsignedByteType,
  Vector3,
  VideoTexture,
} from 'three'
import { useAmplitude } from '@/hooks/useAmplitude'
import { HERO_PHONE_SCREEN_BG } from '@/config/video'

/** How much the screen recording covers the static BG (1 = video only; slightly lower keeps BG visible at edges). */
const SCREEN_VIDEO_OVER_BG = 0.92

/**
 * Aspect of the screen face in UV space (width/height). iPhone GLTF screen meshes usually unwrap to a
 * square 0–1 × 0–1 patch; using the physical device aspect here over-letterboxes and looks “zoomed in”.
 */
const PHONE_SCREEN_ASPECT = 1.0

/** Mild desaturation for static BG so it matches video and avoids neon oversaturation. */
const BG_DESATURATION = 0.16

/** >1 zooms the video texture out (shows more frame, less crop) after object-fit contain. */
const VIDEO_UV_EXPAND = 1.32

const SCREEN_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SCREEN_FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uBackground;
  uniform sampler2D uVideo;
  uniform float uVideoMix;
  uniform float uBgAspect;
  uniform float uVideoAspect;
  uniform float uBoxAspect;
  uniform vec3 uLetterboxColor;
  uniform float uBgDesat;
  uniform float uVideoUvExpand;

  vec3 desaturate(vec3 c, float amount) {
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    return mix(c, vec3(l), amount);
  }

  vec3 sampleContain(sampler2D tex, vec2 uv, float texAspect, float boxAspect) {
    vec2 tUv;
    if (texAspect > boxAspect) {
      float span = boxAspect / texAspect;
      float vmin = 0.5 - 0.5 * span;
      float vmax = 0.5 + 0.5 * span;
      if (uv.y < vmin || uv.y > vmax) return uLetterboxColor;
      tUv = vec2(uv.x, (uv.y - vmin) / span);
    } else {
      float span = texAspect / boxAspect;
      float umin = 0.5 - 0.5 * span;
      float umax = 0.5 + 0.5 * span;
      if (uv.x < umin || uv.x > umax) return uLetterboxColor;
      tUv = vec2((uv.x - umin) / span, uv.y);
    }
    return texture2D(tex, tUv).rgb;
  }

  vec3 sampleVideoZoomed(vec2 uv) {
    vec2 tUv;
    if (uVideoAspect > uBoxAspect) {
      float span = uBoxAspect / uVideoAspect;
      float vmin = 0.5 - 0.5 * span;
      float vmax = 0.5 + 0.5 * span;
      if (uv.y < vmin || uv.y > vmax) return uLetterboxColor;
      tUv = vec2(uv.x, (uv.y - vmin) / span);
    } else {
      float span = uVideoAspect / uBoxAspect;
      float umin = 0.5 - 0.5 * span;
      float umax = 0.5 + 0.5 * span;
      if (uv.x < umin || uv.x > umax) return uLetterboxColor;
      tUv = vec2((uv.x - umin) / span, uv.y);
    }
    tUv = clamp(vec2(0.5) + (tUv - vec2(0.5)) * uVideoUvExpand, vec2(0.0), vec2(1.0));
    return texture2D(uVideo, tUv).rgb;
  }

  void main() {
    vec3 bg = sampleContain(uBackground, vUv, uBgAspect, uBoxAspect);
    bg = desaturate(bg, uBgDesat);
    vec3 vd = sampleVideoZoomed(vUv);
    gl_FragColor = vec4(mix(bg, vd, uVideoMix), 1.0);
  }
`

interface PhoneHeroMockupProps {
  src: string
  placeholder?: string
  /** Static image behind the hero video on the phone mesh (full screen UVs). */
  screenBackgroundSrc?: string
  className?: string
  screenClassName?: string
  trackingLabel?: string
  trackingLocation?: string
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

function useHeroPhoneVideoTexture({
  src,
  trackingLabel,
  trackingLocation,
}: {
  src: string
  trackingLabel: string
  trackingLocation: string
}) {
  const { track } = useAmplitude()
  const [videoTexture, setVideoTexture] = useState<VideoTexture | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const videoAspectRef = useRef(9 / 16)

  useEffect(() => {
    let isDisposed = false
    setVideoReady(false)

    const video = document.createElement('video')
    video.src = src
    video.muted = true
    video.loop = true
    video.autoplay = true
    video.playsInline = true
    video.preload = 'auto'
    video.crossOrigin = 'anonymous'

    const videoTexture = new VideoTexture(video)
    videoTexture.colorSpace = SRGBColorSpace
    videoTexture.flipY = false
    videoTexture.minFilter = LinearFilter
    videoTexture.magFilter = LinearFilter
    videoTexture.generateMipmaps = false

    const syncVideoAspect = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        videoAspectRef.current = video.videoWidth / video.videoHeight
      }
    }
    video.addEventListener('loadedmetadata', syncVideoAspect)

    let hasTrackedStart = false
    let hasTrackedLoop = false
    let lastTime = 0

    const handleCanPlay = async () => {
      if (isDisposed) return
      setVideoReady(true)
      try {
        await video.play()
      } catch (error) {
        console.warn('Hero phone video autoplay failed:', error)
      }
    }

    const handlePlay = () => {
      if (hasTrackedStart) return
      track('video_started', {
        video_name: trackingLabel,
        location: trackingLocation,
        autoplay: true,
      })
      hasTrackedStart = true
    }

    const handleTimeUpdate = () => {
      if (!hasTrackedLoop && lastTime > video.currentTime + 0.2) {
        track('video_loop_started', {
          video_name: trackingLabel,
          location: trackingLocation,
        })
        hasTrackedLoop = true
      }
      lastTime = video.currentTime
    }

    const handleError = () => {
      const mediaError = video.error
      track('video_error', {
        video_name: trackingLabel,
        location: trackingLocation,
        error_message: mediaError?.message || 'Hero phone video failed to load',
        error_code: mediaError?.code,
      })
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('play', handlePlay)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('error', handleError)
    video.load()

    setVideoTexture(videoTexture)

    if (video.readyState >= 2) {
      handleCanPlay()
    }

    return () => {
      isDisposed = true
      video.pause()
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadedmetadata', syncVideoAspect)
      videoTexture.dispose()
    }
  }, [src, track, trackingLabel, trackingLocation])

  return { videoTexture, videoReady, videoAspectRef }
}

function PhoneModel({
  src,
  screenBackgroundSrc,
  trackingLabel,
  trackingLocation,
  isSmallViewport,
}: {
  src: string
  screenBackgroundSrc: string
  trackingLabel: string
  trackingLocation: string
  isSmallViewport: boolean
}) {
  const gltf = useGLTF('/models/iphone17pro.glb') as any
  const { videoTexture, videoReady, videoAspectRef } = useHeroPhoneVideoTexture({
    src,
    trackingLabel,
    trackingLocation,
  })

  const { gl } = useThree()
  const bgTexture = useTexture(screenBackgroundSrc)
  const screenMaterialRef = useRef<ShaderMaterial | null>(null)
  const whiteDummy = useMemo(() => {
    const t = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, RGBAFormat, UnsignedByteType)
    t.colorSpace = SRGBColorSpace
    t.needsUpdate = true
    return t
  }, [])

  useEffect(() => {
    bgTexture.colorSpace = SRGBColorSpace
    bgTexture.flipY = false
    bgTexture.minFilter = LinearFilter
    bgTexture.magFilter = LinearFilter
    const maxAniso = gl.capabilities.getMaxAnisotropy?.() ?? 1
    bgTexture.anisotropy = maxAniso
  }, [bgTexture, gl])

  useEffect(() => {
    const img = bgTexture.image as HTMLImageElement | undefined
    const applyBgAspect = () => {
      const m = screenMaterialRef.current
      if (!m || !img?.naturalWidth || !img?.naturalHeight) return
      m.uniforms.uBgAspect.value = img.naturalWidth / img.naturalHeight
    }
    applyBgAspect()
    img?.addEventListener?.('load', applyBgAspect)
    return () => img?.removeEventListener?.('load', applyBgAspect)
  }, [bgTexture])

  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])

  useEffect(() => {
    if (!scene) return

    const vt = videoTexture ?? whiteDummy

    scene.traverse((child: any) => {
      if (!child.isMesh || !child.material) return

      const materials = Array.isArray(child.material) ? child.material : [child.material]
      const nextMaterials = materials.map((material: any) => {
        const nextMaterial = material.clone()

        if (nextMaterial.name === 'Screen_BG') {
          const img = bgTexture.image as HTMLImageElement | undefined
          const bgAspect =
            img?.naturalWidth && img?.naturalHeight
              ? img.naturalWidth / img.naturalHeight
              : 16 / 9
          const screenMaterial = new ShaderMaterial({
            uniforms: {
              uBackground: { value: bgTexture },
              uVideo: { value: vt },
              uVideoMix: { value: 0 },
              uBgAspect: { value: bgAspect },
              uVideoAspect: { value: videoAspectRef.current },
              uBoxAspect: { value: PHONE_SCREEN_ASPECT },
              uLetterboxColor: { value: new Vector3(0.02, 0.02, 0.028) },
              uBgDesat: { value: BG_DESATURATION },
              uVideoUvExpand: { value: VIDEO_UV_EXPAND },
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

    return () => {
      scene.traverse((child: any) => {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((m: any) => {
          if (m?.name === 'HeroPhoneScreen') m.dispose()
        })
      })
    }
  }, [bgTexture, scene, videoTexture, whiteDummy])

  useFrame(() => {
    const m = screenMaterialRef.current
    if (!m) return
    const vid = m.uniforms.uVideo.value
    if (vid instanceof VideoTexture) {
      vid.needsUpdate = true
    }
    m.uniforms.uVideoMix.value = videoReady ? SCREEN_VIDEO_OVER_BG : 0
    m.uniforms.uVideoAspect.value = videoAspectRef.current
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
  src,
  screenBackgroundSrc,
  trackingLabel,
  trackingLocation,
  reduceMotion,
  isSmallViewport,
  dragRefs,
}: {
  src: string
  screenBackgroundSrc: string
  trackingLabel: string
  trackingLocation: string
  reduceMotion: boolean | null
  isSmallViewport: boolean
  dragRefs: PhoneDragRefs
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
          key={`${screenBackgroundSrc}-${src}`}
          src={src}
          screenBackgroundSrc={screenBackgroundSrc}
          trackingLabel={trackingLabel}
          trackingLocation={trackingLocation}
          isSmallViewport={isSmallViewport}
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
  src,
  placeholder: _placeholder,
  screenBackgroundSrc = HERO_PHONE_SCREEN_BG,
  className = '',
  screenClassName: _screenClassName = '',
  trackingLabel = 'hero_demo_video',
  trackingLocation = 'hero',
}: PhoneHeroMockupProps) {
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [isSmallViewport, setIsSmallViewport] = useState(false)
  const { overlayRef, dragRefs, overlayProps } = usePhoneHeroDrag()

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
              src={src}
              screenBackgroundSrc={screenBackgroundSrc}
              trackingLabel={trackingLabel}
              trackingLocation={trackingLocation}
              reduceMotion={reduceMotion}
              isSmallViewport={isSmallViewport}
              dragRefs={dragRefs}
            />
          </Float>
          {/* Shadow tracks horizontal scroll but remains flat on the floor */}
          <ScrollAnimatedShadow isSmallViewport={isSmallViewport} reduceMotion={reduceMotion} />
        </group>
      </Canvas>
      {/* Full-area hit target: drag anywhere in this block to rotate the phone (canvas stays non-interactive for WebGL). */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-10 cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        aria-label="Drag to rotate the phone preview"
        {...overlayProps}
      />
    </div>
  )
}
