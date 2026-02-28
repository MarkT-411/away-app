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

const { width } = Dimensions.get('window');

interface MotoTypePickerProps {
  compact?: boolean;
}

export default function MotoTypePicker({ compact = false }: MotoTypePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { selectedMotoTypes, toggleMotoType, getMotoTypesParam } = useMotoTypes();

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
        style={[styles.pickerButton, compact && styles.pickerButtonCompact]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.pickerIcon}>{displayIcon}</Text>
        {!compact && <Text style={styles.pickerText}>{displayText}</Text>}
        <Ionicons name="chevron-down" size={16} color="#888" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Moto Type</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
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
                    style={[styles.typeOption, isSelected && styles.typeOptionSelected]}
                    onPress={() => toggleMotoType(item.id)}
                  >
                    <Text style={styles.typeIcon}>{item.icon}</Text>
                    <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              style={styles.doneButton}
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
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
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
    color: '#fff',
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
    backgroundColor: '#1A1A1A',
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
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  modalSubtitle: {
    color: '#888',
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
    backgroundColor: '#252525',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#2A2A2A',
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  typeLabel: {
    color: '#ccc',
    fontSize: 15,
    flex: 1,
  },
  typeLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#FF6B35',
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
