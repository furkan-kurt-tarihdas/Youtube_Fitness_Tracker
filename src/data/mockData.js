import { colors } from '../utils/colors';

export const mockVideos = [
  {
    id: '1',
    title: 'Morning Yoga',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300&auto=format&fit=crop',
    themeColor: colors.primary,
    currentStreak: 3,
  },
  {
    id: '2',
    title: '15 Min Cardio',
    thumbnail: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=300&auto=format&fit=crop',
    themeColor: colors.accent,
    currentStreak: 5,
  },
  {
    id: '3',
    title: 'Core Strength',
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop',
    themeColor: colors.secondary,
    currentStreak: 2,
  },
];

export const mockWeeklyLog = [
  { day: 'Mon', colors: [colors.accent] },
  { day: 'Tue', colors: [colors.primary, colors.secondary] },
  { day: 'Wed', colors: [colors.secondary] },
  { day: 'Thu', colors: [colors.accent] },
  { day: 'Fri', colors: [colors.primary] },
  { day: 'Sat', colors: [] },
  { day: 'Sun', colors: [colors.secondary, colors.accent] },
];
