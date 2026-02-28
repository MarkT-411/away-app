import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COUNTRIES } from '../context/CountryContext';
import { MOTO_TYPES } from '../context/MotoTypesContext';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onComplete: (country: string, motoTypes: string[]) => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [step, setStep] = useState<'country' | 'motoTypes'>('country');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedMotoTypes, setSelectedMotoTypes] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMotoType = (typeId: string) => {
    if (typeId === 'all') {
      setSelectedMotoTypes(['all']);
    } else {
      const filtered = selectedMotoTypes.filter(t => t !== 'all');
      if (filtered.includes(typeId)) {
        const newTypes = filtered.filter(t => t !== typeId);
        setSelectedMotoTypes(newTypes.length === 0 ? ['all'] : newTypes);
      } else {
        setSelectedMotoTypes([...filtered, typeId]);
      }
    }
  };

  const handleContinue = () => {
    if (step === 'country') {
      setStep('motoTypes');
    } else {
      onComplete(selectedCountry, selectedMotoTypes);
    }
  };

  const handleBack = () => {
    setStep('country');
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

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, step === 'country' && styles.progressDotActive]} />
        <View style={styles.progressLine} />
        <View style={[styles.progressDot, step === 'motoTypes' && styles.progressDotActive]} />
      </View>

      {step === 'country' ? (
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
                  styles.optionCard,
                  selectedCountry === item.code && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedCountry(item.code)}
              >
                <Text style={styles.optionIcon}>{item.flag}</Text>
                <Text style={[
                  styles.optionName,
                  selectedCountry === item.code && styles.optionNameSelected,
                ]} numberOfLines={2}>
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
      ) : (
        <View style={styles.content}>
          <View style={styles.sectionHeaderRow}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FF6B35" />
            </TouchableOpacity>
            <View>
              <Text style={styles.sectionTitle}>Choose motorcycle types</Text>
              <Text style={styles.sectionSubtitle}>
                Select one or more types you're interested in
              </Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.motoListContent}>
            {MOTO_TYPES.map((item) => {
              const isSelected = item.id === 'all' 
                ? selectedMotoTypes.includes('all')
                : selectedMotoTypes.includes(item.id);
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.motoTypeCard, isSelected && styles.motoTypeCardSelected]}
                  onPress={() => toggleMotoType(item.id)}
                >
                  <Text style={styles.motoTypeIcon}>{item.icon}</Text>
                  <Text style={[styles.motoTypeLabel, isSelected && styles.motoTypeLabelSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmarkSmall}>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>
            {step === 'country' ? 'Continue' : 'Get Started'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          You can change these settings anytime
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
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  progressDotActive: {
    backgroundColor: '#FF6B35',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
    marginTop: 2,
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
  motoListContent: {
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  optionCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#252525',
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  optionName: {
    color: '#ccc',
    fontSize: 13,
    textAlign: 'center',
  },
  optionNameSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  motoTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  motoTypeCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#252525',
  },
  motoTypeIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  motoTypeLabel: {
    color: '#ccc',
    fontSize: 15,
    flex: 1,
  },
  motoTypeLabelSelected: {
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
  checkmarkSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
