import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

type TabType = 'posts' | 'events' | 'rides' | 'market' | 'tracks' | 'followers';

interface ProfileData {
  user: {
    id: string;
    username: string;
    avatar?: string;
    bio?: string;
    country?: string;
    followers_count: number;
    following_count: number;
  };
  posts: any[];
  events: any[];
  trips: any[];
  selling_items: any[];
  favorite_items: any[];
  downloaded_tracks: any[];
  followers: any[];
  following: any[];
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  // Use current user from auth context or fallback
  const currentUser = user || { id: 'user-1', username: 'RiderJohn' };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profile/${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      'Are you sure you want to log out?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('auth.logout'), 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        },
      ]
    );
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const TABS = [
    { id: 'posts', label: t('profile.posts'), icon: 'newspaper-outline' },
    { id: 'events', label: t('profile.events'), icon: 'calendar-outline' },
    { id: 'rides', label: t('profile.rides'), icon: 'bicycle-outline' },
    { id: 'market', label: t('profile.market'), icon: 'cart-outline' },
    { id: 'tracks', label: t('profile.tracks'), icon: 'navigate-outline' },
    { id: 'followers', label: t('profile.network'), icon: 'people-outline' },
  ];

  const renderPostItem = (item: any) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Ionicons name="newspaper" size={20} color="#FF6B35" />
        <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
      </View>
      <Text style={styles.itemContent} numberOfLines={2}>{item.content}</Text>
      <View style={styles.itemStats}>
        <View style={styles.stat}>
          <Ionicons name="heart" size={14} color="#888" />
          <Text style={styles.statText}>{item.likes?.length || 0}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="chatbubble" size={14} color="#888" />
          <Text style={styles.statText}>{item.comments_count || 0}</Text>
        </View>
      </View>
    </View>
  );

  const renderEventItem = (item: any) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.itemCard}
      onPress={() => router.push({ pathname: '/event-details', params: { id: item.id } })}
    >
      <View style={styles.itemHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.attendeeBadge}>
          <Ionicons name="people" size={12} color="#4CAF50" />
          <Text style={styles.attendeeText}>{item.attendees?.length || 0}</Text>
        </View>
      </View>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <View style={styles.locationRow}>
        <Ionicons name="location" size={14} color="#888" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRideItem = (item: any) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.itemCard}
      onPress={() => router.push({ pathname: '/trip-details', params: { id: item.id } })}
    >
      <View style={styles.itemHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{formatDate(item.date)}</Text>
        </View>
        {item.distance && (
          <View style={styles.distanceBadge}>
            <Ionicons name="speedometer" size={12} color="#FF6B35" />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        )}
      </View>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <View style={styles.routeInfo}>
        <Text style={styles.routeText}>{item.start_location}</Text>
        <Ionicons name="arrow-forward" size={14} color="#666" />
        <Text style={styles.routeText}>{item.end_location}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMarketItem = (item: any, type: 'selling' | 'favorite') => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.marketCard}
      onPress={() => router.push({ pathname: '/market-details', params: { id: item.id } })}
    >
      <View style={styles.marketImageContainer}>
        {item.images?.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.marketImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={24} color="#444" />
          </View>
        )}
        <View style={[
          styles.typeBadge,
          { backgroundColor: type === 'selling' ? '#FF6B35' : '#4CAF50' }
        ]}>
          <Text style={styles.typeBadgeText}>
            {type === 'selling' ? 'Selling' : 'Favorite'}
          </Text>
        </View>
      </View>
      <Text style={styles.marketTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.marketPrice}>${item.price}</Text>
    </TouchableOpacity>
  );

  const renderTrackItem = (item: any) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Ionicons name="navigate" size={20} color="#FF6B35" />
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(item.difficulty) }
        ]}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <View style={styles.trackMeta}>
        {item.distance && (
          <View style={styles.stat}>
            <Ionicons name="speedometer" size={14} color="#888" />
            <Text style={styles.statText}>{item.distance}</Text>
          </View>
        )}
        {item.elevation_gain && (
          <View style={styles.stat}>
            <Ionicons name="trending-up" size={14} color="#888" />
            <Text style={styles.statText}>{item.elevation_gain}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'moderate': return '#FFC107';
      case 'hard': return '#FF9800';
      case 'expert': return '#F44336';
      default: return '#888';
    }
  };

  const renderFollowerItem = (item: any, type: 'follower' | 'following') => (
    <View key={item.id} style={styles.userCard}>
      <View style={styles.userAvatar}>
        <Ionicons name="person" size={20} color="#888" />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userType}>
          {type === 'follower' ? 'Follows you' : 'You follow'}
        </Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    if (!profile) return null;

    switch (activeTab) {
      case 'posts':
        return (
          <View style={styles.tabContent}>
            {profile.posts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="newspaper-outline" size={48} color="#444" />
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            ) : (
              profile.posts.map(renderPostItem)
            )}
          </View>
        );

      case 'events':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Subscribed Events</Text>
            {profile.events.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#444" />
                <Text style={styles.emptyText}>No events joined</Text>
              </View>
            ) : (
              profile.events.map(renderEventItem)
            )}
          </View>
        );

      case 'rides':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Group Rides Joined</Text>
            {profile.trips.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bicycle-outline" size={48} color="#444" />
                <Text style={styles.emptyText}>No rides joined</Text>
              </View>
            ) : (
              profile.trips.map(renderRideItem)
            )}
          </View>
        );

      case 'market':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Items for Sale</Text>
            {profile.selling_items.length === 0 ? (
              <View style={styles.emptyStateSmall}>
                <Text style={styles.emptyTextSmall}>No items for sale</Text>
              </View>
            ) : (
              <View style={styles.marketGrid}>
                {profile.selling_items.map(item => renderMarketItem(item, 'selling'))}
              </View>
            )}
            
            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Favorites</Text>
            {profile.favorite_items.length === 0 ? (
              <View style={styles.emptyStateSmall}>
                <Text style={styles.emptyTextSmall}>No favorites yet</Text>
              </View>
            ) : (
              <View style={styles.marketGrid}>
                {profile.favorite_items.map(item => renderMarketItem(item, 'favorite'))}
              </View>
            )}
          </View>
        );

      case 'tracks':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Downloaded GPX Tracks</Text>
            {profile.downloaded_tracks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="navigate-outline" size={48} color="#444" />
                <Text style={styles.emptyText}>No tracks downloaded</Text>
              </View>
            ) : (
              profile.downloaded_tracks.map(renderTrackItem)
            )}
          </View>
        );

      case 'followers':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>
              Followers ({profile.followers.length})
            </Text>
            {profile.followers.length === 0 ? (
              <View style={styles.emptyStateSmall}>
                <Text style={styles.emptyTextSmall}>No followers yet</Text>
              </View>
            ) : (
              profile.followers.map(f => renderFollowerItem(f, 'follower'))
            )}
            
            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>
              Following ({profile.following.length})
            </Text>
            {profile.following.length === 0 ? (
              <View style={styles.emptyStateSmall}>
                <Text style={styles.emptyTextSmall}>Not following anyone</Text>
              </View>
            ) : (
              profile.following.map(f => renderFollowerItem(f, 'following'))
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF6B35" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            {profile?.user.avatar ? (
              <Image source={{ uri: profile.user.avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={40} color="#888" />
            )}
          </View>
          <Text style={styles.profileName}>{profile?.user.username || CURRENT_USER.username}</Text>
          {profile?.user.bio && (
            <Text style={styles.profileBio}>{profile.user.bio}</Text>
          )}
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.posts.length || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.posts')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.user.followers_count || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.followers')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.user.following_count || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.following')}</Text>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id as TabType)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.id ? '#FF6B35' : '#888'} 
              />
              <Text style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    marginRight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  profileBio: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tabBarContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  activeTab: {
    backgroundColor: '#2A2A2A',
  },
  tabLabel: {
    color: '#888',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#FF6B35',
  },
  tabContent: {
    padding: 16,
  },
  sectionHeader: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
  },
  emptyStateSmall: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyTextSmall: {
    color: '#666',
    fontSize: 13,
  },
  itemCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemDate: {
    color: '#888',
    fontSize: 12,
  },
  itemContent: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemStats: {
    flexDirection: 'row',
    marginTop: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 4,
  },
  dateBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dateBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  attendeeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A3A1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  attendeeText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A2A1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  distanceText: {
    color: '#FF6B35',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  routeText: {
    color: '#888',
    fontSize: 12,
    marginHorizontal: 4,
  },
  trackMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  marketCard: {
    width: '46%',
    margin: '2%',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    overflow: 'hidden',
  },
  marketImageContainer: {
    height: 100,
    position: 'relative',
  },
  marketImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  marketTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    padding: 8,
    paddingBottom: 2,
  },
  marketPrice: {
    color: '#FF6B35',
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  userType: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
});
