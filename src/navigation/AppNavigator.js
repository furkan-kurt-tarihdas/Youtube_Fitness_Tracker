import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, User, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeStackNavigator from './HomeStackNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import { colors } from '../utils/colors';
import { supabase } from '../services/supabase';
import { useAddVideo } from '../context/AddVideoContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { show } = useAddVideo();

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
          height: 100,
          borderTopWidth: 0,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          paddingTop: 25,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => {
            const { activeHomeTabColor } = useTheme();
            return (
              <View style={[
                styles.iconContainer, 
                focused ? { backgroundColor: activeHomeTabColor } : styles.unfocusedIconContainer
              ]}>
                <Home color={focused ? colors.text : '#FFFFFF'} size={28} strokeWidth={focused ? 2.5 : 2} />
              </View>
            );
          },
        }}
      />

      <Tab.Screen
        name="AddVideoTab"
        component={View} // Dummy component since we use tabBarButton to show modal
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, styles.unfocusedIconContainer]}>
              <Plus color="#FFFFFF" size={32} strokeWidth={3} />
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              activeOpacity={0.7}
              onPress={() => show()}
            />
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

export default function AppNavigator() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return session ? (
    <ThemeProvider>
      <MainTabs />
    </ThemeProvider>
  ) : <AuthScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
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
