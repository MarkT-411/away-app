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

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trips/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTrip(data);
      } else {
        Alert.alert('Error', 'Trip not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      Alert.alert('Error', 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!trip) return;
    
    try {
      const response = await fetch(
        `${API_URL}/api/trips/${trip.id}/join?user_id=${CURRENT_USER.id}`,
        { method: 'POST' }
      );
      if (response.ok) {
        const result = await response.json();
        setTrip({ ...trip, participants: result.participants });
      }
    } catch (error) {
      console.error('Error joining trip:', error);
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

  if (!trip) return null;

  const isJoined = trip.participants.includes(CURRENT_USER.id);
  const isFull = trip.max_participants && trip.participants.length >= trip.max_participants;
  const isOrganizer = trip.organizer_id === CURRENT_USER.id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {trip.image ? (
            <Image source={{ uri: trip.image }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="map" size={60} color="#444" />
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
          <Text style={styles.title}>{trip.title}</Text>
          
          <View style={styles.organizerRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color="#888" />
            </View>
            <Text style={styles.organizerText}>Led by </Text>
            <Text style={styles.organizerName}>{trip.organizer_name}</Text>
          </View>

          <View style={styles.routeCard}>
            <Text style={styles.routeTitle}>Route</Text>
            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <View style={styles.routeDot} />
                <View style={styles.routeInfo}>
                  <Text style={styles.routeLabel}>Start</Text>
                  <Text style={styles.routeValue}>{trip.start_location}</Text>
                </View>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, styles.routeDotEnd]} />
                <View style={styles.routeInfo}>
                  <Text style={styles.routeLabel}>End</Text>
                  <Text style={styles.routeValue}>{trip.end_location}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color="#FF6B35" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(trip.date)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color="#FF6B35" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Meeting Time</Text>
                <Text style={styles.detailValue}>{trip.time}</Text>
              </View>
            </View>

            {trip.distance && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Ionicons name="speedometer" size={20} color="#FF6B35" />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Distance</Text>
                    <Text style={styles.detailValue}>{trip.distance}</Text>
                  </View>
                </View>
              </>
            )}

            {trip.duration && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Ionicons name="hourglass" size={20} color="#FF6B35" />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>{trip.duration}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="people" size={20} color="#FF6B35" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Riders</Text>
                <Text style={styles.detailValue}>
                  {trip.participants.length}{trip.max_participants ? ` / ${trip.max_participants}` : ''} joined
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this ride</Text>
            <Text style={styles.description}>{trip.description}</Text>
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
              {isJoined ? 'Leave Ride' : isFull ? 'Ride Full' : 'Join Ride'}
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
    height: 220,
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
  routeCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  routeTitle: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  routeContainer: {
    paddingLeft: 4,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginTop: 4,
  },
  routeDotEnd: {
    backgroundColor: '#FF6B35',
  },
  routeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  routeLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 2,
  },
  routeValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#444',
    marginLeft: 5,
    marginVertical: 4,
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
