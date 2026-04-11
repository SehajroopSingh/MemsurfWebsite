'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export type BlobbyBackgroundMode = 'idle' | 'loading' | 'settling'

type BlobSpec = {
  id: number
  color: string
  opacity: number
  size: number
  scale: [number, number, number]
  initial: { x: string; y: string }
  animate: { x: [string, string]; y: [string, string] }
  durationMove: number
  durationSize: number
  blur: string
}

const LOADING_BLOB_SIZE = 200
const LOADING_ORBIT_RADIUS = 118
const LOADING_ORBIT_DURATION = 8
const SETTLE_DURATION = 1.6
const SETTLE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const PULSE_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1]

const blobs: BlobSpec[] = [
  {
    id: 1,
    color: '#4f9e95',
    opacity: 0.40,
    size: 250,
    scale: [1, 350 / 250, 1],
    initial: { x: '20vw', y: '20vh' },
    animate: { x: ['20vw', '40vw'], y: ['20vh', '20vh'] },
    durationMove: 8,
    durationSize: 6,
    blur: 'blur(30px)',
  },
  {
    id: 2,
    color: '#5376ab',
    opacity: 0.40,
    size: 150,
    scale: [1, 250 / 150, 1],
    initial: { x: '75vw', y: '50vh' },
    animate: { x: ['75vw', '90vw'], y: ['50vh', '50vh'] },
    durationMove: 10,
    durationSize: 7,
    blur: 'blur(30px)',
  },
  {
    id: 3,
    color: '#6b57a8',
    opacity: 0.36,
    size: 200,
    scale: [1, 300 / 200, 1],
    initial: { x: '10vw', y: '80vh' },
    animate: { x: ['10vw', '30vw'], y: ['80vh', '80vh'] },
    durationMove: 12,
    durationSize: 9,
    blur: 'blur(30px)',
  },
  {
    id: 4,
    color: '#8c65c6',
    opacity: 0.34,
    size: 170,
    scale: [1, 270 / 170, 1],
    initial: { x: '15vw', y: '85vh' },
    animate: { x: ['15vw', '35vw'], y: ['85vh', '85vh'] },
    durationMove: 11,
    durationSize: 8,
    blur: 'blur(35px)',
  },
  {
    id: 5,
    color: '#77c2b7',
    opacity: 0.30,
    size: 120,
    scale: [1, 180 / 120, 1],
    initial: { x: '35vw', y: '8vh' },
    animate: { x: ['35vw', '65vw'], y: ['8vh', '18vh'] },
    durationMove: 9,
    durationSize: 5,
    blur: 'blur(25px)',
  },
  {
    id: 6,
    color: '#7196cf',
    opacity: 0.30,
    size: 100,
    scale: [1, 160 / 100, 1],
    initial: { x: '75vw', y: '15vh' },
    animate: { x: ['75vw', '90vw'], y: ['15vh', '30vh'] },
    durationMove: 11,
    durationSize: 6,
    blur: 'blur(22px)',
  },
  {
    id: 7,
    color: '#a580da',
    opacity: 0.28,
    size: 130,
    scale: [1, 190 / 130, 1],
    initial: { x: '45vw', y: '82vh' },
    animate: { x: ['45vw', '75vw'], y: ['82vh', '92vh'] },
    durationMove: 10,
    durationSize: 7,
    blur: 'blur(27px)',
  },
  {
    id: 8,
    color: '#438a81',
    opacity: 0.28,
    size: 110,
    scale: [1, 170 / 110, 1],
    initial: { x: '15vw', y: '45vh' },
    animate: { x: ['15vw', '25vw'], y: ['45vh', '60vh'] },
    durationMove: 12,
    durationSize: 8,
    blur: 'blur(20px)',
  },
  {
    id: 9,
    color: '#3f6196',
    opacity: 0.28,
    size: 90,
    scale: [1, 150 / 90, 1],
    initial: { x: '85vw', y: '70vh' },
    animate: { x: ['85vw', '95vw'], y: ['70vh', '80vh'] },
    durationMove: 13,
    durationSize: 6,
    blur: 'blur(17px)',
  },
  {
    id: 10,
    color: '#7a73b2',
    opacity: 0.28,
    size: 120,
    scale: [1, 180 / 120, 1],
    initial: { x: '20vw', y: '55vh' },
    animate: { x: ['20vw', '35vw'], y: ['55vh', '70vh'] },
    durationMove: 9.5,
    durationSize: 5.5,
    blur: 'blur(25px)',
  },
  {
    id: 11,
    color: '#8fe1d4',
    opacity: 0.24,
    size: 160,
    scale: [1, 240 / 160, 1],
    initial: { x: '15vw', y: '10vh' },
    animate: { x: ['15vw', '85vw'], y: ['10vh', '25vh'] },
    durationMove: 6,
    durationSize: 4,
    blur: 'blur(40px)',
  },
  {
    id: 12,
    color: '#89b0eb',
    opacity: 0.24,
    size: 140,
    scale: [1, 220 / 140, 1],
    initial: { x: '10vw', y: '40vh' },
    animate: { x: ['10vw', '90vw'], y: ['40vh', '55vh'] },
    durationMove: 7,
    durationSize: 4.5,
    blur: 'blur(37px)',
  },
  {
    id: 13,
    color: '#b08ae4',
    opacity: 0.24,
    size: 150,
    scale: [1, 230 / 150, 1],
    initial: { x: '25vw', y: '70vh' },
    animate: { x: ['25vw', '75vw'], y: ['70vh', '85vh'] },
    durationMove: 5.5,
    durationSize: 3.5,
    blur: 'blur(42px)',
  },
]

