import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../utils/colors';

const BAR_CONTAINER_HEIGHT = 128; // px — the fixed height allocated for all bars (h-32)

export default function WeeklyChart({ data, isEmpty }) {
  const [activeFilters, setActiveFilters] = useState([]);

  const allColors = useMemo(() => {
    const colorSet = new Set();
    data.forEach(item => {
      item.colors.forEach(c => colorSet.add(c));
    });
    return Array.from(colorSet);
  }, [data]);

  // GÖREV 1: Haftanın en yüksek toplam reps değerini bul
  const chartMax = useMemo(() => {
    const maxRepsInWeek = data.reduce((max, item) => {
      const dayTotal = item.totalReps ?? item.colors.length;
      return Math.max(max, dayTotal);
    }, 0);
    return Math.max(5, maxRepsInWeek); // floor of 5 so the chart never looks gigantic when values are tiny
  }, [data]);

  const toggleFilter = (color) => {
    if (activeFilters.includes(color)) {
      setActiveFilters(activeFilters.filter(f => f !== color));
    } else {
      setActiveFilters([...activeFilters, color]);
    }
  };

  return (
    <View className="mt-0 mb-2 px-6">
      {/* Grafik — empty ise overlay göster */}
      <BlurView
        intensity={40}
        tint="light"
        className="rounded-2xl overflow-hidden pt-4 pb-2"
        style={{ position: 'relative', borderWidth: 1, borderColor: 'rgba(216, 180, 226, 0.4)' }}
      >
        {/* GÖREV 2: Sabit yükseklik + overflow-hidden + justify-end (aşağıdan yığma) */}
        <View
          className="flex-row justify-between items-end px-4 py-0"
          style={{ height: BAR_CONTAINER_HEIGHT + 24, opacity: isEmpty ? 0.25 : 1 }}
        >
          {data.map((item, index) => {
            // Segments: prefer new `segments` array, fall back to legacy `colors`
            const rawSegments = item.segments
              ? item.segments
              : item.colors.map(c => ({ color: c, reps: 1 }));

            const visibleSegments = rawSegments.filter(
              s => activeFilters.length === 0 || activeFilters.includes(s.color)
            );

            // Total reps in view (after filter)
            const visibleTotal = visibleSegments.reduce((sum, s) => sum + s.reps, 0);

            return (
              <View key={index} className="items-center justify-end" style={{ height: BAR_CONTAINER_HEIGHT + 24 }}>
                {/* GÖREV 2: Sabit yükseklik kapsayıcı, overflow-hidden, justify-end */}
                <View
                  className="w-7 mb-3"
                  style={{
                    height: BAR_CONTAINER_HEIGHT,
                    overflow: 'hidden',
                    justifyContent: 'flex-start',
                    flexDirection: 'column-reverse',
                  }}
                >
                  {rawSegments.length === 0 || visibleTotal === 0 ? (
                    <View
                      style={{ width: '100%', height: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 6 }}
                    />
                  ) : (
                    visibleSegments.map((segment, i, arr) => {
                      const isBottom = i === 0;
                      const isTop = i === arr.length - 1;

                      // GÖREV 2: Yüzdelik yükseklik hesabı
                      const segmentHeightPercent = (segment.reps / chartMax) * 100;
                      const segmentHeightPx = (segmentHeightPercent / 100) * BAR_CONTAINER_HEIGHT;

                      return (
                        <View
                          key={i}
                          style={{
                            width: '100%',
                            height: segmentHeightPx,
                            backgroundColor: segment.color,
                            borderTopLeftRadius: isTop ? 4 : 0,
                            borderTopRightRadius: isTop ? 4 : 0,
                            borderBottomLeftRadius: isBottom ? 4 : 0,
                            borderBottomRightRadius: isBottom ? 4 : 0,
                          }}
                        />
                      );
                    })
                  )}
                </View>
                <Text className="text-xs font-overlockBold font-semibold text-gray-600">
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Empty State Overlay */}
        {isEmpty && (
          <View
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 32,
            }}
          >
            <Text
              className="text-sm font-overlock font-semibold text-center"
              style={{ color: '#9CA3AF', lineHeight: 22 }}
            >
              Add videos and complete challenges to see your daily progress here.
            </Text>
          </View>
        )}
      </BlurView>

      {/* Renk Filtreleri — empty değilse göster */}
      {!isEmpty && (
        <View className="px-8 mt-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {allColors.map((color, index) => {
              const isSelected = activeFilters.includes(color);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleFilter(color)}
                  activeOpacity={0.7}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: color,
                    marginRight: 12,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: colors.tabBackground,
                    opacity: activeFilters.length > 0 && !isSelected ? 0.4 : 1,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isSelected ? 0.3 : 0,
                    shadowRadius: 4,
                  }}
                />
              );
            })}
            {activeFilters.length > 0 && (
              <TouchableOpacity onPress={() => setActiveFilters([])} className="ml-2">
                <Text className="text-xs font-overlockBold font-bold text-gray-400">Clear</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
