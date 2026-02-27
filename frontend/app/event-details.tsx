import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

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

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        Alert.alert('Error', 'Event not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!event) return;
    
    try {
      const response = await fetch(
        `${API_URL}/api/events/${event.id}/join?user_id=${CURRENT_USER.id}`,
        { method: 'POST' }
      );
      if (response.ok) {
        const result = await response.json();
        setEvent({ ...event, attendees: result.attendees });
      }
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

  if (!event) return null;

  const isJoined = event.attendees.includes(CURRENT_USER.id);
  const isFull = event.max_attendees && event.attendees.length >= event.max_attendees;
  const isOrganizer = event.organizer_id === CURRENT_USER.id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {event.image ? (
            <Image source={{ uri: event.image }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="calendar" size={60} color="#444" />
            </View>
          )}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.organizerRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color="#888" />
            </View>
            <Text style={styles.organizerText}>Organized by </Text>
            <Text style={styles.organizerName}>{event.organizer_name}</Text>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color="#FF6B35" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color="#FF6B35" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color="#FF6B35" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="people" size={20} color="#FF6B35" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailValue}>
                  {event.attendees.length}{event.max_attendees ? ` / ${event.max_attendees}` : ''} going
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      {!isOrganizer && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.joinButton,
              isJoined && styles.joinedButton,
              isFull && !isJoined && styles.fullButton,
            ]}
            onPress={handleJoin}
            disabled={isFull && !isJoined}
          >
            <Text style={[
              styles.joinButtonText,
              isJoined && styles.joinedButtonText,
              isFull && !isJoined && styles.fullButtonText,
            ]}>
              {isJoined ? 'Leave Event' : isFull ? 'Event Full' : 'Join Event'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerText: {
    color: '#888',
    marginLeft: 10,
  },
  organizerName: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailInfo: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  description: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  joinButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  fullButton: {
    backgroundColor: '#333',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: '#FF6B35',
  },
  fullButtonText: {
    color: '#666',
  },
});