function loadingOrbitKeyframes(index: number, total: number) {
  const baseAngle = (index / total) * Math.PI * 2
  const steps = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 1.125, 1.25, 1.375, 1.5, 1.625, 1.75, 1.875, 2]

  return steps.reduce(
    (acc, step) => {
      const angle = baseAngle + Math.PI * step
      const x = Math.cos(angle) * LOADING_ORBIT_RADIUS
      const y = Math.sin(angle) * LOADING_ORBIT_RADIUS

      acc.x.push(`calc(50vw + ${x.toFixed(2)}px - ${LOADING_BLOB_SIZE / 2}px)`)
      acc.y.push(`calc(50vh + ${y.toFixed(2)}px - ${LOADING_BLOB_SIZE / 2}px)`)
      return acc
    },
    { x: [] as string[], y: [] as string[] },
  )
}

function loadingRestPosition(index: number, total: number) {
  const angle = (index / total) * Math.PI * 2
  const x = Math.cos(angle) * LOADING_ORBIT_RADIUS
  const y = Math.sin(angle) * LOADING_ORBIT_RADIUS

  return {
    x: `calc(50vw + ${x.toFixed(2)}px - ${LOADING_BLOB_SIZE / 2}px)`,
    y: `calc(50vh + ${y.toFixed(2)}px - ${LOADING_BLOB_SIZE / 2}px)`,
  }
}

function loadingPulseScale(index: number) {
  const dip = 0.015 + (index % 4) * 0.002
  const lift = 0.02 + ((index * 5) % 6) * 0.003
  const secondaryLift = 0.008 + (index % 3) * 0.002

  return [
    1 - dip * 0.45,
    1 + secondaryLift,
    1 - dip,
    1 + lift,
    1 - dip * 0.2,
    1 + lift * 0.52,
    1 - dip * 0.45,
  ].map((value) => Number(value.toFixed(3)))
}

function loadingPulseTimes(index: number) {
  const offset = (index % 3) * 0.025

  return [0, 0.16 + offset, 0.34, 0.57 - offset, 0.72, 0.86 + offset / 2, 1]
}

