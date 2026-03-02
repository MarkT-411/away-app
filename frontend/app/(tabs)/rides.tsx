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
import { useCountry } from '../../context/CountryContext';
import { useMotoTypes, getMotoTypeIcon } from '../../context/MotoTypesContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import CountryPicker from '../../components/CountryPicker';
import MotoTypePicker from '../../components/MotoTypePicker';
import GuestPrompt from '../../components/GuestPrompt';
import { EventsSkeleton } from '../../components/SkeletonLoader';
import * as Haptics from 'expo-haptics';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Trip {
  id: string;
  title: string;
  description: string;
  start_location: string;
  end_location: string;
  date: string;
  time: string;
  distance?: string;
  duration?: string;
  image?: string;
  moto_type?: string;
  organizer_id: string;
  organizer_name: string;
  participants: string[];
  max_participants?: number;
  created_at: string;
}

const CURRENT_USER = {
  id: 'user-1',
  username: 'RiderJohn',
};

export default function RidesScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [guestPrompt, setGuestPrompt] = useState<{ visible: boolean; action: string }>({ visible: false, action: '' });
  const router = useRouter();
  const { selectedCountry, setSelectedCountry } = useCountry();
  const { getMotoTypesParam } = useMotoTypes();
  const { user, isGuest } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const currentUser = user ? { id: user.id, username: user.username } : { id: 'guest', username: 'Guest' };

  const requireAuth = (action: string, callback: () => void) => {
    if (isGuest) {
      setGuestPrompt({ visible: true, action });
    } else {
      callback();
    }
  };

  const fetchTrips = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCountry && selectedCountry !== 'all') {
        params.append('country', selectedCountry);
      }
      const motoTypes = getMotoTypesParam();
      if (motoTypes !== 'all') {
        params.append('moto_types', motoTypes);
      }
      let url = `${API_URL}/api/trips`;
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [selectedCountry, getMotoTypesParam()]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, [selectedCountry, getMotoTypesParam()]);

  const handleJoin = async (tripId: string) => {
    // Guests CANNOT join rides
    if (isGuest) {
      setGuestPrompt({ visible: true, action: 'join group rides' });
      return;
    }
    
    try {
      const response = await fetch(
        `${API_URL}/api/trips/${tripId}/join?user_id=${currentUser.id}`,
        { method: 'POST' }
      );
      if (response.ok) {
        const result = await response.json();
        setTrips(trips.map(trip => 
          trip.id === tripId ? { ...trip, participants: result.participants } : trip
        ));
      }
    } catch (error) {
      console.error('Error joining trip:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderTrip = ({ item }: { item: Trip }) => {
    const isJoined = item.participants.includes(currentUser.id);
    const isFull = item.max_participants && item.participants.length >= item.max_participants;
    
    return (
      <TouchableOpacity 
        style={[styles.tripCard, { backgroundColor: colors.card }]}
        onPress={() => router.push({ pathname: '/trip-details', params: { id: item.id } })}
      >
        <View style={styles.tripImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.tripImage} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: colors.inputBackground }]}>
              <Ionicons name="map" size={40} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.dateOverlay}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>
        </View>
        
        <View style={styles.tripInfo}>
          <Text style={[styles.tripTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.routeText, { color: colors.textSecondary }]} numberOfLines={1}>{item.start_location}</Text>
            </View>
            <View style={[styles.routeLine, { borderColor: colors.border }]} />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.routeDotEnd, { backgroundColor: colors.accent }]} />
              <Text style={[styles.routeText, { color: colors.textSecondary }]} numberOfLines={1}>{item.end_location}</Text>
            </View>
          </View>
          
          <View style={styles.tripMeta}>
            {item.distance && (
              <View style={styles.metaItem}>
                <Ionicons name="speedometer-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.distance}</Text>
              </View>
            )}
            {item.duration && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.duration}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.time}</Text>
            </View>
          </View>
          
          <View style={styles.tripFooter}>
            <View style={styles.participantInfo}>
              <Ionicons name="people-outline" size={16} color="#FF6B35" />
              <Text style={styles.participantText}>
                {item.participants.length}{item.max_participants ? `/${item.max_participants}` : ''} riders
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.joinButton,
                isJoined && styles.joinedButton,
                isFull && !isJoined && styles.fullButton,
              ]}
              onPress={(e) => {
                e.stopPropagation();
                if (!isFull || isJoined) handleJoin(item.id);
              }}
              disabled={isFull && !isJoined}
            >
              <Text style={[
                styles.joinButtonText,
                isJoined && styles.joinedButtonText,
                isFull && !isJoined && styles.fullButtonText,
              ]}>
                {isJoined ? 'Joined' : isFull ? 'Full' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="map-outline" size={64} color={colors.border} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No rides planned</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Plan a group ride for the community!</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Group Rides</Text>
        <View style={styles.headerActions}>
          <MotoTypePicker compact />
          <CountryPicker 
            selectedCountry={selectedCountry} 
            onSelect={setSelectedCountry}
            compact
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => requireAuth('create a group ride', () => router.push('/create-trip'))}
          >
            <Ionicons name="add-circle" size={32} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTrip}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    padding: 4,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tripImageContainer: {
    position: 'relative',
    height: 120,
  },
  tripImage: {
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
  dateOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dateText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  tripInfo: {
    padding: 16,
  },
  tripTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  routeContainer: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  routeDotEnd: {
    backgroundColor: '#FF6B35',
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#444',
    marginLeft: 4,
    marginVertical: 2,
  },
  routeText: {
    color: '#ccc',
    fontSize: 13,
    flex: 1,
  },
  tripMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 4,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantText: {
    color: '#FF6B35',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  fullButton: {
    backgroundColor: '#333',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  joinedButtonText: {
    color: '#FF6B35',
  },
  fullButtonText: {
    color: '#666',
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
