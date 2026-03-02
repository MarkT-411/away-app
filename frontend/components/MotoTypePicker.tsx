import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOTO_TYPES, getMotoTypeIcon, useMotoTypes } from '../context/MotoTypesContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface MotoTypePickerProps {
  compact?: boolean;
}

export default function MotoTypePicker({ compact = false }: MotoTypePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { selectedMotoTypes, toggleMotoType, getMotoTypesParam } = useMotoTypes();
  const { colors } = useTheme();

  const isAllSelected = selectedMotoTypes.includes('all');
  const selectedCount = isAllSelected ? MOTO_TYPES.length - 1 : selectedMotoTypes.length;
  
  const displayText = isAllSelected 
    ? 'All' 
    : selectedCount === 1 
      ? MOTO_TYPES.find(t => t.id === selectedMotoTypes[0])?.label.split(' ')[0] || 'Select'
      : `${selectedCount} types`;

  const displayIcon = isAllSelected 
    ? '🏍️' 
    : selectedCount === 1 
      ? getMotoTypeIcon(selectedMotoTypes[0])
      : '🏍️';

  return (
    <>
      <TouchableOpacity
        style={[
          styles.pickerButton, 
          compact && styles.pickerButtonCompact,
          { backgroundColor: colors.card, borderColor: colors.border }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.pickerIcon}>{displayIcon}</Text>
        {!compact && <Text style={[styles.pickerText, { color: colors.text }]}>{displayText}</Text>}
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filter by Moto Type</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Select one or more motorcycle types
            </Text>

            <FlatList
              data={MOTO_TYPES}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = item.id === 'all' 
                  ? selectedMotoTypes.includes('all')
                  : selectedMotoTypes.includes(item.id);
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.typeOption, 
                      { backgroundColor: colors.inputBackground, borderColor: 'transparent' },
                      isSelected && { borderColor: colors.accent, backgroundColor: colors.accentLight }
                    ]}
                    onPress={() => toggleMotoType(item.id)}
                  >
                    <Text style={styles.typeIcon}>{item.icon}</Text>
                    <Text style={[
                      styles.typeLabel, 
                      { color: colors.textSecondary },
                      isSelected && { color: colors.text, fontWeight: '600' }
                    ]}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkmark, { backgroundColor: colors.accent }]}>
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.accent }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  pickerButtonCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  pickerIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  pickerText: {
    fontSize: 13,
    marginRight: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  typeLabel: {
    fontSize: 15,
    flex: 1,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
