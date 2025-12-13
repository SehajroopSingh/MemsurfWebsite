'use client'

import React from 'react'
import Navigation from '@/components/Navigation'
import ParticleScene from '@/components/method/ParticleScene'

export default function MethodPage() {
    return (
        <main className="h-screen w-full overflow-hidden bg-white text-gray-900">
            <div className="absolute top-0 left-0 right-0 z-50">
                <Navigation />
            </div>

            <ParticleScene />
        </main>
    )
}
