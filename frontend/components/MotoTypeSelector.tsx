import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MOTO_TYPES, MotoType } from '../context/MotoTypesContext';

// Exclude "All Types" from selection when creating content
const SELECTABLE_MOTO_TYPES = MOTO_TYPES.filter(t => t.id !== 'all');

interface MotoTypeSelectorProps {
  selectedType: string | null;
  onSelect: (type: string | null) => void;
  label?: string;
}

export default function MotoTypeSelector({ 
  selectedType, 
  onSelect, 
  label = 'Motorcycle Type'
}: MotoTypeSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.hint}>Tag this with a motorcycle type (optional)</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {SELECTABLE_MOTO_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.chip,
              selectedType === type.id && styles.chipSelected
            ]}
            onPress={() => onSelect(selectedType === type.id ? null : type.id)}
          >
            <Text style={styles.chipIcon}>{type.icon}</Text>
            <Text style={[
              styles.chipLabel,
              selectedType === type.id && styles.chipLabelSelected
            ]}>
              {type.label.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  hint: {
    color: '#666',
    fontSize: 12,
    marginBottom: 10,
  },
  scroll: {
    marginHorizontal: -16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#2A2A2A',
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  chipLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: '#FF6B35',
  },
});
