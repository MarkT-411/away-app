import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCountry, getCountryFlag } from '../../context/CountryContext';
import { useMotoTypes, getMotoTypeIcon } from '../../context/MotoTypesContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import CountryPicker from '../../components/CountryPicker';
import MotoTypePicker from '../../components/MotoTypePicker';
import GuestPrompt from '../../components/GuestPrompt';
import { FeedSkeleton } from '../../components/SkeletonLoader';
import * as Haptics from 'expo-haptics';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Post {
  id: string;
  user_id: string;
  username: string;
  user_avatar?: string;
  content: string;
  image?: string;
  country?: string;
  moto_type?: string;
  likes: string[];
  comments_enabled: boolean;
  comments_count: number;
  created_at: string;
}

const CURRENT_USER = {
  id: 'user-1',
  username: 'RiderJohn',
  avatar: null,
};

// This is now deprecated - using currentUser from auth context instead

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [guestPrompt, setGuestPrompt] = useState<{ visible: boolean; action: string }>({ visible: false, action: '' });
  const router = useRouter();
  const { selectedCountry, setSelectedCountry } = useCountry();
  const { getMotoTypesParam } = useMotoTypes();
  const { user, isGuest, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Use authenticated user or guest placeholder
  const currentUser = user ? { id: user.id, username: user.username, avatar: user.avatar || null } : { id: 'guest', username: 'Guest', avatar: null };

  const requireAuth = (action: string, callback: () => void) => {
    if (isGuest) {
      setGuestPrompt({ visible: true, action });
    } else {
      callback();
    }
  };

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCountry && selectedCountry !== 'all') {
        params.append('country', selectedCountry);
      }
      const motoTypes = getMotoTypesParam();
      if (motoTypes !== 'all') {
        params.append('moto_types', motoTypes);
      }
      let url = `${API_URL}/api/posts`;
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/${CURRENT_USER.id}/followers`);
      if (response.ok) {
        const data = await response.json();
        setFollowingUsers(data.following || []);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${CURRENT_USER.id}/unread-count`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchFollowing();
    fetchUnreadCount();
  }, [selectedCountry, getMotoTypesParam()]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
    fetchFollowing();
    fetchUnreadCount();
  }, [selectedCountry, getMotoTypesParam()]);

  const handleLike = async (postId: string) => {
    // Guests CAN like posts
    const userId = isGuest ? 'guest' : currentUser.id;
    const userName = isGuest ? 'Guest' : currentUser.username;
    
    try {
      const response = await fetch(
        `${API_URL}/api/posts/${postId}/like?user_id=${userId}&username=${userName}`,
        { method: 'POST' }
      );
      if (response.ok) {
        const result = await response.json();
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, likes: result.likes } : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleFollow = async (userId: string, username: string) => {
    // Guests CANNOT follow users
    if (isGuest) {
      setGuestPrompt({ visible: true, action: 'follow users' });
      return;
    }
    
    try {
      const response = await fetch(
        `${API_URL}/api/users/${userId}/follow?follower_id=${currentUser.id}&follower_username=${currentUser.username}`,
        { method: 'POST' }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.is_following) {
          setFollowingUsers([...followingUsers, userId]);
        } else {
          setFollowingUsers(followingUsers.filter(id => id !== userId));
        }
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const renderPost = ({ item }: { item: Post }) => {
    const isLiked = item.likes.includes(CURRENT_USER.id);
    const isFollowing = followingUsers.includes(item.user_id);
    const isOwnPost = item.user_id === CURRENT_USER.id;
    
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            {item.user_avatar ? (
              <Image source={{ uri: item.user_avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={20} color="#888" />
            )}
          </View>
          <View style={styles.postHeaderInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{item.username}</Text>
              {item.country && (
                <Text style={styles.countryFlag}>{getCountryFlag(item.country)}</Text>
              )}
              {item.moto_type && (
                <Text style={styles.motoTypeIcon}>{getMotoTypeIcon(item.moto_type)}</Text>
              )}
            </View>
            <Text style={styles.timeAgo}>{formatTimeAgo(item.created_at)}</Text>
          </View>
          
          {!isOwnPost && (
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={() => handleFollow(item.user_id, item.username)}
            >
              <Ionicons 
                name={isFollowing ? "checkmark" : "person-add"} 
                size={16} 
                color={isFollowing ? "#FF6B35" : "#fff"} 
              />
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? t('feed.following') : t('feed.follow')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.postContent}>{item.content}</Text>
        
        {item.image && (
          <Image 
            source={{ uri: item.image }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "#FF6B35" : "#888"} 
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {item.likes.length}
            </Text>
          </TouchableOpacity>
          
          {item.comments_enabled !== false && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={22} color="#888" />
              <Text style={styles.actionText}>{item.comments_count}</Text>
            </TouchableOpacity>
          )}
          
          {item.comments_enabled === false && (
            <View style={styles.commentsDisabled}>
              <Ionicons name="chatbubble" size={18} color="#444" />
              <Text style={styles.commentsDisabledText}>Comments off</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={64} color="#444" />
      <Text style={styles.emptyTitle}>{t('feed.noPosts')}</Text>
      <Text style={styles.emptySubtitle}>{t('feed.beFirstToShare')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => requireAuth('view your profile', () => router.push('/profile'))}>
          <View style={styles.profileButton}>
            <Ionicons name="person-circle" size={32} color="#FF6B35" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('feed.title')}</Text>
        <View style={styles.headerActions}>
          <MotoTypePicker compact />
          <CountryPicker 
            selectedCountry={selectedCountry} 
            onSelect={setSelectedCountry}
            compact
          />
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => requireAuth('view notifications', () => router.push('/notifications'))}
          >
            <Ionicons name="notifications-outline" size={26} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => requireAuth('create a post', () => router.push('/create-post'))}
          >
            <Ionicons name="add-circle" size={32} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <FeedSkeleton />
        </ScrollView>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF6B35"
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}

      <GuestPrompt
        visible={guestPrompt.visible}
        action={guestPrompt.action}
        onClose={() => setGuestPrompt({ visible: false, action: '' })}
        onLogin={() => {
          setGuestPrompt({ visible: false, action: '' });
          router.push('/auth');
        }}
        onRegister={() => {
          setGuestPrompt({ visible: false, action: '' });
          router.push('/auth');
        }}
      />
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  profileButton: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 6,
    marginLeft: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 2,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
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
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  postHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  countryFlag: {
    marginLeft: 6,
    fontSize: 14,
  },
  motoTypeIcon: {
    marginLeft: 4,
    fontSize: 14,
  },
  timeAgo: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  followingButtonText: {
    color: '#FF6B35',
  },
  postContent: {
    color: '#ddd',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 4,
  },
  actionText: {
    color: '#888',
    marginLeft: 6,
    fontSize: 14,
  },
  likedText: {
    color: '#FF6B35',
  },
  commentsDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 4,
  },
  commentsDisabledText: {
    color: '#444',
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
