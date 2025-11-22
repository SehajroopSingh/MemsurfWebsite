// TypeScript types for API responses

export interface User {
  id: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
  profile_image?: string
}

export interface Space {
  id: number
  name: string
  owner: number
  owner_username?: string
  user_facing_description?: string
  image_url?: string
  silenced?: boolean
  is_pinned?: boolean
  groups?: Group[]
  pinned?: boolean
}

export interface Group {
  id: number
  name: string
  space: number
  owner: number
  owner_username?: string
  user_facing_description?: string
  is_pinned?: boolean
  sets?: Set[]
  pinned?: boolean
}

export interface Set {
  id: number
  title: string
  group: number
  owner?: number
  owner_username?: string
  user_facing_description?: string
  mastery_level?: number
  is_pinned?: boolean
  quick_captures?: QuickCapture[]
  pinned?: boolean
}

export interface QuickCapture {
  id: number
  content: string
  short_description?: string
  summary?: string
  context?: string
  highlighted_sections?: string[]
  difficulty?: string
  mastery_time?: string
  depth_of_learning?: string
  qc_version?: string
  created_at: string
  updated_at?: string
  user: number
  set?: number
  folder?: number
  classification?: string
  mastery_level?: number
  silenced?: boolean
  image_url?: string
  total_cost?: number
  inbox?: boolean
  main_points?: MainPoint[]
}

export interface MainPoint {
  id: number
  title: string
  quick_capture: number
  sub_points?: SubPoint[]
}

export interface SubPoint {
  id: number
  title: string
  main_point: number
  details?: Detail[]
}

export interface Detail {
  id: number
  content: string
  sub_point: number
}

// Types for mainpoints_and_quizzes API response
export interface QuickCaptureQuizResponse {
  quick_capture_id: number
  total_cost?: number
  direct_quizzes: Quiz[]
  main_points: MainPointWithQuizzes[]
  total_quiz_count?: number
  overdue_quiz_count?: number
  processing_started_at?: string
  processing_completed_at?: string
  total_processing_time_seconds?: number
  qc_version?: string
  mastery_time?: string
  difficulty?: string
}

export interface QuizState {
  mastery_level?: number
  last_reviewed?: string
  next_review?: string
  total_attempts?: number
  correct_attempts?: number
  [key: string]: any
}

export interface RegularGroup {
  combined_mastery?: number
  scheduled_quiz_id?: number
  child_quiz_ids?: number[]
  combined_attempts?: any[]
}

export interface GeneralGroup {
  combined_mastery?: number
  scheduled_quiz_id?: number
  child_quiz_ids?: number[]
  combined_attempts?: any[]
}

export interface ContentClassification {
  primary_category: string
  secondary_category?: string
  confidence_scores: Record<string, number>
  reasoning: string
  classification_cost?: number
}

export interface QuizIntent {
  id?: string
  quiz_type: string
  style_id: string
  difficulty: string
  selection_reason: string
  anchors?: {
    source_spans?: string[]
    facts?: string[]
  }
  blueprint?: {
    question_focus?: string
    wrong_answer_strategy?: string
    constraints?: string[]
  }
  target_skills?: string[]
}

export interface MainPointWithQuizzes {
  id: number
  text: string
  context?: string
  supporting_text?: string
  order?: number
  state?: QuizState
  quizzes: Quiz[]
  subpoints: SubPointWithQuizzes[]
  regular_group?: RegularGroup
  general_group?: GeneralGroup
  has_subpoints?: boolean
  prompt?: string
  classification_prompt?: string
  classification?: ContentClassification
  quiz_intents?: QuizIntent[]
  silenced?: boolean
}

export interface SubPointWithQuizzes {
  id: number
  text: string
  context?: string
  supporting_text?: string
  order?: number
  state?: QuizState
  quizzes: Quiz[]
  details?: DetailWithQuizzes[]
  regular_group?: RegularGroup
  general_group?: GeneralGroup
  has_details?: boolean
  prompt?: string
  classification_prompt?: string
  classification?: ContentClassification
  quiz_intents?: QuizIntent[]
  silenced?: boolean
}

