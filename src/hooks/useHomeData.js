import { useState, useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchVideos, fetchWeeklyCompletions, fetchTodayCompletions } from '../services/db';
import { useAddVideo } from '../context/AddVideoContext';

export function useHomeData(showToast) {
  const [videos, setVideos] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [todayCompletions, setTodayCompletions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { registerOnVideoAdded } = useAddVideo();

  const loadData = useCallback(async () => {
    try {
      const [vids, weekly, today] = await Promise.all([
        fetchVideos(),
        fetchWeeklyCompletions(),
        fetchTodayCompletions(),
      ]);
      setVideos(vids);
      setWeeklyData(weekly);
      setTodayCompletions(today);
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast('Failed to load data.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    registerOnVideoAdded(loadData);
  }, [loadData, registerOnVideoAdded]);

  useFocusEffect(
    useCallback(() => {
      loadData();

      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          loadData();
        }
      });

      return () => {
        subscription.remove();
      };
    }, [loadData])
  );

  return {
    videos,
    weeklyData,
    todayCompletions,
    loading,
    loadData
  };
}
