'use client'

import { useState } from 'react'
import PersonaQuiz, { PersonaType } from '@/components/PersonaQuiz'
import DynamicHome from '@/components/DynamicHome'

export default function PersonaBasedPage() {
    const [persona, setPersona] = useState<PersonaType | null>(null)

    if (!persona) {
        return <PersonaQuiz onComplete={setPersona} />
    }

    return <DynamicHome persona={persona} onReset={() => setPersona(null)} />
}
