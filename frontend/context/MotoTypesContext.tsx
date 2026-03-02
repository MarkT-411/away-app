import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MotoType {
  id: string;
  label: string;
  icon: string;
}

export const MOTO_TYPES: MotoType[] = [
  { id: 'all', label: 'All Types', icon: '🏍️' },
  { id: 'sport', label: 'Sport / Supersport', icon: '🏍️' },
  { id: 'scooter', label: 'Scooter', icon: '🛵' },
  { id: 'adventure', label: 'Adventure / Touring', icon: '🏜️' },
  { id: 'naked', label: 'Naked / Streetfighter', icon: '🔧' },
  { id: 'cruiser', label: 'Cruiser / Chopper', icon: '🏁' },
  { id: 'enduro', label: 'Enduro / Off-road', icon: '🌲' },
  { id: 'cafe_racer', label: 'Cafe Racer / Classic', icon: '🏎️' },
  { id: 'quad', label: 'Quad / ATV', icon: '🚜' },
];

interface MotoTypesContextType {
  selectedMotoTypes: string[];
  setSelectedMotoTypes: (types: string[]) => void;
  toggleMotoType: (typeId: string) => void;
  getMotoTypesParam: () => string;
  loading: boolean;
}

const MotoTypesContext = createContext<MotoTypesContextType | undefined>(undefined);

const STORAGE_KEY_MOTO_TYPES = '@moto_app_moto_types';

export function MotoTypesProvider({ children }: { children: ReactNode }) {
  const [selectedMotoTypes, setSelectedMotoTypesState] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedPreferences();
  }, []);

  const loadSavedPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_MOTO_TYPES);
      if (saved) {
        const types = JSON.parse(saved);
        setSelectedMotoTypesState(types.length > 0 ? types : ['all']);
      }
    } catch (error) {
      console.error('Error loading moto types:', error);
    } finally {
      setLoading(false);
    }
  };

  const setSelectedMotoTypes = async (types: string[]) => {
    const finalTypes = types.length === 0 ? ['all'] : types;
    setSelectedMotoTypesState(finalTypes);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_MOTO_TYPES, JSON.stringify(finalTypes));
    } catch (error) {
      console.error('Error saving moto types:', error);
    }
  };

  const toggleMotoType = async (typeId: string) => {
    let newTypes: string[];
    
    if (typeId === 'all') {
      // If selecting "All", clear other selections
      newTypes = ['all'];
    } else {
      // Remove 'all' if present and toggle the specific type
      const filtered = selectedMotoTypes.filter(t => t !== 'all');
      if (filtered.includes(typeId)) {
        newTypes = filtered.filter(t => t !== typeId);
        // If no types selected, default to 'all'
        if (newTypes.length === 0) {
          newTypes = ['all'];
        }
      } else {
        newTypes = [...filtered, typeId];
      }
    }
    
    await setSelectedMotoTypes(newTypes);
  };

  const getMotoTypesParam = (): string => {
    if (selectedMotoTypes.includes('all') || selectedMotoTypes.length === 0) {
      return 'all';
    }
    return selectedMotoTypes.join(',');
  };

  return (
    <MotoTypesContext.Provider
      value={{
        selectedMotoTypes,
        setSelectedMotoTypes,
        toggleMotoType,
        getMotoTypesParam,
        loading,
      }}
    >
      {children}
    </MotoTypesContext.Provider>
  );
}

export function useMotoTypes() {
  const context = useContext(MotoTypesContext);
  if (context === undefined) {
    throw new Error('useMotoTypes must be used within a MotoTypesProvider');
  }
  return context;
}

export function getMotoTypeLabel(id: string): string {
  const type = MOTO_TYPES.find(t => t.id === id);
  return type ? type.label : 'Unknown';
}

export function getMotoTypeIcon(id: string): string {
  const type = MOTO_TYPES.find(t => t.id === id);
  return type ? type.icon : '🏍️';
}
