import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useMembership } from '../context/MembershipContext';
import MemberPaywall from '../components/MemberPaywall';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const ROAD_PREFERENCES = [
  { id: 'curves', label: 'Curvy Roads', icon: '🛣️' },
  { id: 'panoramic', label: 'Panoramic Views', icon: '🏔️' },
  { id: 'coastal', label: 'Coastal Roads', icon: '🌊' },
  { id: 'mountain', label: 'Mountain Passes', icon: '⛰️' },
  { id: 'countryside', label: 'Countryside', icon: '🌾' },
  { id: 'historic', label: 'Historic Sites', icon: '🏛️' },
];

const AVOID_OPTIONS = [
  { id: 'highways', label: 'Highways', icon: '🛤️' },
  { id: 'tolls', label: 'Toll Roads', icon: '💰' },
  { id: 'traffic', label: 'High Traffic', icon: '🚗' },
];

interface TripPlan {
  id: string;
  route_name: string;
  description: string;
  total_distance_km: number;
  estimated_duration: string;
  waypoints: Array<{
    name: string;
    description: string;
    type: string;
    estimated_km: number;
  }>;
  highlights: string[];
  tips: string[];
  difficulty: string;
}

export default function TripPlannerScreen() {
  const [startingPoint, setStartingPoint] = useState('');
  const [distance, setDistance] = useState(150);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [selectedAvoid, setSelectedAvoid] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState<TripPlan | null>(null);
  const [history, setHistory] = useState<TripPlan[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t, selectedLanguage } = useLanguage();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/trip-planner/${user?.id}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const togglePreference = (id: string) => {
    setSelectedPreferences(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAvoid = (id: string) => {
    setSelectedAvoid(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const generateTrip = async () => {
    if (!startingPoint.trim()) {
      Alert.alert('Error', 'Please enter a starting point');
      return;
    }

    setLoading(true);
    setGeneratedTrip(null);

    try {
      const res = await fetch(`${API_URL}/api/trip-planner/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          starting_point: startingPoint.trim(),
          distance_km: distance,
          road_preferences: selectedPreferences,
          avoid: selectedAvoid,
          language: selectedLanguage || 'en',
        }),
      });

      if (res.ok) {
        const trip = await res.json();
        setGeneratedTrip(trip);
        fetchHistory();
      } else {
        const error = await res.json();
        Alert.alert('Error', error.detail || 'Failed to generate trip');
      }
    } catch (error) {
      console.error('Error generating trip:', error);
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const getWaypointIcon = (type: string) => {
    switch (type) {
      case 'start': return '🏁';
      case 'scenic': return '📸';
      case 'rest': return '☕';
      case 'fuel': return '⛽';
      case 'food': return '🍽️';
      case 'end': return '🏁';
      default: return '📍';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'challenging': return '#FF4444';
      default: return colors.accent;
    }
  };

  // Show generated trip result
  if (generatedTrip) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setGeneratedTrip(null)}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Your Trip</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Trip Header */}
          <View style={[styles.tripHeader, { backgroundColor: colors.accent }]}>
            <Text style={styles.tripName}>{generatedTrip.route_name}</Text>
            <Text style={styles.tripDescription}>{generatedTrip.description}</Text>
            <View style={styles.tripStats}>
              <View style={styles.tripStat}>
                <Ionicons name="speedometer" size={20} color="#fff" />
                <Text style={styles.tripStatText}>{generatedTrip.total_distance_km} km</Text>
              </View>
              <View style={styles.tripStat}>
                <Ionicons name="time" size={20} color="#fff" />
                <Text style={styles.tripStatText}>{generatedTrip.estimated_duration}</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(generatedTrip.difficulty) }]}>
                <Text style={styles.difficultyText}>{generatedTrip.difficulty}</Text>
              </View>
            </View>
          </View>

          {/* Waypoints */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Route Stops</Text>
          {generatedTrip.waypoints.map((waypoint, index) => (
            <View key={index} style={[styles.waypointCard, { backgroundColor: colors.card }]}>
              <View style={styles.waypointLine}>
                <View style={[styles.waypointDot, { backgroundColor: colors.accent }]}>
                  <Text style={styles.waypointIcon}>{getWaypointIcon(waypoint.type)}</Text>
                </View>
                {index < generatedTrip.waypoints.length - 1 && (
                  <View style={[styles.waypointConnector, { backgroundColor: colors.border }]} />
                )}
              </View>
              <View style={styles.waypointContent}>
                <Text style={[styles.waypointName, { color: colors.text }]}>{waypoint.name}</Text>
                <Text style={[styles.waypointDesc, { color: colors.textSecondary }]}>{waypoint.description}</Text>
                <Text style={[styles.waypointKm, { color: colors.accent }]}>
                  {waypoint.estimated_km > 0 ? `+${waypoint.estimated_km} km` : 'Start'}
                </Text>
              </View>
            </View>
          ))}

          {/* Highlights */}
          {generatedTrip.highlights.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Highlights</Text>
              <View style={[styles.highlightsCard, { backgroundColor: colors.card }]}>
                {generatedTrip.highlights.map((highlight, index) => (
                  <View key={index} style={styles.highlightItem}>
                    <Ionicons name="star" size={16} color={colors.accent} />
                    <Text style={[styles.highlightText, { color: colors.text }]}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Tips */}
          {generatedTrip.tips.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Riding Tips</Text>
              <View style={[styles.tipsCard, { backgroundColor: colors.accentLight }]}>
                {generatedTrip.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons name="bulb" size={16} color={colors.accent} />
                    <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* New Trip Button */}
          <TouchableOpacity
            style={[styles.newTripButton, { backgroundColor: colors.accent }]}
            onPress={() => setGeneratedTrip(null)}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.newTripButtonText}>Plan Another Trip</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Trip Planner</Text>
        <TouchableOpacity onPress={() => setShowHistory(!showHistory)}>
          <Ionicons name="time" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          {/* History Toggle */}
          {showHistory && history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Trips</Text>
              {history.slice(0, 3).map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={[styles.historyCard, { backgroundColor: colors.card }]}
                  onPress={() => setGeneratedTrip(trip)}
                >
                  <Text style={[styles.historyName, { color: colors.text }]}>{trip.route_name}</Text>
                  <Text style={[styles.historyDetails, { color: colors.textSecondary }]}>
                    {trip.total_distance_km} km • {trip.estimated_duration}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* AI Badge */}
          <View style={[styles.aiBadge, { backgroundColor: colors.accentLight }]}>
            <Text style={styles.aiIcon}>🤖</Text>
            <Text style={[styles.aiText, { color: colors.accent }]}>
              Powered by AI - Get personalized route suggestions
            </Text>
          </View>

          {/* Starting Point */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Starting Point *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., Milan, Rome, Barcelona..."
            placeholderTextColor={colors.textSecondary}
            value={startingPoint}
            onChangeText={setStartingPoint}
          />

          {/* Distance Slider */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Distance: {distance} km
          </Text>
          <View style={[styles.sliderContainer, { backgroundColor: colors.card }]}>
            <Slider
              style={styles.slider}
              minimumValue={50}
              maximumValue={500}
              step={10}
              value={distance}
              onValueChange={setDistance}
              minimumTrackTintColor={colors.accent}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.accent}
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>50 km</Text>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>500 km</Text>
            </View>
          </View>

          {/* Road Preferences */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Road Preferences</Text>
          <View style={styles.preferencesGrid}>
            {ROAD_PREFERENCES.map((pref) => (
              <TouchableOpacity
                key={pref.id}
                style={[
                  styles.preferenceChip,
                  { backgroundColor: colors.inputBackground, borderColor: colors.border },
                  selectedPreferences.includes(pref.id) && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                ]}
                onPress={() => togglePreference(pref.id)}
              >
                <Text style={styles.preferenceIcon}>{pref.icon}</Text>
                <Text style={[styles.preferenceLabel, { color: selectedPreferences.includes(pref.id) ? colors.accent : colors.text }]}>
                  {pref.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Avoid Options */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Avoid</Text>
          <View style={styles.avoidRow}>
            {AVOID_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.avoidChip,
                  { backgroundColor: colors.inputBackground, borderColor: colors.border },
                  selectedAvoid.includes(opt.id) && { borderColor: '#FF4444', backgroundColor: '#FFE5E5' },
                ]}
                onPress={() => toggleAvoid(opt.id)}
              >
                <Text style={styles.avoidIcon}>{opt.icon}</Text>
                <Text style={[styles.avoidLabel, { color: selectedAvoid.includes(opt.id) ? '#FF4444' : colors.text }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: colors.accent }, loading && styles.generateButtonDisabled]}
            onPress={generateTrip}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.generateButtonText}>Generating your trip...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={24} color="#fff" />
                <Text style={styles.generateButtonText}>Generate Trip</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  aiIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  aiText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  sliderContainer: {
    borderRadius: 12,
    padding: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  preferenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
  },
  preferenceIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  preferenceLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  avoidRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  avoidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
  },
  avoidIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  avoidLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  historySection: {
    marginBottom: 16,
  },
  historyCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  historyName: {
    fontSize: 15,
    fontWeight: '600',
  },
  historyDetails: {
    fontSize: 13,
    marginTop: 4,
  },
  // Trip result styles
  tripHeader: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tripName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tripDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  tripStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  tripStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripStatText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  waypointCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 4,
    overflow: 'visible',
  },
  waypointLine: {
    width: 50,
    alignItems: 'center',
    paddingVertical: 12,
  },
  waypointDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waypointIcon: {
    fontSize: 18,
  },
  waypointConnector: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  waypointContent: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 16,
  },
  waypointName: {
    fontSize: 15,
    fontWeight: '600',
  },
  waypointDesc: {
    fontSize: 13,
    marginTop: 4,
  },
  waypointKm: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  highlightsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  tipsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  newTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  newTripButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
