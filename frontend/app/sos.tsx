import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Animated,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useMembership } from '../context/MembershipContext';
import MemberPaywall from '../components/MemberPaywall';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Crash detection threshold (G-force)
const CRASH_THRESHOLD = 3.5; // ~3.5G indicates potential crash
const COUNTDOWN_SECONDS = 30;

export default function SOSScreen() {
  const [crashDetectionEnabled, setCrashDetectionEnabled] = useState(true);
  const [isRideActive, setIsRideActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    fetchContacts();
    checkActiveAlert();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    let subscription: any;

    if (isRideActive && crashDetectionEnabled) {
      subscription = Accelerometer.addListener((data) => {
        const totalG = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
        
        if (totalG > CRASH_THRESHOLD && countdown === null) {
          // Potential crash detected
          triggerCrashAlert();
        }
      });

      Accelerometer.setUpdateInterval(100);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isRideActive, crashDetectionEnabled, countdown]);

  useEffect(() => {
    if (isRideActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRideActive]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sos/${user?.id}/contacts`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const checkActiveAlert = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sos/${user?.id}/active-alert`);
      if (res.ok) {
        const data = await res.json();
        setActiveAlert(data);
      }
    } catch (error) {
      console.error('Error checking active alert:', error);
    }
  };

  const triggerCrashAlert = () => {
    Vibration.vibrate([500, 500, 500, 500, 500]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCountdown(COUNTDOWN_SECONDS);
    startCountdown();
  };

  const startCountdown = () => {
    let seconds = COUNTDOWN_SECONDS;
    
    countdownRef.current = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);
      
      if (seconds <= 0) {
        clearInterval(countdownRef.current!);
        sendSOSAlert('crash_detected');
      }
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setCountdown(null);
    Vibration.cancel();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const sendSOSAlert = async (alertType: string) => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      let address = 'Unknown location';
      
      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        if (geo) {
          address = `${geo.street || ''} ${geo.city || ''} ${geo.country || ''}`;
        }
      } catch (e) {
        console.log('Geocoding failed');
      }

      const res = await fetch(`${API_URL}/api/sos/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          username: user?.username,
          alert_type: alertType,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address,
          message: alertType === 'crash_detected' 
            ? 'Automatic crash detection triggered' 
            : 'Manual SOS activated',
        }),
      });

      if (res.ok) {
        const alert = await res.json();
        setActiveAlert(alert);
        setCountdown(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        Alert.alert(
          '🆘 SOS Alert Sent',
          `Emergency contacts have been notified.\n\nLocation: ${address}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sending SOS:', error);
      Alert.alert('Error', 'Failed to send SOS alert');
    }
  };

  const resolveAlert = async (isFalseAlarm: boolean) => {
    if (!activeAlert) return;
    
    try {
      const res = await fetch(
        `${API_URL}/api/sos/alerts/${activeAlert.id}/resolve?is_false_alarm=${isFalseAlarm}`,
        { method: 'PUT' }
      );
      
      if (res.ok) {
        setActiveAlert(null);
        Alert.alert('Alert Resolved', isFalseAlarm ? 'Marked as false alarm' : 'Glad you are safe!');
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const toggleRide = () => {
    if (contacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'Please add at least one emergency contact before starting a ride.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Contact', onPress: () => router.push('/sos-contacts') }
        ]
      );
      return;
    }
    
    setIsRideActive(!isRideActive);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Countdown Modal
  if (countdown !== null) {
    return (
      <SafeAreaView style={[styles.container, styles.countdownContainer]}>
        <View style={styles.countdownContent}>
          <Ionicons name="warning" size={80} color="#FF4444" />
          <Text style={styles.crashTitle}>⚠️ CRASH DETECTED</Text>
          <Text style={styles.crashSubtitle}>SOS will be sent in</Text>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.crashSubtitle}>seconds</Text>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelCountdown}
          >
            <Ionicons name="close-circle" size={32} color="#fff" />
            <Text style={styles.cancelButtonText}>I'M OK - CANCEL</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Active Alert View
  if (activeAlert) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>SOS Active</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.activeAlertContainer}>
          <View style={styles.alertPulse}>
            <Ionicons name="alert-circle" size={80} color="#FF4444" />
          </View>
          <Text style={styles.alertActiveTitle}>🆘 SOS Alert Active</Text>
          <Text style={[styles.alertInfo, { color: colors.textSecondary }]}>
            {activeAlert.contacts_notified?.length || 0} contacts notified
          </Text>
          <Text style={[styles.alertInfo, { color: colors.textSecondary }]}>
            Location: {activeAlert.address || 'Unknown'}
          </Text>
          
          <View style={styles.resolveButtons}>
            <TouchableOpacity
              style={[styles.resolveButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => resolveAlert(false)}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.resolveButtonText}>I'm Safe</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.resolveButton, { backgroundColor: '#FF9800' }]}
              onPress={() => resolveAlert(true)}
            >
              <Ionicons name="close-circle" size={24} color="#fff" />
              <Text style={styles.resolveButtonText}>False Alarm</Text>
            </TouchableOpacity>
          </View>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>SOS & Safety</Text>
        <TouchableOpacity onPress={() => router.push('/sos-contacts')}>
          <Ionicons name="people" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <View style={styles.statusRow}>
            <View>
              <Text style={[styles.statusTitle, { color: colors.text }]}>Crash Detection</Text>
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                Auto-detect falls and impacts
              </Text>
            </View>
            <Switch
              value={crashDetectionEnabled}
              onValueChange={setCrashDetectionEnabled}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Emergency Contacts Summary */}
        <TouchableOpacity 
          style={[styles.contactsCard, { backgroundColor: colors.card }]}
          onPress={() => router.push('/sos-contacts')}
        >
          <Ionicons name="people-outline" size={24} color={colors.accent} />
          <View style={styles.contactsInfo}>
            <Text style={[styles.contactsTitle, { color: colors.text }]}>
              Emergency Contacts
            </Text>
            <Text style={[styles.contactsCount, { color: colors.textSecondary }]}>
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''} configured
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Start Ride Button */}
        <Animated.View style={[styles.rideButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={[
              styles.rideButton,
              isRideActive ? styles.rideButtonActive : { backgroundColor: colors.accent }
            ]}
            onPress={toggleRide}
          >
            <Ionicons 
              name={isRideActive ? 'stop-circle' : 'play-circle'} 
              size={48} 
              color="#fff" 
            />
            <Text style={styles.rideButtonText}>
              {isRideActive ? 'End Ride' : 'Start Ride'}
            </Text>
            <Text style={styles.rideButtonSubtext}>
              {isRideActive 
                ? 'Crash detection active' 
                : crashDetectionEnabled 
                  ? 'Enable crash detection' 
                  : 'Manual SOS only'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Manual SOS Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => {
            Alert.alert(
              '🆘 Send SOS?',
              'This will immediately notify all your emergency contacts with your location.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send SOS', style: 'destructive', onPress: () => sendSOSAlert('manual_sos') }
              ]
            );
          }}
        >
          <Ionicons name="alert-circle" size={28} color="#fff" />
          <Text style={styles.sosButtonText}>Manual SOS</Text>
        </TouchableOpacity>

        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          When ride is active, the app monitors for sudden impacts.{"\n"}
          If a crash is detected, you have 30 seconds to cancel before{"\n"}
          emergency contacts are notified.
        </Text>
      </View>
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
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  contactsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  contactsInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactsTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactsCount: {
    fontSize: 13,
    marginTop: 2,
  },
  rideButtonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  rideButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rideButtonActive: {
    backgroundColor: '#4CAF50',
  },
  rideButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  rideButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  // Countdown styles
  countdownContainer: {
    backgroundColor: '#1A0000',
  },
  countdownContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  crashTitle: {
    color: '#FF4444',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
  },
  crashSubtitle: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  countdownNumber: {
    color: '#FF4444',
    fontSize: 120,
    fontWeight: 'bold',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
    marginTop: 40,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // Active alert styles
  activeAlertContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertPulse: {
    marginBottom: 20,
  },
  alertActiveTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4444',
  },
  alertInfo: {
    fontSize: 14,
    marginTop: 8,
  },
  resolveButtons: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  resolveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
