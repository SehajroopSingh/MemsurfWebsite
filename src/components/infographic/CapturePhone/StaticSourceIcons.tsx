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
                    className={`absolute flex items-center justify-center`}
                    style={{
                        top: step.position.top,
                        left: step.position.left,
                        transform: `translateX(-50%) ${step.position.x ? `translateX(${step.position.x})` : ''}`
                    }}
                >
                    <div className="scale-[1.75]">{step.icon}</div>
                </div>
            ))}
        </>
    )
}
