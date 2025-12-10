import React from 'react'
import { Mic, Copy } from 'lucide-react'

// Custom Icons for Brands
export const NotionIcon = () => (
    <svg viewBox="0 0 15 15" fill="currentColor" className="w-6 h-6">
        <path d="M3.25781 3.11684C3.67771 3.45796 3.83523 3.43193 4.62369 3.37933L12.0571 2.93299C12.2147 2.93299 12.0836 2.77571 12.0311 2.74957L10.7965 1.85711C10.56 1.67347 10.2448 1.46315 9.64083 1.51576L2.44308 2.04074C2.18059 2.06677 2.12815 2.19801 2.2327 2.30322L3.25781 3.11684ZM3.7041 4.84917V12.6704C3.7041 13.0907 3.91415 13.248 4.38693 13.222L12.5562 12.7493C13.0292 12.7233 13.0819 12.4341 13.0819 12.0927V4.32397C13.0819 3.98306 12.9508 3.79921 12.6612 3.82545L4.12422 4.32397C3.80918 4.35044 3.7041 4.50803 3.7041 4.84917ZM11.7688 5.26872C11.8212 5.50518 11.7688 5.74142 11.5319 5.76799L11.1383 5.84641V11.6205C10.7965 11.8042 10.4814 11.9092 10.2188 11.9092C9.79835 11.9092 9.69305 11.7779 9.37812 11.3844L6.80345 7.34249V11.2532L7.61816 11.437C7.61816 11.437 7.61816 11.9092 6.96086 11.9092L5.14879 12.0143C5.09615 11.9092 5.14879 11.647 5.33259 11.5944L5.80546 11.4634V6.29276L5.1489 6.24015C5.09625 6.00369 5.22739 5.66278 5.5954 5.63631L7.53935 5.50528L10.2188 9.5998V5.97765L9.53564 5.89924C9.4832 5.61018 9.69305 5.40028 9.95576 5.37425L11.7688 5.26872ZM1.83874 1.33212L9.32557 0.780787C10.245 0.701932 10.4815 0.754753 11.0594 1.17452L13.4492 2.85424C13.8436 3.14309 13.975 3.22173 13.975 3.53661V12.7493C13.975 13.3266 13.7647 13.6681 13.0293 13.7203L4.33492 14.2454C3.78291 14.2717 3.52019 14.193 3.23111 13.8253L1.47116 11.5419C1.1558 11.1216 1.02466 10.8071 1.02466 10.4392V2.25041C1.02466 1.77825 1.23504 1.38441 1.83874 1.33212Z" />
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
        position: { top: "-100px", left: "45%", x: "-50px" }
    },
    {
        id: 2,
        icon: <Mic className="w-6 h-6" />,
        color: "text-red-500 border-red-100 bg-red-50",
        label: "Lecture Audio",
        source: "Voice Note",
        position: { top: "-100px", left: "45%", x: "90px" }
    },
    {
        id: 3,
        icon: <GDriveIcon />,
        color: "text-blue-500 border-blue-100 bg-blue-50",
        label: "Project Specs",
        source: "Google Drive",
        position: { top: "-100px", left: "45%", x: "230px" }
    },
    {
        id: 4,
        icon: <Copy className="w-6 h-6" />,
        color: "text-purple-500 border-purple-100 bg-purple-50",
        label: "Interesting Article",
        source: "Clipboard",
        position: { top: "-100px", left: "45%", x: "370px" }
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
