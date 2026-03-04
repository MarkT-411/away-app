import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getMotoTypeIcon } from '../context/MotoTypesContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Vehicle {
  id: string;
  user_id: string;
  nickname?: string;
  brand: string;
  model: string;
  year: number;
  moto_type?: string;
  color?: string;
  license_plate?: string;
  current_km: number;
  image?: string;
  is_primary: boolean;
  created_at: string;
}

interface GarageStats {
  total_vehicles: number;
  total_km: number;
  total_maintenance_cost: number;
  total_services: number;
  pending_reminders: number;
}

interface Reminder {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  title: string;
  remind_at_km?: number;
  remind_at_date?: string;
}

export default function GarageScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<GarageStats | null>(null);
  const [reminders, setReminders] = useState<{ due: Reminder[]; upcoming: Reminder[] }>({ due: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      const [vehiclesRes, statsRes, remindersRes] = await Promise.all([
        fetch(`${API_URL}/api/garage/${user.id}/vehicles`),
        fetch(`${API_URL}/api/garage/${user.id}/stats`),
        fetch(`${API_URL}/api/garage/${user.id}/reminders`),
      ]);

      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        setVehicles(data);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (remindersRes.ok) {
        const data = await remindersRes.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error fetching garage data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [user?.id]);

  const handleDeleteVehicle = (vehicleId: string, vehicleName: string) => {
    Alert.alert(
      t('common.delete'),
      `Delete ${vehicleName}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/garage/vehicles/${vehicleId}`, {
                method: 'DELETE',
              });
              if (res.ok) {
                fetchData();
              }
            } catch (error) {
              console.error('Error deleting vehicle:', error);
            }
          },
        },
      ]
    );
  };

  const maintenanceIcons: Record<string, string> = {
    oil_change: '💧',
    tire_change: '🛞',
    brake_pads: '🛑',
    chain_maintenance: '⛓️',
    spark_plugs: '⚡',
    air_filter: '💨',
    coolant: '❄️',
    general_service: '🔧',
    battery: '🔋',
    other: '📝',
  };

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('garage.title')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="car-sport" size={64} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Login Required</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Create an account to use the garage feature
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('garage.title')}</Text>
        <TouchableOpacity onPress={() => router.push('/add-vehicle')}>
          <Ionicons name="add-circle" size={28} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* Stats Section */}
        {stats && (
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('garage.stats')}</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>{vehicles.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vehicles</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {stats.total_km.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('garage.totalKm')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>{stats.total_services}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Services</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  €{stats.total_maintenance_cost.toFixed(0)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('garage.totalCost')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Due Reminders */}
        {reminders.due.length > 0 && (
          <View style={[styles.remindersCard, { backgroundColor: '#FF6B3520' }]}>
            <View style={styles.reminderHeader}>
              <Ionicons name="alert-circle" size={20} color={colors.accent} />
              <Text style={[styles.reminderTitle, { color: colors.accent }]}>
                {t('garage.dueReminders')} ({reminders.due.length})
              </Text>
            </View>
            {reminders.due.slice(0, 3).map((reminder) => (
              <View key={reminder.id} style={styles.reminderItem}>
                <Text style={styles.reminderIcon}>
                  {maintenanceIcons[reminder.maintenance_type] || '🔧'}
                </Text>
                <Text style={[styles.reminderText, { color: colors.text }]}>{reminder.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Vehicles Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
          {t('garage.myVehicles')}
        </Text>

        {vehicles.length === 0 ? (
          <View style={[styles.emptyVehicles, { backgroundColor: colors.card }]}>
            <Ionicons name="bicycle" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('garage.noVehicles')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t('garage.noVehiclesDesc')}
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.accent }]}
              onPress={() => router.push('/add-vehicle')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>{t('garage.addVehicle')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={[styles.vehicleCard, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/vehicle/${vehicle.id}`)}
            >
              <View style={styles.vehicleImageContainer}>
                {vehicle.image ? (
                  <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
                ) : (
                  <View style={[styles.vehiclePlaceholder, { backgroundColor: colors.inputBackground }]}>
                    <Text style={styles.vehiclePlaceholderIcon}>
                      {getMotoTypeIcon(vehicle.moto_type || 'sport')}
                    </Text>
                  </View>
                )}
                {vehicle.is_primary && (
                  <View style={[styles.primaryBadge, { backgroundColor: colors.accent }]}>
                    <Ionicons name="star" size={12} color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={[styles.vehicleName, { color: colors.text }]}>
                  {vehicle.nickname || `${vehicle.brand} ${vehicle.model}`}
                </Text>
                <Text style={[styles.vehicleDetails, { color: colors.textSecondary }]}>
                  {vehicle.brand} {vehicle.model} • {vehicle.year}
                </Text>
                <Text style={[styles.vehicleKm, { color: colors.accent }]}>
                  {vehicle.current_km.toLocaleString()} km
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteVehicle(vehicle.id, vehicle.nickname || `${vehicle.brand} ${vehicle.model}`)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  remindersCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  reminderIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  reminderText: {
    fontSize: 14,
  },
  emptyVehicles: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  vehicleCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  vehicleImageContainer: {
    position: 'relative',
  },
  vehicleImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  vehiclePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehiclePlaceholderIcon: {
    fontSize: 32,
  },
  primaryBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
  },
  vehicleDetails: {
    fontSize: 13,
    marginTop: 2,
  },
  vehicleKm: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
});
