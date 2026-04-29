import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Play, Pencil, Target, CheckCircle2, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../utils/colors';

const CARD_HEIGHT = 110;

export default function VideoCard({ video, onComplete, onEditPress, isCompletedToday, index = 0 }) {
  const navigation = useNavigation();

  const thumbnailUri = video.thumbnail_url || video.thumbnail;
  const themeColor = video.theme_color || video.themeColor || colors.primary;
  const isEven = index % 2 === 0;

  return (
    <View style={styles.row}>
      {/* Left spacer — only on even rows, pushes backdrop flush to the right edge */}
      {isEven && <View style={styles.spacer} />}

      {/* Backdrop + Card wrapper */}
      <View style={[
        styles.backdropWrapper,
        {
          backgroundColor: themeColor,
          borderTopLeftRadius: isEven ? 24 : 0,
          borderBottomLeftRadius: isEven ? 24 : 0,
          borderTopRightRadius: isEven ? 0 : 24,
          borderBottomRightRadius: isEven ? 0 : 24,
        }
      ]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('VideoDetailScreen', { video })}
          style={[
            styles.card,
            isEven ? styles.cardEven : styles.cardOdd,
          ]}
        >
          <BlurView
            intensity={50}
            tint="light"
            style={styles.blurInner}
          >
            {/* Thumbnail */}
            <View style={styles.thumbnail}>
              <Image
                source={thumbnailUri ? { uri: thumbnailUri } : require('../../assets/icon.png')}
                style={styles.thumbnailImg}
                resizeMode="cover"
              />
              <View style={styles.playOverlay}>
                <View style={styles.playBtn}>
                  <Play fill="white" color="white" size={18} />
                </View>
              </View>
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={1}
              >
                {video.title}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaLeft}>
                  <View style={styles.metaLine}>
                    <Target size={12} color={themeColor} strokeWidth={2.5} />
                    <Text style={[styles.metaText, { color: colors.text }]}>
                      Target: {video.daily_goal || 1} Rep{(video.daily_goal || 1) > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.metaLine}>
                    {isCompletedToday ? (
                      <>
                        <CheckCircle2 size={12} color="#27AE60" strokeWidth={2.5} />
                        <Text style={[styles.metaText, { color: '#27AE60' }]}>Completed</Text>
                      </>
                    ) : (
                      <>
                        <Clock size={12} color="#9A8FB5" strokeWidth={2.5} />
                        <Text style={[styles.metaText, { color: '#9A8FB5' }]}>Pending</Text>
                      </>
                    )}
                  </View>
                </View>

                {onEditPress && (
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={(e) => { e.stopPropagation(); onEditPress(video); }}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <Pencil size={12} color="#9A8FB5" strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Right spacer — only on odd rows, pushes backdrop flush to the left edge */}
      {!isEven && <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginVertical: 5,
    height: CARD_HEIGHT + 16,
  },
  spacer: {
    width: '8%',
  },
  backdropWrapper: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  cardEven: {
    marginLeft: 2,
    marginRight: 4,
  },
  cardOdd: {
    marginLeft: 4,
    marginRight: 2,
  },
  blurInner: {
    flex: 1,
    flexDirection: 'row',
  },
  thumbnail: {
    width: 120,
    height: '100%',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Overlock_700Bold',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  metaLeft: {
    flex: 1,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  metaText: {
    fontSize: 10,
    fontFamily: 'Overlock_700Bold',
    marginLeft: 4,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
