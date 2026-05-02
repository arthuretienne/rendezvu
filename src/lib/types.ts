// Database types — mirrors supabase/migrations/20260501000000_init.sql.
// When the schema changes, update this file in lockstep.

export type Visibility = 'private' | 'friends' | 'public'
export type GroupVisibility = 'private' | 'unlisted' | 'public'
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'
export type ItemKind = 'movie' | 'tv'
export type ListEntryStatus = 'bucket' | 'selected' | 'watched_by_some' | 'watched_by_all'
export type WatchSource = 'manual' | 'import' | 'party'
export type DrawMode = 'random' | 'vote' | 'veto'
export type SpoilerBlur = 'until_watched' | 'tagged' | 'tap'
export type Frequency = 'weekly' | 'biweekly' | 'monthly'
export type NotificationChannel = 'email' | 'web_push' | 'in_app'
export type NotificationKind =
  | 'draw_imminent'
  | 'movie_watched'
  | 'review_posted'
  | 'review_replied'
  | 'friend_request'
  | 'friend_accepted'
  | 'group_invited'
  | 'weekly_digest'
export type DonationKind = 'one_time' | 'monthly' | 'yearly'
export type ImportSource = 'letterboxd_csv' | 'letterboxd_username'
export type ImportStatus = 'pending' | 'running' | 'succeeded' | 'failed'

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  country: string | null
  timezone: string
  locale: string
  visibility: Visibility
  is_patron: boolean
  patron_since: string | null
  cinetype: string | null
  cinetype_computed_at: string | null
  discover_opt_in: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Friendship {
  id: string
  user_a: string
  user_b: string
  status: FriendshipStatus
  requested_by: string
  created_at: string
  responded_at: string | null
}

export interface GroupRules {
  draw_mode: DrawMode
  spoiler_blur: SpoilerBlur
  frequency: Frequency
}

export interface Group {
  id: string
  name: string
  emoji: string
  cover_url: string | null
  kind: 'movie'
  visibility: GroupVisibility
  rules: GroupRules
  next_draw_at: string | null
  invite_token: string
  created_by: string | null
  created_at: string
}

export interface GroupMember {
  group_id: string
  user_id: string
  joined_at: string
  left_at: string | null
}

export interface Item {
  id: string
  kind: ItemKind
  tmdb_id: number
  title: string
  year: number | null
  poster_path: string | null
  overview: string | null
  runtime: number | null
  genres: string[] | null
  metadata: Record<string, unknown>
  providers: Record<string, unknown>
  providers_updated_at: string | null
  created_at: string
}

export interface ListEntry {
  id: string
  group_id: string
  item_id: string
  added_by: string | null
  status: ListEntryStatus
  selected_at: string | null
  watched_at: string | null
  draw_count: number
  added_at: string
}

export interface Watch {
  id: string
  list_entry_id: string
  user_id: string
  watched_at: string
  source: WatchSource
}

export interface Review {
  id: string
  item_id: string
  user_id: string
  group_id: string | null
  rating: number
  body: string | null
  contains_spoilers: boolean
  is_rewatch: boolean
  edit_count: number
  created_at: string
  updated_at: string
}

export interface ReviewThread {
  id: string
  review_id: string
  user_id: string
  parent_id: string | null
  body: string
  created_at: string
}

export interface ReviewReaction {
  review_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface MessageAttachment {
  kind: 'image' | 'link'
  url: string
  width?: number
  height?: number
  alt?: string
}

export interface Message {
  id: string
  group_id: string
  user_id: string | null
  body: string | null
  attachments: MessageAttachment[]
  reply_to: string | null
  reactions: Record<string, string[]>
  created_at: string
  edited_at: string | null
  deleted_at: string | null
}

export interface Invite {
  token: string
  group_id: string
  created_by: string | null
  expires_at: string | null
  max_uses: number | null
  uses: number
  created_at: string
}

export interface Import {
  id: string
  user_id: string
  source: ImportSource
  status: ImportStatus
  stats: Record<string, unknown>
  error: string | null
  created_at: string
  completed_at: string | null
}

export interface Notification {
  id: string
  user_id: string
  kind: NotificationKind
  payload: Record<string, unknown>
  channel: NotificationChannel
  sent_at: string | null
  read_at: string | null
  created_at: string
}

export interface NotificationPref {
  id: string
  user_id: string
  group_id: string | null
  kind: NotificationKind
  channel: NotificationChannel
  enabled: boolean
}

export interface Donation {
  id: string
  user_id: string | null
  stripe_session_id: string | null
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  amount_cents: number
  currency: string
  kind: DonationKind
  status: string
  created_at: string
}

// View-model types — joined shapes the UI works with.

export interface ListEntryWithItem extends ListEntry {
  item: Item
  added_by_profile?: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null
  watches?: Pick<Watch, 'user_id' | 'watched_at'>[]
}

export interface ReviewWithAuthor extends Review {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>
  item?: Pick<Item, 'id' | 'title' | 'poster_path' | 'year'>
  reactions_count?: Record<string, number>
  thread_count?: number
}

export interface MessageWithAuthor extends Message {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'> | null
}

export interface GroupSummary extends Group {
  member_count: number
  bucket_count: number
  next_draw_label?: string
}