function loadingPulseDuration(index: number) {
  return 2.9 + (index % 5) * 0.22 + (index % 2) * 0.16
}

function buildBlobAnimation(
  blob: BlobSpec,
  index: number,
  mode: BlobbyBackgroundMode,
  reduceMotion: boolean,
) {
  if (mode === 'loading') {
    const restPosition = loadingRestPosition(index, blobs.length)
    const orbit = loadingOrbitKeyframes(index, blobs.length)

    return {
      animate: {
        x: reduceMotion ? restPosition.x : orbit.x,
        y: reduceMotion ? restPosition.y : orbit.y,
        width: LOADING_BLOB_SIZE,
        height: LOADING_BLOB_SIZE,
        scale: reduceMotion ? 1 : loadingPulseScale(index),
      },
      transition: reduceMotion
        ? { duration: 0.35, ease: 'easeOut' }
        : {
            x: { duration: LOADING_ORBIT_DURATION, repeat: Infinity, ease: 'linear' },
            y: { duration: LOADING_ORBIT_DURATION, repeat: Infinity, ease: 'linear' },
            scale: {
              duration: loadingPulseDuration(index),
              repeat: Infinity,
              ease: PULSE_EASE,
              times: loadingPulseTimes(index),
            },
            width: { duration: 0.65, ease: 'easeOut' },
            height: { duration: 0.65, ease: 'easeOut' },
          },
    }
  }

  if (reduceMotion || mode === 'settling') {
    return {
      animate: {
        x: blob.initial.x,
        y: blob.initial.y,
        width: blob.size,
        height: blob.size,
        scale: 1,
      },
      transition: {
        x: { duration: reduceMotion ? 0.35 : SETTLE_DURATION, ease: SETTLE_EASE },
        y: { duration: reduceMotion ? 0.35 : SETTLE_DURATION, ease: SETTLE_EASE },
        width: { duration: reduceMotion ? 0.35 : SETTLE_DURATION, ease: SETTLE_EASE },
        height: { duration: reduceMotion ? 0.35 : SETTLE_DURATION, ease: SETTLE_EASE },
        scale: { duration: reduceMotion ? 0.35 : SETTLE_DURATION, ease: SETTLE_EASE },
      },
    }
  }

  return {
    animate: {
      x: blob.animate.x,
      y: blob.animate.y,
      width: blob.size,
      height: blob.size,
      scale: blob.scale,
    },
    transition: {
      scale: { duration: blob.durationSize, repeat: Infinity, ease: 'easeInOut' },
      x: { duration: blob.durationMove, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
      y: { duration: blob.durationMove, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
      width: { duration: 0.4, ease: 'easeOut' },
      height: { duration: 0.4, ease: 'easeOut' },
    },
  }
}

export default function BlobbyBackground({ mode = 'idle' }: { mode?: BlobbyBackgroundMode }) {
  const shouldReduceMotion = useReducedMotion()
  const reduceMotion = Boolean(shouldReduceMotion)

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ backgroundColor: '#08131d' }}>
      {blobs.map((blob, index) => {
        const animation = buildBlobAnimation(blob, index, mode, reduceMotion)

        return (
          <motion.div
            key={blob.id}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              backgroundColor: blob.color,
              filter: blob.blur,
              opacity: blob.opacity,
              width: blob.size,
              height: blob.size,
              transformOrigin: 'center center',
              willChange: 'transform, width, height',
            }}
            initial={{
              x: mode === 'loading' ? loadingRestPosition(index, blobs.length).x : blob.initial.x,
              y: mode === 'loading' ? loadingRestPosition(index, blobs.length).y : blob.initial.y,
              width: mode === 'loading' ? LOADING_BLOB_SIZE : blob.size,
              height: mode === 'loading' ? LOADING_BLOB_SIZE : blob.size,
              scale: 1,
            }}
            animate={animation.animate}
            transition={animation.transition}
          />
        )
      })}
    </div>
  )
}
