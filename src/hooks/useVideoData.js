import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  fetchCompletionCountForVideo, 
  recordCompletion,
  getVideoLeaderboard,
  fetchTodayCompletions,
} from '../services/db';

export function useVideoData(video, setHomeTabColor, resetHomeTabColor) {
  const activeColor = video.theme_color || video.themeColor || '#D8B4E2';

  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [todayReps, setTodayReps] = useState(0);

  const currentReps = Number(todayReps) || 0;
  const goal = Number(video.daily_goal) || 1;
  const isCompletedForToday = currentReps >= goal;
  const nextRep = Math.min(currentReps + 1, goal);
  const currentStreak = leaderboard.find(e => e.isCurrentUser)?.streak ?? 0;

  useFocusEffect(
    useCallback(() => {
      if (setHomeTabColor) setHomeTabColor(activeColor);

      async function loadStats() {
        try {
          const [c, lb, todayComps] = await Promise.all([
            fetchCompletionCountForVideo(video.id),
            getVideoLeaderboard(video.youtube_id),
            fetchTodayCompletions(),
          ]);
          setCount(c);
          setLeaderboard(lb);

          const thisVideoToday = todayComps.find(comp => comp.youtube_id === video.youtube_id);
          const fetchedTodayReps = thisVideoToday ? (thisVideoToday.reps_completed ?? 1) : 0;
          setTodayReps(fetchedTodayReps);
        } catch (err) {
          console.error('Stats load failed:', err);
        } finally {
          setLoading(false);
        }
      }
      loadStats();

      return () => {
        if (resetHomeTabColor) resetHomeTabColor();
      };
    }, [activeColor, setHomeTabColor, resetHomeTabColor, video.id, video.youtube_id])
  );

  const handleRecordCompletion = async (onSuccessCallback) => {
    try {
      await recordCompletion(video);
      setCount(prev => Number(prev) + 1);
      setTodayReps(prev => Number(prev) + 1);

      getVideoLeaderboard(video.youtube_id).then(setLeaderboard).catch(console.warn);
      
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    } catch (error) {
      if (error.message.includes('already completed')) {
        setTodayReps(goal);
        return;
      }
      console.warn('Completion error:', error.message);
    }
  };

  return {
    count,
    loading,
    leaderboard,
    currentReps,
    goal,
    isCompletedForToday,
    nextRep,
    currentStreak,
    activeColor,
    handleRecordCompletion
  };
}
