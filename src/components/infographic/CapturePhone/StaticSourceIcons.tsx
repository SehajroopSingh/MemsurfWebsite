'use client'

import { steps } from '../constants'

type StaticSourceIconsProps = {
    activeStep: number
    animationStage: string
}

export default function StaticSourceIcons({ activeStep, animationStage }: StaticSourceIconsProps) {


    return (
        <>
            {steps.map((step, i) => (
                <div
                    key={i}
                    className={`absolute flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm text-sm font-medium text-gray-400`}
                    style={{
                        top: step.position.top,
                        left: step.position.left,
                        transform: step.position.x ? `translateX(${step.position.x})` : 'none'
                    }}
                >
                    <div className="grayscale opacity-50 scale-75">{step.icon}</div>
                    {step.source}
                </div>
            ))}
        </>
    )
}
