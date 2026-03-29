import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../utils/colors';

const STEPS = [
  {
    emoji: '▶️',
    bg: '#FF0000',
    text: "Open a video on YouTube from our channel.",
  },
  {
    emoji: '↗️',
    bg: '#E8E8E8',
    text: 'Press the "Share" button.',
  },
  {
    emoji: '🪻',
    bg: colors.primary,
    text: 'Select our app!',
    badge: '⭐',
  },
];

export default function EmptyState() {
  return (
    <View className="mx-6 mt-2">
      {/* How-to Card */}
      <View
        className="bg-white rounded-3xl p-6 mb-4"
        style={{
          borderWidth: 2,
          borderColor: `${colors.secondary}99`,
          borderStyle: 'dashed',
        }}
      >
        <Text className="text-base font-black text-center mb-6" style={{ color: colors.text }}>
          How to Add a Video?
        </Text>

        <View className="flex-row justify-around">
          {STEPS.map((step, i) => (
            <View key={i} className="items-center" style={{ flex: 1 }}>
              {/* Icon Box */}
              <View className="relative mb-3">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: step.bg }}
                >
                  <Text style={{ fontSize: 28 }}>{step.emoji}</Text>
                </View>
                {step.badge && (
                  <Text
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      fontSize: 18,
                    }}
                  >
                    {step.badge}
                  </Text>
                )}
              </View>
              <Text
                className="text-xs text-center"
                style={{ color: colors.text, opacity: 0.7, lineHeight: 17 }}
              >
                {step.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Placeholder Area */}
      <View
        className="rounded-3xl items-center justify-center py-14"
        style={{ backgroundColor: '#D9D9D9' }}
      >
        <Text
          className="text-base font-semibold text-center"
          style={{ color: '#6B7280', lineHeight: 24 }}
        >
          The videos you've followed will appear here.{'\n'}Start by adding a video!
        </Text>
      </View>
    </View>
  );
}
