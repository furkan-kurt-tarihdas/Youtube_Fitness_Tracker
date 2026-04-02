import React, { useState } from 'react';
import { ScrollView, View, Text, StatusBar, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import Header from '../components/Header';
import WeeklyChart from '../components/WeeklyChart';
import VideoCard from '../components/VideoCard';
import ShareIntentInfoCard from '../components/ShareIntentInfoCard';
import EditVideoModal from '../components/EditVideoModal';
import { useHomeData } from '../hooks/useHomeData';
import { useToast } from '../context/ToastContext';

const backgroundImage = require('../../assets/bg_lavender.png');

export default function HomeScreen() {
  const { showToast } = useToast();
  const { videos, weeklyData, todayCompletions, loading, loadData } = useHomeData(showToast);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);

  function openEditModal(video) {
    setEditingVideo(video);
    setIsEditModalVisible(true);
  }

  function closeEditModal() {
    setIsEditModalVisible(false);
    setEditingVideo(null);
  }

  const hasVideos = videos.length > 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Header isEmpty={!hasVideos} />
          <View style={{ height: 16 }} />
          <WeeklyChart data={weeklyData} isEmpty={!hasVideos} />

          {hasVideos ? (
            <>
              <View style={styles.sectionHeader}>
                <Text className="font-overlockBold" style={[styles.sectionTitle, { color: colors.text }]}>Daily Challenge</Text>
              </View>
              {videos.map((video) => {
                const isCompletedToday = todayCompletions.some(
                  c => c.youtube_id === video.youtube_id && (c.reps_completed ?? 0) >= (c.target_reps || video.daily_goal || 1)
                );
                return (
                  <VideoCard
                    key={video.id}
                    video={video}
                    isCompletedToday={isCompletedToday}
                    onComplete={loadData}
                    onEditPress={openEditModal}
                  />
                );
              })}
            </>
          ) : (
            <ShareIntentInfoCard />
          )}
        </ScrollView>

        <EditVideoModal
          visible={isEditModalVisible}
          video={editingVideo}
          videos={videos}
          onClose={closeEditModal}
          onSaveSuccess={loadData}
          onDeleteSuccess={loadData}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
});
