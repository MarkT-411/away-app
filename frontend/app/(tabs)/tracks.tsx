import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCountry } from '../../context/CountryContext';
import CountryPicker from '../../components/CountryPicker';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface GpxTrack {
  id: string;
  title: string;
  description: string;
  file_name: string;
  distance?: string;
  elevation_gain?: string;
  difficulty: string;
  region?: string;
  uploader_id: string;
  uploader_name: string;
  downloads: number;
  created_at: string;
}

const DIFFICULTIES = [
  { id: 'all', label: 'All', color: '#888' },
  { id: 'easy', label: 'Easy', color: '#4CAF50' },
  { id: 'moderate', label: 'Moderate', color: '#FFC107' },
  { id: 'hard', label: 'Hard', color: '#FF9800' },
  { id: 'expert', label: 'Expert', color: '#F44336' },
];

export default function TracksScreen() {
  const [tracks, setTracks] = useState<GpxTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [downloading, setDownloading] = useState<string | null>(null);
  const router = useRouter();
  const { selectedCountry, setSelectedCountry } = useCountry();

  const fetchTracks = async () => {
    try {
      let url = `${API_URL}/api/tracks`;
      const params = new URLSearchParams();
      if (selectedDifficulty !== 'all') {
        params.append('difficulty', selectedDifficulty);
      }
      if (selectedCountry && selectedCountry !== 'all') {
        params.append('country', selectedCountry);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTracks(data);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [selectedDifficulty]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTracks();
  }, [selectedDifficulty]);

  const handleDownload = async (trackId: string, fileName: string) => {
    setDownloading(trackId);
    try {
      const response = await fetch(`${API_URL}/api/tracks/${trackId}/download`);
      if (response.ok) {
        const data = await response.json();
        
        // Decode base64 content
        const fileContent = data.file_content;
        
        if (Platform.OS === 'web') {
          // For web, create a download link
          const link = document.createElement('a');
          link.href = fileContent.startsWith('data:') 
            ? fileContent 
            : `data:application/gpx+xml;base64,${fileContent}`;
          link.download = data.file_name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          Alert.alert('Success', 'Track downloaded!');
        } else {
          // For mobile, save to file system and share
          const fileUri = `${FileSystem.documentDirectory}${data.file_name}`;
          
          // Remove data URI prefix if present
          const base64Content = fileContent.replace(/^data:.*?;base64,/, '');
          
          await FileSystem.writeAsStringAsync(fileUri, base64Content, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Check if sharing is available
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/gpx+xml',
              dialogTitle: 'Save GPX Track',
            });
          } else {
            Alert.alert('Success', `Track saved to ${fileUri}`);
          }
        }
        
        // Update download count in UI
        setTracks(tracks.map(track => 
          track.id === trackId 
            ? { ...track, downloads: track.downloads + 1 } 
            : track
        ));
      } else {
        Alert.alert('Error', 'Failed to download track');
      }
    } catch (error) {
      console.error('Error downloading track:', error);
      Alert.alert('Error', 'Failed to download track');
    } finally {
      setDownloading(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const diff = DIFFICULTIES.find(d => d.id === difficulty);
    return diff?.color || '#888';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTrack = ({ item }: { item: GpxTrack }) => (
    <View style={styles.trackCard}>
      <View style={styles.trackHeader}>
        <View style={styles.trackIconContainer}>
          <Ionicons name="navigate" size={28} color="#FF6B35" />
        </View>
        <View style={styles.trackTitleContainer}>
          <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.trackUploader}>by {item.uploader_name}</Text>
        </View>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(item.difficulty) }
        ]}>
          <Text style={styles.difficultyText}>
            {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.trackDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.trackMeta}>
        {item.distance && (
          <View style={styles.metaItem}>
            <Ionicons name="speedometer-outline" size={16} color="#888" />
            <Text style={styles.metaText}>{item.distance}</Text>
          </View>
        )}
        {item.elevation_gain && (
          <View style={styles.metaItem}>
            <Ionicons name="trending-up" size={16} color="#888" />
            <Text style={styles.metaText}>{item.elevation_gain}</Text>
          </View>
        )}
        {item.region && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color="#888" />
            <Text style={styles.metaText}>{item.region}</Text>
          </View>
        )}
      </View>

      <View style={styles.trackFooter}>
        <View style={styles.trackStats}>
          <Ionicons name="download-outline" size={16} color="#666" />
          <Text style={styles.statsText}>{item.downloads} downloads</Text>
          <Text style={styles.dateText}>• {formatDate(item.created_at)}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleDownload(item.id, item.file_name)}
          disabled={downloading === item.id}
        >
          {downloading === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="download" size={18} color="#fff" />
              <Text style={styles.downloadButtonText}>Download</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="map-outline" size={64} color="#444" />
      <Text style={styles.emptyTitle}>No tracks found</Text>
      <Text style={styles.emptySubtitle}>
        {selectedDifficulty !== 'all' 
          ? `No ${selectedDifficulty} tracks available` 
          : 'Be the first to share a GPX track!'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GPX Tracks</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/create-track')}
        >
          <Ionicons name="add-circle" size={32} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Difficulty Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {DIFFICULTIES.map((diff) => (
          <TouchableOpacity
            key={diff.id}
            style={[
              styles.filterChip,
              selectedDifficulty === diff.id && styles.filterChipActive,
              selectedDifficulty === diff.id && { backgroundColor: diff.color },
            ]}
            onPress={() => setSelectedDifficulty(diff.id)}
          >
            <Text style={[
              styles.filterChipText,
              selectedDifficulty === diff.id && styles.filterChipTextActive,
            ]}>
              {diff.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <FlatList
          data={tracks}
          renderItem={renderTrack}
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
  filterContainer: {
    maxHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
  },
  filterChipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  trackCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  trackUploader: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  trackDescription: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  trackMeta: {
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
    fontSize: 13,
    marginLeft: 4,
  },
  trackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  trackStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  dateText: {
    color: '#555',
    fontSize: 12,
    marginLeft: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
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
