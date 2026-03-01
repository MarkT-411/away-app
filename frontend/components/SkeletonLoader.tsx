import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

// Simple shimmer skeleton component
export function SkeletonItem({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View 
      style={[
        styles.skeleton, 
        { width: width as any, height, borderRadius },
        style
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX }] }
        ]}
      />
    </View>
  );
}

// Post card skeleton
export function PostSkeleton() {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <SkeletonItem width={40} height={40} borderRadius={20} />
        <View style={styles.postHeaderInfo}>
          <SkeletonItem width={120} height={14} />
          <SkeletonItem width={60} height={10} style={{ marginTop: 6 }} />
        </View>
        <SkeletonItem width={80} height={32} borderRadius={16} />
      </View>
      <SkeletonItem width="100%" height={60} style={{ marginTop: 12 }} />
      <SkeletonItem width="100%" height={200} borderRadius={8} style={{ marginTop: 12 }} />
      <View style={styles.postActions}>
        <SkeletonItem width={50} height={24} />
        <SkeletonItem width={50} height={24} />
        <SkeletonItem width={24} height={24} />
      </View>
    </View>
  );
}

// Event card skeleton
export function EventSkeleton() {
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <SkeletonItem width={80} height={60} borderRadius={8} />
        <View style={styles.eventInfo}>
          <SkeletonItem width="80%" height={16} />
          <SkeletonItem width="60%" height={12} style={{ marginTop: 8 }} />
          <SkeletonItem width="40%" height={12} style={{ marginTop: 6 }} />
        </View>
      </View>
      <View style={styles.eventFooter}>
        <SkeletonItem width={100} height={14} />
        <SkeletonItem width={80} height={32} borderRadius={8} />
      </View>
    </View>
  );
}

// Market item skeleton
export function MarketSkeleton() {
  return (
    <View style={styles.marketCard}>
      <SkeletonItem width="100%" height={120} borderRadius={8} />
      <View style={styles.marketInfo}>
        <SkeletonItem width="80%" height={14} />
        <SkeletonItem width={80} height={18} style={{ marginTop: 8 }} />
        <SkeletonItem width={60} height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

// Track item skeleton
export function TrackSkeleton() {
  return (
    <View style={styles.trackCard}>
      <View style={styles.trackHeader}>
        <SkeletonItem width={50} height={50} borderRadius={8} />
        <View style={styles.trackInfo}>
          <SkeletonItem width="70%" height={16} />
          <SkeletonItem width="50%" height={12} style={{ marginTop: 6 }} />
        </View>
        <SkeletonItem width={60} height={24} borderRadius={4} />
      </View>
      <View style={styles.trackMeta}>
        <SkeletonItem width={80} height={14} />
        <SkeletonItem width={80} height={14} />
        <SkeletonItem width={60} height={14} />
      </View>
    </View>
  );
}

// Feed skeleton - shows 3 post skeletons
export function FeedSkeleton() {
  return (
    <View style={styles.container}>
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </View>
  );
}

// Events skeleton
export function EventsSkeleton() {
  return (
    <View style={styles.container}>
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
    </View>
  );
}

// Market skeleton
export function MarketGridSkeleton() {
  return (
    <View style={styles.marketGrid}>
      <MarketSkeleton />
      <MarketSkeleton />
      <MarketSkeleton />
      <MarketSkeleton />
    </View>
  );
}

// Tracks skeleton
export function TracksSkeleton() {
  return (
    <View style={styles.container}>
      <TrackSkeleton />
      <TrackSkeleton />
      <TrackSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  skeleton: {
    backgroundColor: '#2A2A2A',
    overflow: 'hidden',
  },
  shimmer: {
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  postCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 24,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  eventCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  marketCard: {
    width: '46%',
    margin: '2%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  marketInfo: {
    padding: 12,
  },
  trackCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
});