export interface DetailWithQuizzes {
  id: number
  content: string
  context?: string
  supporting_text?: string
  order: number
  state?: QuizState
  quizzes: Quiz[]
  regular_group?: RegularGroup
  general_group?: GeneralGroup
  classification?: ContentClassification
  quiz_intents?: QuizIntent[]
}

export interface Quiz {
  id: number
  quiz_type: string
  question_text?: string
  explanation?: string
  choices?: string[]
  correctAnswerIndex?: number
  correct_answer_index?: number
  statement?: string
  trueFalseAnswer?: string
  true_false_answer?: string
  fillBlankQuestion?: string
  fill_blank_question?: string
  fillBlankAnswer?: string
  fill_blank_answer?: string
  options?: string[]
  text?: string
  errorLocations?: string[]
  error_locations?: string[]
  correctHighlights?: string[]
  correct_highlights?: string[]
  items?: any[]
  categories?: any[]
  correctOrder?: string[]
  correct_order?: string[]
  created_at: string
  state?: QuizState
  recent_attempts?: any[]
}

export interface ScheduledQuiz {
  id: number
  quiz: Quiz
  due_date: string
  priority: number
  quick_capture?: QuickCapture
  set?: Set
}

export interface QuizSession {
  quiz_id: number
  user_answer?: string
  user_answers?: string[]
  is_correct?: boolean
  time_taken?: number
}

export interface LoginResponse {
  access: string
  refresh: string
}

export interface UserStructure {
  spaces: Space[]
  pinned_items?: any[]
}

export interface ApiError {
  error?: string
  message?: string
  detail?: string
  [key: string]: any
}

// Dashboard types
export interface PinnedItem {
  id: number
  type: 'set' | 'group' | 'space'
  title: string
}

export interface QuickCaptureItem {
  id: number
  short_description?: string
  content: string
  created_at: string
  set_id?: number
  folder_id?: number
  classification?: string
  inbox?: boolean
}

export interface QuickPracticeChoice {
  id: number
  type: 'space' | 'group' | 'set'
  ref_id: number
  created_at: string
}

export interface DashboardData {
  hearts: number
  xp: number
  streak: number
  gems: number
  level?: number
  badges?: string[]
  pinned_items?: PinnedItem[]
  recent_quick_captures?: QuickCaptureItem[]
  quick_practice_choices?: QuickPracticeChoice[]
  quizzes_due_count?: number
  plan_name?: string
  plan_slug?: string
  subscription_active?: boolean
  ai_credits?: number
  features?: string[]
}

// Gamification types
export interface GamificationProfile {
  xp: number
  coins: number
  hearts: number
  max_hearts: number
  current_streak: number
  longest_streak: number
  level: number
  total_days_active: number
}

export interface CalendarDayData {
  date: string
  xp?: number
  quizzes_completed?: number
  streak_active?: boolean
}

export interface CalendarSummary {
  current_streak: number
  longest_streak: number
  total_days_active: number
}

export interface CalendarResponse {
  success: boolean
  calendar_data: CalendarDayData[]
  summary: CalendarSummary
}

export interface GamificationProfileResponse {
  success: boolean
  profile: GamificationProfile
  challenges?: any
  recent_achievements?: any[]
  badges?: any[]
}

export interface CircleMemberMasteryItem {
  id: number
  user: number
  username: string
  role: string
  total_mastery: number
  mastery_last_period: number
}

export interface CircleRings {
  id: number
  name: string
  rings: RingData[]
}

export interface RingData {
  lastWeekProgress: number
  totalProgress: number
  colorsThisWeek: string[]
  colorsLastWeek: string[]
  label: string
}

// Social types
export interface Friend {
  id: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
  profile_image?: string
  avatar?: string
  displayName?: string
}

export interface FriendRequest {
  id: number
  from_user: Friend
  to_user: Friend
  status: string
  created_at: string
}

export interface Activity {
  id: number
  username: string
  content: string
  timestamp: string
}

export interface LeaderboardEntry {
  id: number
  username: string
  xp?: number
  rank?: number
  avatar?: string
}

export interface FriendStreak {
  id: number
  friend: Friend
  streak_count: number
  last_active_date?: string
}

export interface FriendStreakInvitation {
  id: number
  from_user: Friend
  to_user: Friend
  status: string
  created_at: string
}

