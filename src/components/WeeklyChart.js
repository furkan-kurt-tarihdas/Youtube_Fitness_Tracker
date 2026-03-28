import React from 'react';
import { View, Text } from 'react-native';

export default function WeeklyChart({ data }) {
  return (
    <View className="flex-row justify-between items-end px-8 py-2 h-48 mt-2 mb-2">
      {data.map((item, index) => (
        <View key={index} className="items-center h-full justify-end">
          <View className="w-7 flex-col-reverse justify-start items-center mb-3">
            {item.colors.length === 0 ? (
              <View className="w-full h-8 rounded-full bg-black/5" />
            ) : (
              item.colors.map((color, i) => (
                <View
                  key={i}
                  className="w-full rounded-full"
                  style={{
                    backgroundColor: color,
                    height: i === 0 ? 60 : 40,
                    marginBottom: i > 0 ? 6 : 0,
                  }}
                />
              ))
            )}
          </View>
          <Text className="text-xs font-medium text-gray-400">
            {item.day}
          </Text>
        </View>
      ))}
    </View>
  );
}
