import React from 'react'
import { Mic, Copy } from 'lucide-react'

// Custom Icons for Brands
export const NotionIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M4.19 19.34c-1.3-.4-1.9-1.3-1.8-2.6l.1-9.7c.1-1.2.6-2 1.8-2.3L15.3 1.2c1.3-.4 2.2 0 2.5 1.3l2.8 14.8c.2 1.3-.2 2.2-1.4 2.6l-11 3.5c-1.2.4-2.1 0-2.4-1.2l-1.6-2.8zm11.2-13.6c-.3-.1-.6 0-.8.2-.2.2-.2.6 0 .8l.8.8c.2.2.6.2.8 0 .2-.2.2-.6 0-.8l-.8-1zm-4.4 7.4c-1.2.4-2.2 1.6-2.4 2.9-.1.8.1 1.6.6 2.2.5.6 1.3.9 2.1.6 1.2-.4 1.8-1.5 1.8-2.8 0-.8-.3-1.6-.8-2.2-.6-.6-1.5-.9-2.2-.7h.9z" />
    </svg>
)

export const GDriveIcon = () => (
    <svg viewBox="0 0 87.3 78" className="w-6 h-6">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA" />
        <path d="M43.65 25l13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.25l13.75 23.75z" fill="#00AC47" />
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l9.6-16.65c.8-1.4 1.2-2.95 1.2-4.5h-27.5l13.4 24.45z" fill="#EA4335" />
        <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-9.6 16.65c-.8 1.4-1.2 2.95-1.2 4.5h27.85z" fill="#00832D" />
        <path d="M59.8 53.05h27.5c0-1.55-.4-3.1-1.2-4.5l-3.85-6.65c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8z" fill="#2684FC" />
        <path d="M73.4 76.8l-13.75-23.75h-27.5l13.75 23.75c1.6 0 3.15-.45 4.5-1.25z" fill="#FFBA00" />
    </svg>
)

export const steps = [
    {
        id: 1,
        icon: <NotionIcon />,
        color: "text-gray-900 border-gray-200 bg-white",
        label: "Research Notes",
        source: "Notion",
        position: { top: "20%", left: "15%" }
    },
    {
        id: 2,
        icon: <Mic className="w-6 h-6" />,
        color: "text-red-500 border-red-100 bg-red-50",
        label: "Lecture Audio",
        source: "Voice Note",
        position: { top: "30%", right: "15%" }
    },
    {
        id: 3,
        icon: <GDriveIcon />,
        color: "text-blue-500 border-blue-100 bg-blue-50",
        label: "Project Specs",
        source: "Google Drive",
        position: { top: "60%", left: "15%" }
    },
    {
        id: 4,
        icon: <Copy className="w-6 h-6" />,
        color: "text-purple-500 border-purple-100 bg-purple-50",
        label: "Interesting Article",
        source: "Clipboard",
        position: { top: "70%", right: "15%" }
    }
]

export const DEPTH_STATES = [
    { label: "Main Points" },
    { label: "Subpoints" },
    { label: "Details" }
]

export const DIFFICULTY_STATES = [
    { label: "Adaptive", desc: "Adjusts to your pace", detail: "Focuses on your weak spots with dynamic sequencing." },
    { label: "Medium", desc: "Balanced progression", detail: "Standard coverage of core concepts." },
    { label: "Hard", desc: "Challenging recall", detail: "Prioritizes obscure details and complex synthesis." }
]

export const TIME_STATES = [
    { label: "1 Week", desc: "Cram Mode", detail: "High-frequency reviews to master content quickly." },
    { label: "1 Month", desc: "Skill Building", detail: "Balanced intervals for steady retention." },
    { label: "Lifetime", desc: "Permanent Memory", detail: "Long-term spacing for indefinite mastery." }
]
