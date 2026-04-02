import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../utils/colors';
import { fetchMonthlyCompletions } from '../services/db';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const hexToRgba = (hex, alpha) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(100,100,100,${alpha})`;
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function StreakCalendar({ themeColor, videoId, refreshTrigger, videoGoal = 1 }) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  
  const [monthlyData, setMonthlyData] = useState([]);

  const activeColor = themeColor || colors.primary;
  const goal = Number(videoGoal) || 1;

  useEffect(() => {
    if (!videoId) return;

    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

    fetchMonthlyCompletions(videoId, startStr, endStr)
      .then(data => setMonthlyData(data))
      .catch(err => console.warn('Monthly sync failed', err));
  }, [currentDate, videoId, refreshTrigger]);

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Calendar math
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Accumulate reps per day
  const completionsMap = {};
  monthlyData.forEach(d => {
    if (!d || !d.completed_date) return;
    const parts = d.completed_date.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      completionsMap[day] = (completionsMap[day] || 0) + (d.reps_completed || 1);
    }
  });

  // Goal-aware heatmap: full color only if reps >= goal, partial if in-progress
  const getHeatmapBg = (reps) => {
    if (reps === 0) return 'transparent';
    if (reps >= goal) return hexToRgba(activeColor, 1);   // fully completed
    // Partial progress: scale opacity proportionally between 0.2 and 0.6
    const partial = Math.min(reps / goal, 1);
    return hexToRgba(activeColor, 0.2 + partial * 0.4);
  };

  return (
    <BlurView 
      intensity={40} 
      tint="light" 
      style={{
        overflow: 'hidden',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        marginHorizontal: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(216, 180, 226, 0.4)',
      }}
    >
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
          Your Progress
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={goToPreviousMonth} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <ChevronLeft size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 14, fontWeight: 'bold', width: 96, textAlign: 'center', color: colors.text }}>
            {`${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <ChevronRight size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* WeekDays Header */}
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
          <Text key={i} style={{ width: '12%', marginHorizontal: '1.1%', textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#9CA3AF' }}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View className="flex-row flex-wrap" style={{ alignItems: 'flex-start' }}>
        {Array.from({ length: 42 }).map((_, i) => {
          if (i < offset) {
            return <View key={`pad-${i}`} style={{ width: '12%', marginHorizontal: '1.1%', aspectRatio: 1, marginBottom: 6 }} />;
          }
          const dayNum = i - offset + 1;
          if (dayNum > daysInMonth) {
            return <View key={`next-pad-${dayNum}`} style={{ width: '12%', marginHorizontal: '1.1%', aspectRatio: 1, marginBottom: 6 }} />;
          }

          const count = completionsMap[dayNum] || 0;
          const hasCompletion = count > 0;
          return (
            <View 
              key={`day-${dayNum}`} 
              style={{
                width: '12%', 
                marginHorizontal: '1.1%', 
                aspectRatio: 1, 
                marginBottom: 6,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: getHeatmapBg(count),
                ...(hasCompletion ? {
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                } : {})
              }}
            >
              <Text 
                style={{ 
                  fontSize: 12, 
                  fontWeight: 'bold', 
                  color: hasCompletion ? 'white' : '#6B7280', 
                  opacity: hasCompletion ? 1 : 0.5 
                }}
              >
                {dayNum}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend / Skala */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 }}>
        <Text style={{ fontSize: 12, color: '#6B7280', marginRight: 8, fontWeight: 'bold' }}>Less</Text>
        <View style={{ width: 12, height: 12, borderRadius: 2, marginRight: 4, borderWidth: 1, borderColor: 'rgba(216, 180, 226, 0.4)', backgroundColor: 'transparent' }} />
        <View style={{ width: 12, height: 12, borderRadius: 2, marginRight: 4, borderWidth: 1, borderColor: 'rgba(216, 180, 226, 0.4)', backgroundColor: getHeatmapBg(1) }} />
        <View style={{ width: 12, height: 12, borderRadius: 2, marginRight: 4, borderWidth: 1, borderColor: 'rgba(216, 180, 226, 0.4)', backgroundColor: getHeatmapBg(2) }} />
        <View style={{ width: 12, height: 12, borderRadius: 2, marginRight: 8, borderWidth: 1, borderColor: 'rgba(216, 180, 226, 0.4)', backgroundColor: getHeatmapBg(3) }} />
        <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: 'bold' }}>More</Text>
      </View>

    </BlurView>
  );
}
