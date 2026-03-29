import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../utils/colors';

export default function StreakCalendar({ themeColor, completedDates = [] }) {
  // We'll show the last 30 slots (or current month simplified)
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Extract Day numbers from completedDates (YYYY-MM-DD -> DD) 
  // ONLY if they match the current month/year context. 
  // For simplicity since it's a fixed 30-day view:
  const completedDayNumbers = completedDates.map(dateStr => {
    const d = new Date(dateStr);
    return d.getDate();
  });

  const activeColor = themeColor || colors.primary;

  return (
    <View className="bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 mx-6 mb-8">
      <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
        Your Progress
      </Text>
      
      <View className="flex-row justify-between mb-3 px-1">
        {weekDays.map((day, i) => (
          <Text key={i} className="text-gray-400 font-bold w-8 text-center text-xs">
            {day}
          </Text>
        ))}
      </View>
      
      <View className="flex-row flex-wrap justify-start">
        {days.map((day, i) => {
          const isCompleted = completedDayNumbers.includes(day);
          return (
            <View 
              key={i} 
              className="w-10 h-10 rounded-xl items-center justify-center m-1"
              style={{
                backgroundColor: isCompleted ? activeColor : '#F3F4F6',
                width: '12.5%', 
                marginHorizontal: '0.8%',
              }}
            >
              <Text 
                className="text-xs font-bold"
                style={{ 
                  color: isCompleted ? 'white' : colors.text,
                  opacity: isCompleted ? 1 : 0.6
                }}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
