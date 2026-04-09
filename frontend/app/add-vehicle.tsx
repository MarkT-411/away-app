import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { MOTO_TYPES, getMotoTypeIcon } from '../context/MotoTypesContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const POPULAR_BRANDS = [
  'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 
  'KTM', 'Triumph', 'Harley-Davidson', 'Aprilia', 'MV Agusta',
  'Husqvarna', 'Royal Enfield', 'Benelli', 'CFMoto', 'Other'
];

export default function AddVehicleScreen() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [nickname, setNickname] = useState('');
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [currentKm, setCurrentKm] = useState('');
  const [motoType, setMotoType] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBrands, setShowBrands] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const handleSave = async () => {
    if (!brand.trim() || !model.trim() || !year.trim()) {
      Alert.alert(t('common.error'), 'Please fill in brand, model, and year');
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      Alert.alert(t('common.error'), 'Please enter a valid year');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/garage/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          brand: brand.trim(),
          model: model.trim(),
          year: yearNum,
          nickname: nickname.trim() || undefined,
          color: color.trim() || undefined,
          license_plate: licensePlate.trim() || undefined,
          current_km: parseInt(currentKm) || 0,
          moto_type: motoType || undefined,
          is_primary: isPrimary,
        }),
      });

      if (res.ok) {
        router.back();
      } else {
        const error = await res.json();
        Alert.alert(t('common.error'), error.detail || 'Failed to add vehicle');
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      Alert.alert(t('common.error'), 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('garage.addVehicle')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={[styles.saveButton, { color: colors.accent }]}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          {/* Brand Selection */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('garage.brand')} *</Text>
          <TouchableOpacity
            style={[styles.selectInput, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
            onPress={() => setShowBrands(!showBrands)}
          >
            <Text style={[styles.selectText, { color: brand ? colors.text : colors.textSecondary }]}>
              {brand || 'Select brand'}
            </Text>
            <Ionicons name={showBrands ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {showBrands && (
            <View style={[styles.brandList, { backgroundColor: colors.card, borderColor: colors.border, position: 'relative' }]}>
              <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled>
                {POPULAR_BRANDS.map((b, index) => (
                  <TouchableOpacity
                    key={b}
                    style={[
                      styles.brandItem, 
                      { borderBottomColor: colors.border },
                      brand === b && { backgroundColor: colors.accentLight },
                      index === POPULAR_BRANDS.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    onPress={() => {
                      setBrand(b);
                      setShowBrands(false);
                    }}
                  >
                    <Text style={[styles.brandText, { color: brand === b ? colors.accent : colors.text }]}>
                      {b}
                    </Text>
                    {brand === b && <Ionicons name="checkmark" size={18} color={colors.accent} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Model */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('garage.model')} *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
            value={model}
            onChangeText={setModel}
            placeholder="e.g., CBR600RR, MT-07"
            placeholderTextColor={colors.textSecondary}
          />

          {/* Year */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('garage.year')} *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
            value={year}
            onChangeText={setYear}
            placeholder="e.g., 2023"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={4}
          />

          {/* Moto Type */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {MOTO_TYPES.filter((t) => t.id !== 'all').map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeChip,
                  { backgroundColor: colors.inputBackground, borderColor: colors.border },
                  motoType === type.id && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                ]}
                onPress={() => setMotoType(motoType === type.id ? '' : type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[styles.typeLabel, { color: motoType === type.id ? colors.accent : colors.text }]}>
                  {type.label.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Nickname */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('garage.nickname')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Give your bike a name"
            placeholderTextColor={colors.textSecondary}
          />

          {/* Color */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('garage.color')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
            value={color}
            onChangeText={setColor}
            placeholder="e.g., Red, Black"
            placeholderTextColor={colors.textSecondary}
          />

          {/* License Plate */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('garage.licensePlate')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
            value={licensePlate}
            onChangeText={setLicensePlate}
            placeholder="e.g., AB123CD"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
          />

          {/* Current KM */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('garage.currentKm')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
            value={currentKm}
            onChangeText={setCurrentKm}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />

          {/* Primary Switch */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>{t('garage.setPrimary')}</Text>
            <Switch
              value={isPrimary}
              onValueChange={setIsPrimary}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>

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
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 13,
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
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
  },
  selectText: {
    fontSize: 16,
  },
  brandList: {
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 250,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  brandText: {
    fontSize: 16,
  },
  typeScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
  },
});
