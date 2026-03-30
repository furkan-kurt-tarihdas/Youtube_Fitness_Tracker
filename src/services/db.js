import { supabase } from './supabase';

// Day label map — used to build WeeklyChart data
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Fetch all videos for the home feed.
 */
export async function fetchVideos() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch completions for the current user from the last 7 days and
 * transform them into the format expected by WeeklyChart:
 * [{ day: 'Mon', colors: ['#D8B4E2', ...] }, ...]
 */
export async function fetchWeeklyCompletions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return buildEmptyWeek();

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const { data: completions, error } = await supabase
    .from('completions')
    .select('completed_date, videos(theme_color)')
    .eq('user_id', user.id)
    .gte('completed_date', sevenDaysAgo.toISOString().split('T')[0])
    .lte('completed_date', today.toISOString().split('T')[0]);

  if (error) throw error;

  const colorsByDate = {};
  completions.forEach(({ completed_date, videos: video }) => {
    if (!colorsByDate[completed_date]) colorsByDate[completed_date] = [];
    if (video?.theme_color) colorsByDate[completed_date].push(video.theme_color);
  });

  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      day: DAY_LABELS[d.getDay()],
      colors: colorsByDate[dateStr] ?? [],
    });
  }

  return result;
}

/**
 * Fetch all completion dates for a specific video to show on the calendar.
 */
export async function fetchCompletionsForVideo(videoId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('completions')
    .select('completed_date')
    .eq('user_id', user.id)
    .eq('video_id', videoId);

  if (error) throw error;
  return data.map(d => d.completed_date);
}

/**
 * Record a completion for today for the given video.
 */
export async function recordCompletion(video) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You need to be signed in.');

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('completions')
    .insert({
      user_id: user.id,
      video_id: video.id,
      youtube_id: video.youtube_id,
      completed_date: today,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('You already completed this video today!');
    throw error;
  }

  return data;
}

/**
 * Fetch how many times a specific video was completed by the current user.
 */
export async function fetchCompletionCountForVideo(videoId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('completions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('video_id', videoId);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Add a new video.
 * Fetches title from YouTube oEmbed API automatically.
 * Falls back to provided title or generic label.
 */
export async function addVideo(youtubeUrl, titleHint, themeColor) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You need to be signed in to add a video.');

  const youtubeId = extractYoutubeId(youtubeUrl);
  if (!youtubeId) throw new Error('Invalid YouTube link. Please check the URL.');

  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

  // Fetch real title via oEmbed
  let title = titleHint || 'YouTube Video';
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`
    );
    if (res.ok) {
      const json = await res.json();
      if (json.title) title = json.title;
    }
  } catch {
    // oEmbed failed — silently use hint/fallback
  }

  const { data, error } = await supabase
    .from('videos')
    .insert({
      user_id: user.id,
      youtube_id: youtubeId,
      title: title.trim(),
      thumbnail_url: thumbnailUrl,
      theme_color: themeColor,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('This video has already been added.');
    throw error;
  }

  return data;
}

/**
 * Update a video's title and/or theme color.
 */
export async function updateVideo(id, newTitle, newColor) {
  const { error } = await supabase
    .from('videos')
    .update({ title: newTitle.trim(), theme_color: newColor })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Delete a video (completions cascade via FK).
 */
export async function deleteVideo(id) {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Calculate the global streak for a user.
 * Counts consecutive days ending today or yesterday.
 * Returns 0 if no activity.
 */
export async function getUserGlobalStreak(userId) {
  const { data, error } = await supabase
    .from('completions')
    .select('completed_date')
    .eq('user_id', userId)
    .order('completed_date', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  // Deduplicate dates
  const uniqueDates = [...new Set(data.map(r => r.completed_date))].sort().reverse();

  return consecutiveDaysStreak(uniqueDates);
}

/**
 * Get the leaderboard for a specific video.
 * Returns array sorted by per-user streak (desc):
 * [{ id, username, avatar_url, streak, isCurrentUser }]
 */
export async function getVideoLeaderboard(youtubeId) {
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Hedef youtube_id'ye sahip TÜM tamamlanma kayıtlarını direkt tablosundan getir.
  const { data, error } = await supabase
    .from('completions')
    .select('user_id, completed_date, profiles!inner(id, username, avatar_url)')
    .eq('youtube_id', youtubeId)
    .order('completed_date', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Group completions by user
  const byUser = {};
  data.forEach(({ user_id, completed_date, profiles: profile }) => {
    // Depending on Supabase setup, profile can be an object or an array.
    const p = Array.isArray(profile) ? profile[0] : profile;
    if (!byUser[user_id]) {
      byUser[user_id] = {
        id: user_id,
        username: p?.username || 'Anonymous',
        avatar_url: p?.avatar_url || null,
        dates: [],
      };
    }
    byUser[user_id].dates.push(completed_date);
  });

  // Define consecutive streak function for leaderboard explicitly
  const toMs = (str) => new Date(str + 'T00:00:00').getTime();
  const DAY_MS = 24 * 60 * 60 * 1000;
  
  const getStreak = (dates) => {
    if (!dates || dates.length === 0) return 0;
    const sortedDatesDesc = [...new Set(dates)].sort().reverse();
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - DAY_MS).toISOString().split('T')[0];
    
    const firstDate = sortedDatesDesc[0];
    if (firstDate !== todayStr && firstDate !== yesterdayStr) return 0;

    let streak = 1;
    for (let i = 1; i < sortedDatesDesc.length; i++) {
      const diff = toMs(sortedDatesDesc[i - 1]) - toMs(sortedDatesDesc[i]);
      if (diff === DAY_MS) streak++;
      else break;
    }
    return streak;
  };

  // Compute streak per user and rank (Adım C)
  const leaderboard = Object.values(byUser).map(entry => {
    return {
      id: entry.id,
      username: entry.username,
      avatar_url: entry.avatar_url,
      streak: getStreak(entry.dates),
      isCurrentUser: entry.id === currentUser?.id,
    };
  });

  // Sort by streak descending
  leaderboard.sort((a, b) => b.streak - a.streak);

  return leaderboard;
}

// ─── Helpers ───────────────────────────────────────────────

/**
 * Given an array of YYYY-MM-DD strings in descending order (newest first),
 * compute how many consecutive days there are, starting from today or yesterday.
 */
function consecutiveDaysStreak(sortedDatesDesc) {
  if (!sortedDatesDesc || sortedDatesDesc.length === 0) return 0;

  const toMs = (str) => new Date(str + 'T00:00:00').getTime();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - DAY_MS).toISOString().split('T')[0];

  // Streak must start from today or yesterday
  const firstDate = sortedDatesDesc[0];
  if (firstDate !== todayStr && firstDate !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDatesDesc.length; i++) {
    const diff = toMs(sortedDatesDesc[i - 1]) - toMs(sortedDatesDesc[i]);
    if (diff === DAY_MS) {
      streak++;
    } else {
      break; // gap found — streak is over
    }
  }

  return streak;
}

function extractYoutubeId(url) {
  try {
    const patterns = [
      /youtu\.be\/([A-Za-z0-9_-]{11})/,
      /[?&]v=([A-Za-z0-9_-]{11})/,
      /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

function buildEmptyWeek() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { day: DAY_LABELS[d.getDay()], colors: [] };
  });
}
