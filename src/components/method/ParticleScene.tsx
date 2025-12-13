'use client'

import React, { useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { useScroll, ScrollControls, Scroll, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { random } from 'maath'

// --- SHADER MATERIAL ---
// We'll use a custom shader to morph between 4 sets of positions based on a 'progress' uniform.

const ParticleMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 }, // 0..3 (representing the 4 stages)
        uColor1: { value: new THREE.Color('#8c648d') }, // Memsurf Purple - visible on white
        uColor2: { value: new THREE.Color('#16a34a') }, // Darker Green for visibility
        uColor3: { value: new THREE.Color('#2563eb') }, // Darker Blue
    },
    vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    
    attribute vec3 aPosition0;
    attribute vec3 aPosition1;
    attribute vec3 aPosition2;
    attribute vec3 aPosition3;
    attribute float aShape3Type;
    
    varying vec2 vUv;
    varying float vProgress;
    varying vec3 vPos;
    varying float vShape3Type;

    // Cubic Bezier helper for smooth transitions
    float ease(float t) {
      return t * t * (3.0 - 2.0 * t);
    }

    void main() {
      vUv = uv;
      vProgress = uProgress;
      vShape3Type = aShape3Type; // Pass type to fragment

      vec3 pos = position; // Fallback
      
      // Morph Logic
      // Stage 0 -> 1
      if (uProgress <= 1.0) {
        float t = ease(uProgress);
        pos = mix(aPosition0, aPosition1, t);
      } 
      // Stage 1 -> 2
      else if (uProgress <= 2.0) {
        float t = ease(uProgress - 1.0);
        pos = mix(aPosition1, aPosition2, t);
      } 
      // Stage 2 -> 3
      else {
        float t = ease(uProgress - 2.0);
        pos = mix(aPosition2, aPosition3, t);
      }
      
      vPos = pos; // Pass final position to fragment for spatial-based color effects

      // Add some noise/breathing based on time
      pos.x += sin(uTime * 0.5 + pos.y) * 0.1;
      pos.y += cos(uTime * 0.3 + pos.x) * 0.1;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      // Size attenuation - Increased base size significantly
      gl_PointSize = 50.0 * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform float uProgress;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    
    varying vec3 vPos;
    varying float vShape3Type;

    void main() {
      // Circular particle with soft edge
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;

      vec3 color = uColor1;
      
      // Dynamic coloring based on progress
      if (uProgress > 0.5 && uProgress < 1.5) {
         color = mix(uColor1, uColor3, uProgress - 0.5); // Purple -> Blue
      } else if (uProgress >= 1.5 && uProgress < 2.5) {
         color = mix(uColor3, uColor2, (uProgress - 1.5)); // Blue -> Greenish (Transition)
      } else if (uProgress >= 2.5) {
         // STAGE 3: FORGETTING CURVE ANIMATION
         // Base color is a dark tech blue
         vec3 baseCurveColor = vec3(0.1, 0.2, 0.4);
         
         // Create a wave moving along X
         float waveSpeed = 4.0;
         float loopX = mod(uTime * waveSpeed, 24.0) - 10.0; // Sweeps from -10 to 14
         
         float distToWave = abs(vPos.x - loopX);
         
         if (vShape3Type > 0.5) {
             // SPIKE PARTICLES (Vertical Jumps)
             // Flash bright green when the wave hits them
             float flash = smoothstep(1.5, 0.0, distToWave);
             color = mix(vec3(0.0, 0.3, 0.0), uColor2, flash); // Dark Green -> Bright Green
         } else {
             // CURVE PARTICLES
             // Subtle flow effect
             float flow = smoothstep(2.0, 0.0, distToWave);
             color = mix(baseCurveColor, vec3(0.4, 0.6, 1.0), flow);
         }
      }

      // Slightly higher opacity for white background
      gl_FragColor = vec4(color, 1.0); 
    }
  `
}

// Create properly typed shader material component
class MorphMaterial extends THREE.ShaderMaterial {
    constructor() {
        super(ParticleMaterial)
    }
}
extend({ MorphMaterial })

function Particles() {
    const scroll = useScroll()
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    // COUNT
    // COUNT - Increased for density
    const count = 30000

    // GENERATE POSITIONS
    const [positions0, positions1, positions2, positions3, positions3Type] = useMemo(() => {
        // 0: CHAOS / CLOUD
        const p0 = new Float32Array(count * 3)
        random.inSphere(p0, { radius: 15 })

        // 1: UNDERSTANDING (Brain-like sphere with surface details)
        const p1 = new Float32Array(count * 3)
        // Create a sphere but concentrate points in lobes
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(Math.random() * 2 - 1)
            const r = 4 // Base radius

            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            p1[i * 3] = x
            p1[i * 3 + 1] = y
            p1[i * 3 + 2] = z
        }

        // 2: QUIZZES (Staircase / Grid structure)
        const p2 = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            // Create 4 distinct steps/planes
            const step = i % 4
            const x = (Math.random() - 0.5) * 10
            const z = (Math.random() - 0.5) * 10
            // Steps go up
            const y = (step - 1.5) * 2.5

            p2[i * 3] = x + (step * 2) // Offset x slightly for stairs effect
            p2[i * 3 + 1] = y
            p2[i * 3 + 2] = z
        }

        // 3: SPACED REPETITION (The Forgetting Curve Sawtooth)
        const p3 = new Float32Array(count * 3)
        const shape3Type = new Float32Array(count) // 1.0 for spike, 0.0 for curve

        for (let i = 0; i < count; i++) {
            // Divide into 3 distinct 'waves' or 'ridges' to show the spaced repetition effect
            const ridge = Math.floor(Math.random() * 3)

            // x: Time axis (-10 to 10)
            let xBase = 0
            let decayRate = 0
            let startHeight = 8 // Maximum retention height
            let segmentWidth = 6.0

            // Shift x based on ridge index to create a sequence
            // Ridge 0: x = -10 to -4
            // Ridge 1: x = -4 to 2
            // Ridge 2: x = 2 to 10

            // Normalized progression t within the ridge (0..1)
            const t = Math.random()

            // Define Sawtooth Parameters
            if (ridge === 0) {
                // First Learning: Fast Drop
                xBase = -8
                decayRate = 2.0
            } else if (ridge === 1) {
                // First Review: Slower Drop
                xBase = -2
                decayRate = 5.0
            } else {
                // Second Review: Very Slow Drop (Almost Flat)
                xBase = 4
                decayRate = 12.0
            }

            const x = xBase + (t * segmentWidth)

            // y: Retention (Exponential Decay)
            const y = startHeight * Math.exp(-(t * segmentWidth * 1.5) / (decayRate * 0.5)) - 4

            // Add 'spike' / 'wall' particles explicitly at the start of ridges 1 and 2 to show the "Quiz" effect
            // We'll hijack some particles to form vertical lines at the refresh points
            if (Math.random() < 0.05) {
                // Vertical Quiz Spikes
                const spikeX = ridge === 1 ? -2 : (ridge === 2 ? 4 : -8)
                p3[i * 3] = spikeX + (Math.random() * 0.2) // Tight X
                p3[i * 3 + 1] = (Math.random() * startHeight) - 4 // Full height
                p3[i * 3 + 2] = (Math.random() - 0.5) * 10 // Full width

                shape3Type[i] = 1.0; // MARK AS SPIKE
            } else {
                // The Curve Surface
                // z: Width variation (Surface)
                const z = (Math.random() - 0.5) * 12

                p3[i * 3] = x
                p3[i * 3 + 1] = y
                p3[i * 3 + 2] = z

                shape3Type[i] = 0.0; // MARK AS CURVE
            }
        }

        return [p0, p1, p2, p3, shape3Type]
    }, [])

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta

            // Map scroll offset (0..1) to our 3 transition stages (0..3)
            // ... (keeping existing logic) ...

            // Adjust progress mapping slightly to fully engage Stage 3
            const progress = scroll.offset * 3
            materialRef.current.uniforms.uProgress.value = progress
        }
    })

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions0} itemSize={3} />
                <bufferAttribute attach="attributes-aPosition0" count={count} array={positions0} itemSize={3} />
                <bufferAttribute attach="attributes-aPosition1" count={count} array={positions1} itemSize={3} />
                <bufferAttribute attach="attributes-aPosition2" count={count} array={positions2} itemSize={3} />
                <bufferAttribute attach="attributes-aPosition3" count={count} array={positions3} itemSize={3} />
                <bufferAttribute attach="attributes-aShape3Type" count={count} array={positions3Type} itemSize={1} />
            </bufferGeometry>
            {/* @ts-ignore */}
            <morphMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.NormalBlending} />
        </points>
    )
}

// --- DATA FOR SECTIONS ---

type SectionData = {
    id: number
    stepLabel?: string
    title: string
    shortDesc: string
    color: string
    align: 'left' | 'right'
    details: React.ReactNode
}

const SECTIONS: SectionData[] = [
    {
        id: 0,
        title: "Morphic Learning",
        shortDesc: "Where a memory agent adapts to your content, your context, and your goals.",
        color: "#1f2937", // dim
        align: 'left',
        details: (
            <div className="h-full w-full flex flex-col md:flex-row items-center justify-center p-4 md:p-12 gap-8 md:gap-16 max-w-7xl mx-auto relative">
                {/* Left: The Promise */}
                <div className="md:w-1/2 space-y-8 text-center md:text-left z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-200/30 bg-purple-500/10 backdrop-blur-md text-purple-300 font-bold text-xs tracking-widest uppercase mb-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                        Core Engine
                    </div>
                    <h3 className="text-5xl md:text-7xl font-black text-gray-900 leading-[0.95] tracking-tighter">
                        Your Memory, <br />
                        <span className="relative inline-block">
                            <span className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 blur-2xl opacity-20"></span>
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 drop-shadow-sm">
                                On Autopilot.
                            </span>
                        </span>
                    </h3>
                    <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light max-w-lg mx-auto md:mx-0">
                        Most tools turn remembering into a task. <span className="font-semibold text-gray-900 border-b-2 border-purple-200">MemSurf turns it into a system.</span>
                    </p>

                    {/* Core Thesis Line */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                        <p className="text-lg text-gray-800 font-medium italic relative z-10">
                            "You decide what’s worth remembering. <br />
                            The <span className="text-purple-600 font-bold not-italic">agent</span> optimizes how it sticks."
                        </p>
                    </div>
                </div>

                {/* Right: The Process Pipeline */}
                <div className="md:w-1/2 flex flex-col gap-6 relative z-0 perspective-[1000px]">
                    {/* Connecting Line (The Pipeline) */}
                    <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-transparent via-gray-300 to-transparent hidden md:block opacity-50 border-l border-dashed border-gray-300"></div>

                    {/* 1. Any Input - Floating Glass */}
                    <div className="relative group md:pl-16 transition-all duration-500 hover:-translate-y-1">
                        {/* Connector Dot */}
                        <div className="absolute left-8 top-1/2 w-3 h-3 bg-gray-400 rounded-full border-2 border-white shadow-sm transform -translate-x-1.5 -translate-y-1/2 hidden md:block z-10 group-hover:bg-purple-500 transition-colors"></div>

                        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-lg hover:shadow-purple-500/10 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-16 h-16 text-purple-600 transform rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                            </div>
                            <h4 className="flex items-center gap-3 font-bold text-gray-900 mb-2">
                                <span className="p-2 bg-gradient-to-br from-gray-100 to-white rounded-lg text-gray-700 shadow-sm border border-gray-100">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </span>
                                Any Input
                            </h4>
                            <p className="text-gray-600 text-sm leading-relaxed relative z-10">
                                Notes, articles, lectures, voice memos—MemSurf treats them all as inputs to your memory, not assignments to manage.
                            </p>
                        </div>
                    </div>

                    {/* 2. Smart Analysis - Processing Unit */}
                    <div className="relative group md:pl-16 transition-all duration-500 hover:-translate-y-1 delay-75">
                        {/* Connector Dot */}
                        <div className="absolute left-8 top-1/2 w-3 h-3 bg-gray-400 rounded-full border-2 border-white shadow-sm transform -translate-x-1.5 -translate-y-1/2 hidden md:block z-10 group-hover:bg-indigo-500 transition-colors"></div>

                        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-indigo-100/50 shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 relative overflow-hidden">
                            {/* Scanning line effect */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 animate-scan"></div>

                            <h4 className="flex items-center gap-3 font-bold text-gray-900 mb-2">
                                <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-indigo-200/30 animate-pulse"></div>
                                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                </span>
                                An Agent That Handles It
                            </h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                It interprets your input in context, determines how it should be reinforced, and adapts continuously. <strong className="text-indigo-600">No flashcards. No scheduling.</strong>
                            </p>
                        </div>
                    </div>

                    {/* 3. The Result - The Gem */}
                    <div className="relative group md:pl-16 transition-all duration-500 hover:scale-105 delay-150">
                        {/* Connector Dot */}
                        <div className="absolute left-8 top-1/2 w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-md transform -translate-x-2 -translate-y-1/2 hidden md:block z-10 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>

                        <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl text-white relative overflow-hidden border border-gray-700 group-hover:border-purple-500/50 transition-colors">
                            {/* Background Effects */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -ml-5 -mb-5"></div>

                            <div className="relative z-10">
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-300 mb-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                    The Result?
                                </h4>
                                <p className="text-2xl font-bold leading-snug text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">
                                    Remembering stops feeling like work. Send it in. Show up. The agent does the rest.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 1,
        stepLabel: "Step 01",
        title: "Lessons Built for Understanding",
        shortDesc: "MemSurf’s AI interprets your content in context, designing a purpose-built learning path tailored to your goals and pace.",
        color: "#8c648d",
        align: 'right',
        details: (
            <div className="h-full flex flex-col items-center justify-center p-4 md:p-12 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center max-w-4xl mb-12">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 font-bold text-xs tracking-wider uppercase mb-4">
                        Contextual Intelligence
                    </div>
                    <h3 className="text-3xl md:text-5xl font-extrabold mb-6 text-gray-900 leading-tight">
                        Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Deep Understanding.</span>
                    </h3>
                    <p className="text-xl text-gray-700 leading-relaxed">
                        When you add content, MemSurf’s AI learning agent interprets it in context. It looks at the material through the lens of <span className="italic font-medium text-gray-900">how understanding should form</span>, then designs a guided learning flow tailored to you—your goals, your pace, and how this information fits into what you already know.
                    </p>
                </div>

                {/* The 3 Decisions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                    {/* Card 1 */}
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-purple-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100/50 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-purple-200/50"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 font-bold text-lg">1</div>
                            <h4 className="font-bold text-gray-900 text-lg mb-2">Priority</h4>
                            <p className="text-gray-600">The agent determines <strong>what to introduce first</strong>, laying the groundwork before complexity increases.</p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-indigo-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100/50 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-indigo-200/50"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4 font-bold text-lg">2</div>
                            <h4 className="font-bold text-gray-900 text-lg mb-2">Connection</h4>
                            <p className="text-gray-600">It decides <strong>what to connect and reinforce</strong>, linking new ideas to concepts you've already mastered.</p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-pink-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-pink-100/50 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-pink-200/50"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-4 font-bold text-lg">3</div>
                            <h4 className="font-bold text-gray-900 text-lg mb-2">Pacing</h4>
                            <p className="text-gray-600">It knows <strong>what to hold back</strong> until your foundation is ready, preventing cognitive overload.</p>
                        </div>
                    </div>
                </div>

                {/* Conclusion */}
                <div className="w-full max-w-4xl bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center gap-8">
                    <div className="md:w-3/4 relative z-10">
                        <h4 className="text-2xl font-bold text-white mb-2">A Coherent Mental Structure.</h4>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            Not a pile of notes. You’re not following a generic lesson. You’re moving through a purpose-built learning path, shaped specifically to help understanding emerge naturally—and stay.
                        </p>
                    </div>
                    <div className="md:w-1/4 flex justify-center relative z-10">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center animate-pulse">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
                </div>
            </div>
        )
    },
    {
        id: 2,
        stepLabel: "Step 02",
        title: "Quizzes That Grow With You",
        shortDesc: "Questions aren't random. They build step-by-step, like a staircase, taking you from basic recognition to complex application.",
        color: "#2563eb",
        align: 'left',
        details: (
            <div className="h-full flex flex-col lg:flex-row gap-12 items-start justify-center p-4 md:p-12">
                {/* Left: Logic Core (Sticky) */}
                <div className="lg:w-1/3 flex flex-col justify-center space-y-8 lg:sticky lg:top-20">
                    <div>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs tracking-wider uppercase mb-3 border border-blue-100">
                            Adaptive Difficulty
                        </div>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                            Building Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Knowledge Stack.</span>
                        </h3>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            We don't just test you. We construct a robust mental model, layer by layer, starting from the foundation.
                        </p>
                    </div>

                    {/* Glass HUD */}
                    <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            The Progression
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">1</span>
                                Establish Base
                            </li>
                            <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                                deepening Logic
                            </li>
                            <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">3</span>
                                Active Retrieval
                            </li>
                            <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">4</span>
                                Real-World Mastery
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right: The Connected Spine */}
                <div className="lg:w-2/3 w-full relative">
                    {/* The Center Line (Spine) */}
                    <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-400 via-blue-500 to-rose-500 rounded-full opacity-30 md:transform md:-translate-x-1/2"></div>

                    <div className="space-y-8 md:space-y-12">
                        {/* Level 01: Left Side */}
                        <div className="relative flex flex-col md:flex-row items-center md:justify-end md:pr-12 group">
                            {/* Connector Dot */}
                            <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-emerald-400 rounded-full border-4 border-white shadow-md transform -translate-x-1/2 z-10"></div>
                            {/* Card */}
                            <div className="w-full md:w-[45%] bg-white/60 backdrop-blur-xl p-6 rounded-2xl border-l-4 border-l-emerald-400 shadow-sm hover:shadow-xl transition-all ml-16 md:ml-0 md:text-right group-hover:-translate-x-2">
                                <div className="text-emerald-800 font-extrabold text-4xl mb-2 opacity-20 absolute top-2 right-4 md:left-4 md:right-auto">01</div>
                                <div className="flex flex-col md:items-end">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Introduction</span>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Foundational</h4>
                                    <p className="text-sm text-gray-600 mb-3">Establishes the vocabulary and core concepts needed for higher-level thinking.</p>
                                    <div className="inline-flex items-center px-3 py-1 bg-emerald-100/50 text-emerald-700 text-xs font-bold rounded-full">True/False • MCQs</div>
                                </div>
                            </div>
                        </div>

                        {/* Level 02: Right Side */}
                        <div className="relative flex flex-col md:flex-row items-center md:justify-start md:pl-12 group">
                            {/* Connector Dot */}
                            <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-blue-400 rounded-full border-4 border-white shadow-md transform -translate-x-1/2 z-10"></div>
                            {/* Card */}
                            <div className="w-full md:w-[45%] bg-white/60 backdrop-blur-xl p-6 rounded-2xl border-l-4 md:border-l-0 md:border-r-4 border-blue-400 shadow-sm hover:shadow-xl transition-all ml-16 md:ml-0 group-hover:translate-x-2">
                                <div className="text-blue-800 font-extrabold text-4xl mb-2 opacity-20 absolute top-2 right-4">02</div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Comprehension</span>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Analytical</h4>
                                    <p className="text-sm text-gray-600 mb-3">Challenges you to differentiate similar concepts and spot logical errors.</p>
                                    <div className="inline-flex items-center px-3 py-1 bg-blue-100/50 text-blue-700 text-xs font-bold rounded-full">Find Error • Logic</div>
                                </div>
                            </div>
                        </div>

                        {/* Level 03: Left Side */}
                        <div className="relative flex flex-col md:flex-row items-center md:justify-end md:pr-12 group">
                            {/* Connector Dot */}
                            <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-md transform -translate-x-1/2 z-10"></div>
                            {/* Card */}
                            <div className="w-full md:w-[45%] bg-white/60 backdrop-blur-xl p-6 rounded-2xl border-l-4 border-purple-500 shadow-sm hover:shadow-xl transition-all ml-16 md:ml-0 md:text-right group-hover:-translate-x-2">
                                <div className="text-purple-800 font-extrabold text-4xl mb-2 opacity-20 absolute top-2 right-4 md:left-4 md:right-auto">03</div>
                                <div className="flex flex-col md:items-end">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-1">Synthesizing</span>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Retrieval</h4>
                                    <p className="text-sm text-gray-600 mb-3">Removes the training wheels. You must generate the answer from scratch.</p>
                                    <div className="inline-flex items-center px-3 py-1 bg-purple-100/50 text-purple-700 text-xs font-bold rounded-full">Short Answer • Explain</div>
                                </div>
                            </div>
                        </div>

                        {/* Level 04: Right Side */}
                        <div className="relative flex flex-col md:flex-row items-center md:justify-start md:pl-12 group">
                            {/* Connector Dot */}
                            <div className="absolute left-8 md:left-1/2 w-6 h-6 bg-rose-500 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 z-10 shadow-rose-200">
                                <div className="absolute inset-0 bg-rose-400 animate-ping rounded-full opacity-75"></div>
                            </div>
                            {/* Card */}
                            <div className="w-full md:w-[45%] bg-gradient-to-br from-rose-50 to-white/80 backdrop-blur-xl p-6 rounded-2xl border-l-4 md:border-l-0 md:border-r-4 border-rose-500 shadow-md hover:shadow-2xl transition-all ml-16 md:ml-0 group-hover:translate-x-2">
                                <div className="text-rose-800 font-extrabold text-4xl mb-2 opacity-20 absolute top-2 right-4">04</div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-1">Application</span>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Mastery</h4>
                                    <p className="text-sm text-gray-600 mb-3">The ultimate test. Applying knowledge to diagnose new, unseen scenarios.</p>
                                    <div className="inline-flex items-center px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">Diagnosis • Scenarios</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )
    },
    {
        id: 3,
        stepLabel: "Step 03",
        title: "Spaced Repetition That Sticks",
        shortDesc: "Every interaction feeds into a living memory model that adapts to you over time, ensuring review happens right before forgetting sets in.",
        color: "#16a34a",
        align: 'right',
        details: (
            <div className="h-full flex flex-col items-center justify-center p-4 md:p-12 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center max-w-4xl mb-12">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 font-bold text-xs tracking-wider uppercase mb-4">
                        Adaptive Recall
                    </div>
                    <h3 className="text-3xl md:text-5xl font-extrabold mb-6 text-gray-900 leading-tight">
                        Memory Fades on a Curve. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">MemSurf Works Against It.</span>
                    </h3>
                    <p className="text-xl text-gray-700 leading-relaxed">
                        Every interaction feeds into a living memory model that adapts to you over time. Instead of fixed schedules or generic reminders, MemSurf continuously adjusts when each idea should resurface—so review happens <span className="italic font-medium text-gray-900">right before</span> forgetting sets in.
                    </p>
                </div>

                {/* The rhythm grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                    {/* Card 1 */}
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-green-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-100/50 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-green-200/50"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 font-bold text-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg mb-2">Reinforce</h4>
                            <p className="text-gray-600">Reinforces understanding through <strong>well-timed recall</strong>, ensuring concepts stay fresh.</p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-teal-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-teal-100/50 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-teal-200/50"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 mb-4 font-bold text-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg mb-2">Strength</h4>
                            <p className="text-gray-600">Strengthens memory by making retrieval <strong>slightly effortful</strong> (desirable difficulty).</p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/50 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-emerald-200/50"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4 font-bold text-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg mb-2">Efficiency</h4>
                            <p className="text-gray-600">Replaces cramming with <strong>short, high-impact reviews</strong> that respect your time.</p>
                        </div>
                    </div>
                </div>

                {/* Conclusion */}
                <div className="w-full max-w-4xl bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center gap-8">
                    <div className="md:w-3/4 relative z-10">
                        <h4 className="text-2xl font-bold text-white mb-2">You Don’t Review Everything.</h4>
                        <p className="text-gray-300 text-lg leading-relaxed mb-4">
                            You review what matters, when it matters. Progress feels light, consistent, and surprisingly durable.
                        </p>
                        <p className="text-green-300 font-medium text-lg">
                            Because remembering isn’t about repetition alone. It’s about timing.
                        </p>
                    </div>
                    <div className="md:w-1/4 flex justify-center relative z-10">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center animate-pulse">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
                </div>
            </div>
        )
    }
]

function HTMLOverlay() {
    const scroll = useScroll()
    const [page, setPage] = useState(0)
    const [expandedId, setExpandedId] = useState<number | null>(null)

    useFrame(() => {
        // Rudimentary page detection
        const p = Math.round(scroll.offset * 3)
        if (p !== page) {
            setPage(p)
            // Auto-collapse when scrolling to a new section
            if (expandedId !== null && expandedId !== p) {
                setExpandedId(null)
            }
        }
    })

    const toggleDetails = (id: number) => {
        if (expandedId === id) {
            setExpandedId(null)
        } else {
            setExpandedId(id)
        }
    }

    return (
        <Scroll html>
            <div className="w-screen h-screen">
                {SECTIONS.map((section) => {
                    const isExpanded = expandedId === section.id

                    // Positioning classes: 
                    // When expanded: centered full width, standard full section height
                    // When collapsed: side usage, offset top

                    const baseTop = section.id * 100
                    // If expanded, we snap to the top of the section (0 offset) to fill the screen
                    // If collapsed, we push it down to 40vh as before
                    const topStyle = isExpanded ? `${baseTop}vh` : `${baseTop + 40}vh`

                    const positionClass = isExpanded
                        ? `left-0 right-0 mx-auto max-w-7xl h-[100vh] flex items-center justify-center z-50 px-4 md:px-20`
                        : `${section.align === 'left' ? 'left-[5vw] md:left-[10vw]' : 'right-[5vw] md:right-[10vw]'} w-[90vw] md:max-w-xl`

                    return (
                        <div
                            key={section.id}
                            style={{ top: topStyle }}
                            className={`absolute 
                                ${positionClass}
                                transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                                ${page === section.id ? 'opacity-100 transform translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                        >
                            {/* COLLAPSED STATE */}
                            <div className={`transition-all duration-500 absolute top-0 left-0 w-full ${isExpanded ? 'opacity-0 pointer-events-none scale-95 hidden' : 'opacity-100 scale-100 delay-300'}`}>
                                <div className={`${section.align === 'right' ? 'text-right' : 'text-left'}`}>
                                    {section.stepLabel && (
                                        <span
                                            className="font-bold tracking-widest uppercase text-sm mb-4 block"
                                            style={{ color: section.color }}
                                        >
                                            {section.stepLabel}
                                        </span>
                                    )}
                                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                        {section.title}
                                    </h2>
                                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                        {section.shortDesc}
                                    </p>

                                    <button
                                        onClick={() => toggleDetails(section.id)}
                                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                                        style={{ backgroundColor: section.color }}
                                    >
                                        <span>Learn More</span>
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* EXPANDED STATE (IN-PLACE) */}
                            <div
                                className={`transition-all duration-700 w-full h-full flex flex-col justify-center ${isExpanded ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-4 pointer-events-none absolute top-0'}`}
                            >
                                <div className="max-h-screen overflow-y-auto overscroll-contain px-2 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                    <div className="absolute top-4 right-0 z-50">
                                        <button
                                            onClick={() => setExpandedId(null)}
                                            className="p-3 rounded-full bg-white/10 backdrop-blur-md shadow-sm hover:bg-white/20 transition-all text-gray-500 hover:text-gray-900"
                                            title="Close"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* CONTENT RENDER */}
                                    <div className="w-full">
                                        {section.details}
                                    </div>

                                    <div className="mt-8 text-center pb-8 opacity-50 hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setExpandedId(null)}
                                            className="text-xs font-bold uppercase tracking-widest transition-colors hover:underline px-6 py-2 rounded-full"
                                            style={{ color: section.color }}
                                        >
                                            Close View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </Scroll>
    )
}

export default function ParticleScene() {
    return (
        <div className="w-full h-screen relative bg-white overflow-hidden">
            <Canvas camera={{ position: [0, 0, 20], fov: 35 }}>
                <color attach="background" args={['#ffffff']} />
                {/* Note: Background color will be handled by CSS, but good to have fallback */}

                <ScrollControls pages={4} damping={0.2}>
                    <Particles />
                    <HTMLOverlay />
                </ScrollControls>
            </Canvas>
        </div>
    )
}
