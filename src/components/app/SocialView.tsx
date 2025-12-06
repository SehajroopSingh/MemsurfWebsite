'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { Friend, FriendRequest, Activity, LeaderboardEntry, FriendStreak, FriendStreakInvitation } from '@/lib/types'
import { Users, Trophy, Flame, Bell, UserPlus, Check, X } from 'lucide-react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function SocialView() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [activityFeed, setActivityFeed] = useState<Activity[]>([])
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([])
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leagueLeaderboard, setLeagueLeaderboard] = useState<LeaderboardEntry[]>([])
  const [friendStreaks, setFriendStreaks] = useState<FriendStreak[]>([])
  const [streakInvitations, setStreakInvitations] = useState<FriendStreakInvitation[]>([])
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<'friends' | 'league'>('friends')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSocialData()
  }, [])

  const loadSocialData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [
        friendsData,
        activityData,
        requestsData,
        friendsLeaderboardData,
        leagueData,
        streaksData,
        invitationsData,
      ] = await Promise.all([
        apiClient.getFriends(),
        apiClient.getActivityFeed(),
        apiClient.getIncomingRequests(),
        apiClient.getFriendsLeaderboard(),
        apiClient.getLeagueLeaderboard(),
        apiClient.getFriendStreaks(),
        apiClient.getStreakInvitations(),
      ])
      
      console.log('Social data loaded:', {
        friends: friendsData,
        activity: activityData,
        requests: requestsData,
        friendsLeaderboard: friendsLeaderboardData,
        league: leagueData,
        streaks: streaksData,
        invitations: invitationsData,
      })
      
      setFriends(friendsData)
      setActivityFeed(activityData)
      setIncomingRequests(requestsData)
      setFriendsLeaderboard(friendsLeaderboardData)
      if (leagueData.leaderboard) {
        setLeagueLeaderboard(leagueData.leaderboard)
      }
      setFriendStreaks(streaksData)
      setStreakInvitations(invitationsData)
    } catch (err: any) {
      console.error('Failed to load social data:', err)
      setError(err.message || 'Failed to load social data')
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToRequest = async (requestId: number, action: 'accept' | 'reject') => {
    try {
      await apiClient.respondToFriendRequest(requestId, action)
      await loadSocialData()
    } catch (err: any) {
      console.error('Failed to respond to request:', err)
      setError(err.message || 'Failed to respond to request')
    }
  }

  const handleRespondToStreakInvitation = async (invitationId: number, accept: boolean) => {
    try {
      await apiClient.respondToStreakInvitation(invitationId, accept)
      await loadSocialData()
    } catch (err: any) {
      console.error('Failed to respond to streak invitation:', err)
      setError(err.message || 'Failed to respond to streak invitation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white pb-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const totalNotifications = incomingRequests.length + streakInvitations.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-y-auto pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Social</h1>
            <p className="text-gray-600">Connect with friends and compete on leaderboards</p>
          </div>
          {totalNotifications > 0 && (
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              {totalNotifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalNotifications > 99 ? '99+' : totalNotifications}
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Notifications */}
        {(incomingRequests.length > 0 || streakInvitations.length > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h2>
            
            {incomingRequests.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Friend Requests</h3>
                <div className="space-y-2">
                  {incomingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{request.from_user.username}</p>
                          <p className="text-xs text-gray-500">Wants to be friends</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespondToRequest(request.id, 'accept')}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRespondToRequest(request.id, 'reject')}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {streakInvitations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Streak Invitations</h3>
                <div className="space-y-2">
                  {streakInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Flame className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{invitation.from_user.username}</p>
                          <p className="text-xs text-gray-500">Invited you to a streak</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespondToStreakInvitation(invitation.id, true)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRespondToStreakInvitation(invitation.id, false)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Friends */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends ({friends.length})
          </h2>
          {friends.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    {friend.profile_image ? (
                      <img src={friend.profile_image} alt={friend.username} className="w-16 h-16 rounded-full" />
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">
                        {friend.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">{friend.username}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No friends yet. Start adding friends to compete!</p>
          )}
        </div>

        {/* Friend Streaks */}
        {friendStreaks.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5" />
              Friend Streaks
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {friendStreaks.slice(0, 5).map((streak) => (
                <div key={streak.id} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    {streak.friend.profile_image ? (
                      <img src={streak.friend.profile_image} alt={streak.friend.username} className="w-16 h-16 rounded-full" />
                    ) : (
                      <span className="text-2xl font-bold text-orange-600">
                        {streak.friend.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{streak.friend.username}</p>
                  <p className="text-xs text-gray-500">{streak.streak_count} day streak</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboards */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Leaderboards
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLeaderboard('friends')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedLeaderboard === 'friends'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Friends
              </button>
              <button
                onClick={() => setSelectedLeaderboard('league')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedLeaderboard === 'league'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                League
              </button>
            </div>
          </div>

          {selectedLeaderboard === 'friends' ? (
            friendsLeaderboard.length > 0 ? (
              <div className="space-y-2">
                {friendsLeaderboard.map((entry, idx) => (
                  <div key={entry.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-8">#{idx + 1}</span>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {entry.avatar ? (
                          <img src={entry.avatar} alt={entry.username} className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-sm font-bold text-blue-600">
                            {entry.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">{entry.username}</p>
                    </div>
                    {entry.xp !== undefined && (
                      <p className="text-sm font-semibold text-gray-600">{entry.xp} XP</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No leaderboard data available</p>
            )
          ) : (
            leagueLeaderboard.length > 0 ? (
              <div className="space-y-2">
                {leagueLeaderboard.map((entry, idx) => (
                  <div key={entry.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-8">#{idx + 1}</span>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        {entry.avatar ? (
                          <img src={entry.avatar} alt={entry.username} className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-sm font-bold text-purple-600">
                            {entry.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">{entry.username}</p>
                    </div>
                    {entry.xp !== undefined && (
                      <p className="text-sm font-semibold text-gray-600">{entry.xp} XP</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No league data available</p>
            )
          )}
        </div>

        {/* Activity Feed */}
        {activityFeed.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Feed</h2>
            <div className="space-y-3">
              {activityFeed.slice(0, 10).map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.username}</span> {activity.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


