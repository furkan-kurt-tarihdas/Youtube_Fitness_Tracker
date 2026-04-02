import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../utils/colors';

export default function VideoHeader({ title, onBackPress }) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
      <BlurView 
        intensity={40} 
        tint="light" 
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 24,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(216, 180, 226, 0.4)',
        }}
      >
        <TouchableOpacity 
          onPress={onBackPress}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            marginRight: 12
          }}
        >
          <ChevronLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <Text 
          style={{ 
            fontSize: 18, 
            fontFamily: 'Overlock_700Bold', 
            color: colors.text,
            flex: 1
          }} 
          numberOfLines={1}
        >
          {title}
        </Text>
      </BlurView>
    </View>
  );
}
