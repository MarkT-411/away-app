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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  image?: string;
  organizer_id: string;
  organizer_name: string;
  attendees: string[];
  max_attendees?: number;
  created_at: string;
}

const CURRENT_USER = {
  id: 'user-1',
  username: 'RiderJohn',
};

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, []);

  const handleJoin = async (eventId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/events/${eventId}/join?user_id=${CURRENT_USER.id}`,
        { method: 'POST' }
      );
      if (response.ok) {
        const result = await response.json();
        setEvents(events.map(event => 
          event.id === eventId ? { ...event, attendees: result.attendees } : event
        ));
      }
    } catch (error) {
      console.error('Error joining event:', error);
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

  const renderEvent = ({ item }: { item: Event }) => {
    const isJoined = item.attendees.includes(CURRENT_USER.id);
    const isFull = item.max_attendees && item.attendees.length >= item.max_attendees;
    
    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => router.push({ pathname: '/event-details', params: { id: item.id } })}
      >
        <View style={styles.eventImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.eventImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="calendar" size={40} color="#444" />
            </View>
          )}
          <View style={styles.dateOverlay}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>
        </View>
        
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
          
          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#888" />
              <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{item.time}</Text>
            </View>
          </View>
          
          <View style={styles.eventFooter}>
            <View style={styles.attendeeInfo}>
              <Ionicons name="people-outline" size={16} color="#FF6B35" />
              <Text style={styles.attendeeText}>
                {item.attendees.length}{item.max_attendees ? `/${item.max_attendees}` : ''} going
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
      <Ionicons name="calendar-outline" size={64} color="#444" />
      <Text style={styles.emptyTitle}>No events yet</Text>
      <Text style={styles.emptySubtitle}>Create an event for the community to join!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/create-event')}
        >
          <Ionicons name="add-circle" size={32} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
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
  addButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  eventImageContainer: {
    position: 'relative',
    height: 140,
  },
  eventImage: {
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
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    color: '#888',
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  attendeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeText: {
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
