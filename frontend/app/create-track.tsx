import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const CURRENT_USER = {
  id: 'user-1',
  username: 'RiderJohn',
};

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', color: '#4CAF50', description: 'Suitable for beginners' },
  { id: 'moderate', label: 'Moderate', color: '#FFC107', description: 'Some experience needed' },
  { id: 'hard', label: 'Hard', color: '#FF9800', description: 'Challenging terrain' },
  { id: 'expert', label: 'Expert', color: '#F44336', description: 'Very difficult' },
];

export default function CreateTrackScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [distance, setDistance] = useState('');
  const [elevationGain, setElevationGain] = useState('');
  const [difficulty, setDifficulty] = useState('moderate');
  const [region, setRegion] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/gpx+xml', 'text/xml', 'application/xml', '*/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.name;
        
        // Check file extension
        if (!fileName.toLowerCase().endsWith('.gpx')) {
          Alert.alert('Invalid File', 'Please select a GPX file (.gpx)');
          return;
        }

        // Read file content as base64
        let fileContent: string;
        
        if (Platform.OS === 'web') {
          // For web, read the file using FileReader
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          fileContent = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(base64);
            };
            reader.readAsDataURL(blob);
          });
        } else {
          // For mobile, use FileSystem
          const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          fileContent = `data:application/gpx+xml;base64,${base64}`;
        }

        setSelectedFile({
          name: fileName,
          content: fileContent,
        });
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in the title and description.');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a GPX file to upload.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          file_name: selectedFile.name,
          file_content: selectedFile.content,
          distance: distance.trim() || null,
          elevation_gain: elevationGain.trim() || null,
          difficulty,
          region: region.trim() || null,
          uploader_id: CURRENT_USER.id,
          uploader_name: CURRENT_USER.username,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Track uploaded successfully!');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to upload track. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading track:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload GPX Track</Text>
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Upload</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* File Picker */}
          <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
            {selectedFile ? (
              <View style={styles.selectedFileContainer}>
                <Ionicons name="document" size={40} color="#FF6B35" />
                <View style={styles.selectedFileInfo}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.selectedFileHint}>Tap to change file</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeFileButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="#FF6B35" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.filePickerPlaceholder}>
                <Ionicons name="cloud-upload-outline" size={48} color="#666" />
                <Text style={styles.filePickerText}>Select GPX File</Text>
                <Text style={styles.filePickerHint}>Tap to browse your files</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Track Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Mountain Loop Trail"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the route, highlights, and what riders can expect..."
              placeholderTextColor="#666"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Difficulty *</Text>
            <View style={styles.difficultyGrid}>
              {DIFFICULTIES.map((diff) => (
                <TouchableOpacity
                  key={diff.id}
                  style={[
                    styles.difficultyButton,
                    difficulty === diff.id && { backgroundColor: diff.color },
                  ]}
                  onPress={() => setDifficulty(diff.id)}
                >
                  <Text style={[
                    styles.difficultyLabel,
                    difficulty === diff.id && styles.difficultyLabelActive,
                  ]}>
                    {diff.label}
                  </Text>
                  <Text style={[
                    styles.difficultyDescription,
                    difficulty === diff.id && styles.difficultyDescriptionActive,
                  ]}>
                    {diff.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Distance</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 85 km"
                placeholderTextColor="#666"
                value={distance}
                onChangeText={setDistance}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Elevation Gain</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 1,200 m"
                placeholderTextColor="#666"
                value={elevationGain}
                onChangeText={setElevationGain}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Region</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Colorado Rockies"
              placeholderTextColor="#666"
              value={region}
              onChangeText={setRegion}
            />
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  flex: {
    flex: 1,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filePicker: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    marginBottom: 20,
    overflow: 'hidden',
  },
  filePickerPlaceholder: {
    padding: 32,
    alignItems: 'center',
  },
  filePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  filePickerHint: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  selectedFileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedFileName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  selectedFileHint: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  removeFileButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  difficultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  difficultyButton: {
    width: '48%',
    margin: '1%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
  },
  difficultyLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  difficultyLabelActive: {
    color: '#fff',
  },
  difficultyDescription: {
    color: '#888',
    fontSize: 11,
  },
  difficultyDescriptionActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  bottomPadding: {
    height: 40,
  },
});
