import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../utils/colors';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  // Alt boşluğa notch insets değeri eklenecek ki iPhone'larda home indicator ile çakışmasın
  const bottomMargin = Math.max(insets.bottom, 20);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: colors.tabBackground,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: 100, // Taşmayı tam engellemek için yüksek tutuldu
          borderTopWidth: 0,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          paddingTop: 25, // İkonları ortaya ve biraz aşağı iterek taşmasını engeller
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused ? styles.focusedIconContainer : styles.unfocusedIconContainer]}>
              <Home color={focused ? colors.text : '#FFFFFF'} size={28} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused ? styles.focusedIconContainer : styles.unfocusedIconContainer]}>
              <User color={focused ? colors.text : '#FFFFFF'} size={28} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedIconContainer: {
    backgroundColor: colors.primary,
  },
  unfocusedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
