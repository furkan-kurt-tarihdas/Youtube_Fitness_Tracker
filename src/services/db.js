import { supabase } from './supabase';

// Day label map — used to build WeeklyChart data
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Fetch all videos for the home feed.
 */
export async function fetchVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
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

  // Build map: dateStr → [color, ...]
  const colorsByDate = {};
  completions.forEach(({ completed_date, videos: video }) => {
    if (!colorsByDate[completed_date]) colorsByDate[completed_date] = [];
    if (video?.theme_color) colorsByDate[completed_date].push(video.theme_color);
  });

  // Build ordered 7-day array starting from 6 days ago → today
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
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
export async function recordCompletion(videoId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Oturum açmanız gerekiyor.');

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('completions')
    .insert({
      user_id: user.id,
      video_id: videoId,
      completed_date: today,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Bugün bu videoyu zaten tamamladınız!');
    throw error;
  }

  return data;
}

/**
 * Fetch how many times a specific video was completed by the current user
 * (used to compute "current streak" or completion count on VideoCard).
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
 * Add a new video to the database.
 * Extracts youtube_id from the full URL.
 */
export async function addVideo(youtubeUrl, title, themeColor) {
  const youtubeId = extractYoutubeId(youtubeUrl);
  if (!youtubeId) throw new Error('Geçersiz YouTube linki. Lütfen kontrol edin.');

  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

  const { data, error } = await supabase
    .from('videos')
    .insert({
      youtube_id: youtubeId,
      title: title.trim(),
      thumbnail_url: thumbnailUrl,
      theme_color: themeColor,
    })
    .select()
    .single();

  if (error) {
    // Unique violation = video already exists
    if (error.code === '23505') throw new Error('Bu video zaten eklenmiş.');
    throw error;
  }

  return data;
}

// ─── Helpers ───────────────────────────────────────────────

function extractYoutubeId(url) {
  try {
    // Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID
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
