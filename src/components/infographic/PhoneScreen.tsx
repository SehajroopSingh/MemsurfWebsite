import React from 'react'

type PhoneScreenProps = {
    children?: React.ReactNode
    allowOverflow?: boolean
}

export default function PhoneScreen({ children, allowOverflow = false }: PhoneScreenProps) {
    return (
        <div className={`relative w-full h-[540px] bg-gray-950 rounded-[55px] shadow-2xl border-[6px] border-[#3b3b3b] ${allowOverflow ? 'overflow-visible' : 'overflow-hidden'} transform-style-3d`}>
            {/* Titanium Frame Highlights */}
            <div className="absolute inset-0 rounded-[50px] border-[2px] border-[#555555]/40 pointer-events-none z-50"></div>
            <div className="absolute inset-[-2px] rounded-[58px] border-[1px] border-[#1a1a1a] pointer-events-none z-50 opacity-50"></div>
            {/* Inner Bezel */}
            <div className="absolute inset-[3px] rounded-[48px] border-[3px] border-black pointer-events-none z-40"></div>
            {/* Dynamic Island */}
            <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-50 flex items-center justify-center">
                <div className="w-20 h-full flex items-center justify-between px-3">
                    <div className="w-3 h-3 bg-[#111] rounded-full"></div>
                    <div className="w-2 h-2 bg-[#050505] rounded-full"></div>
                </div>
            </div>
            {/* Screen Content */}
            <div className={`absolute inset-[6px] rounded-[44px] bg-white ${allowOverflow ? 'overflow-visible' : 'overflow-hidden mask-image-rounded'}`}>
                {children}
            </div>
            {/* Buttons */}
            <div className="absolute top-[100px] left-[-8px] w-[3px] h-[24px] bg-[#2a2a2a] rounded-l-md border-r border-[#1a1a1a]"></div>
            <div className="absolute top-[140px] left-[-8px] w-[3px] h-[40px] bg-[#2a2a2a] rounded-l-md border-r border-[#1a1a1a]"></div>
            <div className="absolute top-[190px] left-[-8px] w-[3px] h-[40px] bg-[#2a2a2a] rounded-l-md border-r border-[#1a1a1a]"></div>
            <div className="absolute top-[140px] right-[-8px] w-[3px] h-[65px] bg-[#2a2a2a] rounded-r-md border-l border-[#1a1a1a]"></div>
            <div className="absolute bottom-[100px] right-[-4px] w-[4px] h-[65px] bg-[#1a1a1a] rounded-r-md shadow-inner border-l border-gray-800"></div>
            {/* Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-30 rounded-[55px]"></div>
        </div>
    )
}
