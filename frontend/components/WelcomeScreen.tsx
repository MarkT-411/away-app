import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COUNTRIES } from '../context/CountryContext';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onComplete: (country: string) => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    onComplete(selectedCountry);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bicycle" size={64} color="#FF6B35" />
        <Text style={styles.title}>Welcome to Moto Community</Text>
        <Text style={styles.subtitle}>
          Connect with riders, join events, share routes, and buy/sell gear
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Choose your region</Text>
        <Text style={styles.sectionSubtitle}>
          Select your country or browse content worldwide
        </Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.code}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.countryCard,
                selectedCountry === item.code && styles.countryCardSelected,
              ]}
              onPress={() => setSelectedCountry(item.code)}
            >
              {item.code === 'all' ? (
                <Ionicons name="globe-outline" size={32} color={selectedCountry === item.code ? "#FF6B35" : "#888"} />
              ) : (
                <Text style={styles.countryFlag}>{item.flag}</Text>
              )}
              <Text style={[
                styles.countryName,
                selectedCountry === item.code && styles.countryNameSelected,
              ]} numberOfLines={1}>
                {item.name}
              </Text>
              {selectedCountry === item.code && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          You can change this anytime in any screen
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#888',
    fontSize: 13,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 12,
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  countryCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  countryCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#252525',
  },
  countryFlag: {
    fontSize: 32,
    marginBottom: 8,
  },
  countryName: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  countryNameSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginRight: 8,
  },
  footerNote: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
