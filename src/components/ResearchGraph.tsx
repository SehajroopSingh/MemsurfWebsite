'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

interface Node {
    id: string
    label: string
    url: string
    x: number
    y: number
}

interface Connection {
    from: string
    to: string
}

const initialNodes: Node[] = [
    {
        id: '1',
        label: 'Your Brain on ChatGPT',
        url: 'https://www.media.mit.edu/publications/your-brain-on-chatgpt/',
        x: 400,
        y: 300
    }
]

const initialConnections: Connection[] = []

export default function ResearchGraph() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes)
    const [connections, setConnections] = useState<Connection[]>(initialConnections)
    const [hoveredNode, setHoveredNode] = useState<string | null>(null)

    // This is a simple static graph for now, but built to be extensible

    return (
        <div className="relative w-full h-[600px] bg-gray-50 rounded-xl overflow-hidden shadow-inner border border-gray-200 my-8">
            {/* Grid Background */}
            <div className="absolute inset-0"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Connections Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map((conn, idx) => {
                    const fromNode = nodes.find(n => n.id === conn.from)
                    const toNode = nodes.find(n => n.id === conn.to)
                    if (!fromNode || !toNode) return null

                    return (
                        <line
                            key={idx}
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke="#94a3b8"
                            strokeWidth="2"
                        />
                    )
                })}
            </svg>

            {/* Nodes Layer */}
            {nodes.map((node) => (
                <motion.div
                    key={node.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                    style={{ left: node.x, top: node.y }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => window.open(node.url, '_blank')}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                >
                    <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full 
            bg-white border-2 transition-colors duration-300
            ${hoveredNode === node.id ? 'border-blue-500 shadow-lg' : 'border-blue-200 shadow-md'}
          `}>
                        <span className="font-medium text-gray-700">{node.label}</span>
                        <ExternalLink size={14} className="text-gray-400" />
                    </div>
                </motion.div>
            ))}

            <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                Interactive Research Map
            </div>
        </div>
    )
}
