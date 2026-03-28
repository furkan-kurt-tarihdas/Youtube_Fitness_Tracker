import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../utils/colors';

export default function WeeklyChart({ data }) {
  const [activeFilters, setActiveFilters] = useState([]);

  // Tüm benzersiz renkleri (filtre butonları için) topla
  const allColors = useMemo(() => {
    const colorSet = new Set();
    data.forEach(item => {
      item.colors.forEach(c => colorSet.add(c));
    });
    return Array.from(colorSet);
  }, [data]);

  const toggleFilter = (color) => {
    if (activeFilters.includes(color)) {
      setActiveFilters(activeFilters.filter(f => f !== color));
    } else {
      setActiveFilters([...activeFilters, color]);
    }
  };

  return (
    <View className="mt-2 mb-2">
      {/* Grafiğin Kendisi */}
      <View className="flex-row justify-between items-end px-8 py-2 h-48">
        {data.map((item, index) => (
          <View key={index} className="items-center h-full justify-end">
            <View className="w-7 flex-col-reverse justify-start items-center mb-3">
              {item.colors.length === 0 ? (
                <View 
                  className="w-full h-8 bg-black/5" 
                  style={{ borderRadius: 6 }} 
                />
              ) : (
                item.colors
                  .filter(c => activeFilters.length === 0 || activeFilters.includes(c))
                  .map((color, i, filteredArray) => {
                    const isBottom = i === 0;
                    const isTop = i === filteredArray.length - 1;

                    return (
                      <View
                        key={i}
                        className="w-full"
                        style={{
                          backgroundColor: color,
                          height: i === 0 ? 50 : 35,
                          marginBottom: i < filteredArray.length - 1 ? 4 : 0,
                          borderTopLeftRadius: isTop ? 12 : 4,
                          borderTopRightRadius: isTop ? 12 : 4,
                          borderBottomLeftRadius: isBottom ? 12 : 4,
                          borderBottomRightRadius: isBottom ? 12 : 4,
                        }}
                      />
                    );
                  })
              )}
            </View>
            <Text className="text-xs font-semibold text-gray-400">
              {item.day}
            </Text>
          </View>
        ))}
      </View>

      {/* Renk Filtreleri */}
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
                  borderColor: colors.tabBackground, // Belirgin olması için koyu renk border
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
            <TouchableOpacity 
              onPress={() => setActiveFilters([])}
              className="ml-2"
            >
              <Text className="text-xs font-bold text-gray-400">Clear</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
