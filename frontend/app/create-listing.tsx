import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import MotoTypeSelector from '../components/MotoTypeSelector';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const CURRENT_USER = {
  id: 'user-1',
  username: 'RiderJohn',
};

const CONDITIONS = ['new', 'like-new', 'good', 'fair'];
const CATEGORIES = [
  { id: 'parts', label: 'Parts', icon: 'cog-outline' },
  { id: 'accessories', label: 'Accessories', icon: 'glasses-outline' },
  { id: 'gear', label: 'Gear', icon: 'shirt-outline' },
  { id: 'bikes', label: 'Bikes', icon: 'bicycle-outline' },
];

const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
];

export default function CreateListingScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('good');
  const [category, setCategory] = useState('parts');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedMotoType, setSelectedMotoType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Limit Reached', 'You can only add up to 4 images.');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImages([...images, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Error', 'Please enter a valid price.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/market`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: priceNum,
          condition,
          category,
          moto_type: selectedMotoType,
          images,
          seller_id: CURRENT_USER.id,
          seller_name: CURRENT_USER.username,
          contact_info: contactInfo.trim() || null,
          location: location.trim() || null,
        }),
      });

      if (response.ok) {
        router.back();
      } else {
        Alert.alert('Error', 'Failed to create listing. Please try again.');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
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
          <Text style={styles.headerTitle}>New Listing</Text>
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.imagesSection}>
            <Text style={styles.label}>Photos (up to 4)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imagesRow}>
                {images.map((img, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri: img }} style={styles.selectedImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF6B35" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 4 && (
                  <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                    <Ionicons name="add" size={32} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="What are you selling?"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price *</Text>
            <View style={styles.priceInput}>
              <Text style={styles.priceSymbol}>$</Text>
              <TextInput
                style={[styles.input, styles.priceField]}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons 
                    name={cat.icon as any} 
                    size={20} 
                    color={category === cat.id ? '#fff' : '#888'} 
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat.id && styles.categoryButtonTextActive,
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condition *</Text>
            <View style={styles.conditionRow}>
              {CONDITIONS.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.conditionButton,
                    condition === cond && styles.conditionButtonActive,
                  ]}
                  onPress={() => setCondition(cond)}
                >
                  <Text style={[
                    styles.conditionButtonText,
                    condition === cond && styles.conditionButtonTextActive,
                  ]}>
                    {cond.charAt(0).toUpperCase() + cond.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your item, include details about condition, specifications, etc."
              placeholderTextColor="#666"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Los Angeles, CA"
              placeholderTextColor="#666"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Info (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone or email for buyers to reach you"
              placeholderTextColor="#666"
              value={contactInfo}
              onChangeText={setContactInfo}
            />
          </View>

          <MotoTypeSelector 
            selectedType={selectedMotoType}
            onSelect={setSelectedMotoType}
            label="Compatible Moto Type"
          />

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
  imagesSection: {
    marginBottom: 20,
  },
  imagesRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#0D0D0D',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
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
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceSymbol: {
    color: '#FF6B35',
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  priceField: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryButtonText: {
    color: '#888',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  conditionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
  },
  conditionButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  conditionButtonText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  conditionButtonTextActive: {
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
});
