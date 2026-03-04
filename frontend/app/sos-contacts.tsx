import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
  is_primary: boolean;
}

const RELATIONSHIPS = ['Family', 'Friend', 'Partner', 'Colleague', 'Other'];

export default function SOSContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sos/${user?.id}/contacts`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please enter name and phone number');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/sos/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          relationship: relationship || undefined,
          is_primary: isPrimary || contacts.length === 0,
        }),
      });

      if (res.ok) {
        resetForm();
        fetchContacts();
      } else {
        Alert.alert('Error', 'Failed to add contact');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = (contactId: string, contactName: string) => {
    Alert.alert(
      'Delete Contact',
      `Remove ${contactName} from emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/sos/contacts/${contactId}`, {
                method: 'DELETE',
              });
              if (res.ok) {
                fetchContacts();
              }
            } catch (error) {
              console.error('Error deleting contact:', error);
            }
          },
        },
      ]
    );
  };

  const handleSetPrimary = async (contactId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/sos/contacts/${contactId}/primary`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error('Error setting primary:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRelationship('');
    setIsPrimary(false);
    setShowForm(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Contacts</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close' : 'add-circle'} size={28} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          {/* Add Contact Form */}
          {showForm && (
            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Add Contact</Text>
              
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                placeholder="Name *"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
              
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                placeholder="Phone Number *"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                placeholder="Email (optional)"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>Relationship</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relationshipScroll}>
                {RELATIONSHIPS.map((rel) => (
                  <TouchableOpacity
                    key={rel}
                    style={[
                      styles.relationshipChip,
                      { backgroundColor: colors.inputBackground, borderColor: colors.border },
                      relationship === rel && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                    ]}
                    onPress={() => setRelationship(relationship === rel ? '' : rel)}
                  >
                    <Text style={[styles.relationshipText, { color: relationship === rel ? colors.accent : colors.text }]}>
                      {rel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.accent }]}
                onPress={handleSaveContact}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Add Contact</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Info */}
          <View style={[styles.infoCard, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="information-circle" size={20} color={colors.accent} />
            <Text style={[styles.infoText, { color: colors.accent }]}>
              Emergency contacts will be notified with your location when an SOS alert is triggered.
            </Text>
          </View>

          {/* Contacts List */}
          {contacts.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Ionicons name="people-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Emergency Contacts</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Add at least one contact to use SOS features
              </Text>
            </View>
          ) : (
            contacts.map((contact) => (
              <View key={contact.id} style={[styles.contactCard, { backgroundColor: colors.card }]}>
                <View style={styles.contactHeader}>
                  <View style={[styles.contactAvatar, { backgroundColor: colors.accentLight }]}>
                    <Text style={[styles.contactInitial, { color: colors.accent }]}>
                      {contact.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <View style={styles.contactNameRow}>
                      <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                      {contact.is_primary && (
                        <View style={[styles.primaryBadge, { backgroundColor: colors.accent }]}>
                          <Text style={styles.primaryBadgeText}>Primary</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>
                      {contact.phone}
                    </Text>
                    {contact.relationship && (
                      <Text style={[styles.contactRelationship, { color: colors.textSecondary }]}>
                        {contact.relationship}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.contactActions}>
                  {!contact.is_primary && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.inputBackground }]}
                      onPress={() => handleSetPrimary(contact.id)}
                    >
                      <Ionicons name="star-outline" size={18} color={colors.accent} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FFE5E5' }]}
                    onPress={() => handleDeleteContact(contact.id, contact.name)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  formCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  relationshipScroll: {
    marginBottom: 16,
  },
  relationshipChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  relationshipText: {
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 10,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
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
  contactCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInitial: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
    marginTop: 2,
  },
  contactRelationship: {
    fontSize: 12,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
