import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import HelmetLogo from '../components/HelmetLogo';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const { selectedLanguage, setSelectedLanguage, t } = useLanguage();
  const { logout, isGuest, user } = useAuth();
  const { isAdmin } = useAdmin();

  const themeOptions: { id: ThemeMode; label: string; icon: string }[] = [
    { id: 'light', label: t('settings.lightMode'), icon: 'sunny-outline' },
    { id: 'dark', label: t('settings.darkMode'), icon: 'moon-outline' },
    { id: 'system', label: t('settings.systemDefault'), icon: 'phone-portrait-outline' },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleDeleteAccount = () => {
    const title = selectedLanguage === 'it' ? 'Elimina Account' : 'Delete Account';
    const message = selectedLanguage === 'it' 
      ? 'Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile e tutti i tuoi dati verranno eliminati permanentemente.'
      : 'Are you sure you want to delete your account? This action is irreversible and all your data will be permanently deleted.';
    const cancel = selectedLanguage === 'it' ? 'Annulla' : 'Cancel';
    const confirm = selectedLanguage === 'it' ? 'Elimina' : 'Delete';

    Alert.alert(
      title,
      message,
      [
        { text: cancel, style: 'cancel' },
        {
          text: confirm,
          style: 'destructive',
          onPress: async () => {
            try {
              if (user) {
                const response = await fetch(`${API_URL}/api/users/${user.id}`, {
                  method: 'DELETE',
                });
                if (response.ok) {
                  await logout();
                  router.replace('/');
                  Alert.alert(
                    selectedLanguage === 'it' ? 'Account Eliminato' : 'Account Deleted',
                    selectedLanguage === 'it' ? 'Il tuo account è stato eliminato con successo.' : 'Your account has been successfully deleted.'
                  );
                }
              }
            } catch (error) {
              Alert.alert(
                selectedLanguage === 'it' ? 'Errore' : 'Error',
                selectedLanguage === 'it' ? 'Impossibile eliminare l\'account. Riprova.' : 'Unable to delete account. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Membership Section */}
        {!isGuest && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Membership
            </Text>
            <TouchableOpacity
              style={[styles.membershipCard, { backgroundColor: colors.accent }]}
              onPress={() => router.push('/subscription')}
            >
              <Ionicons name="star" size={24} color="#fff" />
              <View style={styles.membershipInfo}>
                <Text style={styles.membershipTitle}>TAM Member</Text>
                <Text style={styles.membershipSubtitle}>Unlock all premium features</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('settings.appearance')}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {themeOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionRow,
                  index < themeOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                ]}
                onPress={() => setThemeMode(option.id)}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
                    <Ionicons name={option.icon as any} size={20} color={colors.accent} />
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
                </View>
                {themeMode === option.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('settings.language')}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {LANGUAGES.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.optionRow,
                  index < LANGUAGES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                ]}
                onPress={() => setSelectedLanguage(lang.code)}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.flagEmoji}>{lang.flag}</Text>
                  <Text style={[styles.optionText, { color: colors.text }]}>{lang.nativeName}</Text>
                </View>
                {selectedLanguage === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Section */}
        {!isGuest && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('settings.account')}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {/* Admin Panel - Only for admins */}
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.optionRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                  onPress={() => router.push('/admin')}
                >
                  <View style={styles.optionLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
                      <Ionicons name="shield-checkmark" size={20} color="#fff" />
                    </View>
                    <Text style={[styles.optionText, { color: colors.text, fontWeight: '600' }]}>
                      {selectedLanguage === 'it' ? 'Pannello Admin' : 'Admin Panel'}
                    </Text>
                  </View>
                  <View style={[styles.adminBadge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                  </View>
                </TouchableOpacity>
              )}
              
              {/* Logout */}
              <TouchableOpacity
                style={[styles.optionRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                onPress={handleLogout}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FFE5E5' }]}>
                    <Ionicons name="log-out-outline" size={20} color="#FF4444" />
                  </View>
                  <Text style={[styles.optionText, { color: '#FF4444' }]}>{t('auth.logout')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              
              {/* Delete Account */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={handleDeleteAccount}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FFE5E5' }]}>
                    <Ionicons name="trash-outline" size={20} color="#FF4444" />
                  </View>
                  <Text style={[styles.optionText, { color: '#FF4444' }]}>
                    {selectedLanguage === 'it' ? 'Elimina Account' : 'Delete Account'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {selectedLanguage === 'it' ? 'Legale' : 'Legal'}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {/* Privacy Policy */}
            <TouchableOpacity
              style={[styles.optionRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              onPress={() => router.push('/privacy-policy')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {selectedLanguage === 'it' ? 'Informativa Privacy' : 'Privacy Policy'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            {/* Terms of Service */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => router.push('/terms-of-service')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name="document-text-outline" size={20} color={colors.accent} />
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {selectedLanguage === 'it' ? 'Termini di Servizio' : 'Terms of Service'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <HelmetLogo size={60} />
          <Text style={[styles.appName, { color: colors.accent, fontFamily: 'Rostex' }]}>AWay</Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Adventure Way
          </Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
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
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  flagEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 8,
  },
  appVersion: {
    fontSize: 12,
    marginTop: 4,
  },
  aiBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  membershipInfo: {
    flex: 1,
  },
  membershipTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  membershipSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  adminBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
