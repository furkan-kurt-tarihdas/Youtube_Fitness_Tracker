import { colors } from '../utils/colors';

export const mockVideos = [

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

export const mockLeaderboard = [
  { id: 1, name: "Michelle (Sen)", streak: 7, isCurrentUser: true },
  { id: 2, name: "Ayşe", streak: 7 },
  { id: 3, name: "Canan", streak: 3 },
  { id: 4, name: "Ezgi", streak: 1 }
];
