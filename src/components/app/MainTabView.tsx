'use client'

import { useState } from 'react'
import { Home, BarChart3, Users, BookOpen } from 'lucide-react'
import Dashboard from './Dashboard'
import StatsView from './StatsView'
import SocialView from './SocialView'
import LearningCenter from './LearningCenter'

type TabType = 'home' | 'stats' | 'social' | 'learning'

export default function MainTabView() {
  const [activeTab, setActiveTab] = useState<TabType>('home')

  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'stats' as TabType, label: 'Stats', icon: BarChart3 },
    { id: 'social' as TabType, label: 'Social', icon: Users },
    { id: 'learning' as TabType, label: 'Learning', icon: BookOpen },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && <Dashboard />}
        {activeTab === 'stats' && <StatsView />}
        {activeTab === 'social' && <SocialView />}
        {activeTab === 'learning' && <LearningCenter />}
      </div>

      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : ''}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

