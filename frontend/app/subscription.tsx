import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useMembership } from '../context/MembershipContext';

export default function SubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();
  const { selectedLanguage } = useLanguage();
  const { 
    membership, 
    subscribe, 
    restorePurchases,
    pauseMembership, 
    resumeMembership, 
    isMember,
    isLoading: membershipLoading,
    offerings 
  } = useMembership();

  const isItalian = selectedLanguage === 'it';

  const handleSubscribe = async () => {
    setLoading(true);
    const success = await subscribe(selectedPlan);
    setLoading(false);
    if (success) {
      router.back();
    }
  };

  const handleRestore = async () => {
    if (Platform.OS === 'web') {
      // Web doesn't support restore
      return;
    }
    setRestoring(true);
    await restorePurchases();
    setRestoring(false);
  };

  const handlePause = async (months: number) => {
    setLoading(true);
    await pauseMembership(months);
    setLoading(false);
  };

  const handleResume = async () => {
    setLoading(true);
    await resumeMembership();
    setLoading(false);
  };

  const features = [
    { icon: 'map', text: 'AI Trip Planner', free: false },
    { icon: 'alert-circle', text: 'SOS & Safety', free: false },
    { icon: 'bicycle', text: 'Rides & Trips', free: false },
    { icon: 'download', text: 'Track Downloads', free: false },
    { icon: 'newspaper', text: 'Feed', free: true },
    { icon: 'calendar', text: 'Events', free: true },
    { icon: 'cart', text: 'Marketplace', free: true },
    { icon: 'eye', text: 'View Tracks', free: true },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AWay Membership</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        {isMember && (
          <View style={[styles.statusCard, { backgroundColor: colors.accent }]}>
            <Ionicons name="checkmark-circle" size={32} color="#fff" />
            <Text style={styles.statusTitle}>You're a Member!</Text>
            <Text style={styles.statusSubtitle}>
              {membership.plan === 'annual' ? 'Annual' : 'Monthly'} Plan
            </Text>
            {membership.expiryDate && (
              <Text style={styles.statusExpiry}>
                Expires: {new Date(membership.expiryDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {membership.status === 'paused' && (
          <View style={[styles.statusCard, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="pause-circle" size={32} color="#fff" />
            <Text style={styles.statusTitle}>Membership Paused</Text>
            <Text style={styles.statusSubtitle}>
              Until: {membership.pausedUntil ? new Date(membership.pausedUntil).toLocaleDateString() : 'N/A'}
            </Text>
            <TouchableOpacity
              style={styles.resumeButton}
              onPress={handleResume}
              disabled={loading}
            >
              <Text style={styles.resumeButtonText}>Resume Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Plans */}
        {!isMember && membership.status !== 'paused' && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Your Plan</Text>
            
            {/* Annual Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedPlan === 'annual' && { borderColor: colors.accent, borderWidth: 2 },
              ]}
              onPress={() => setSelectedPlan('annual')}
            >
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>BEST VALUE</Text>
              </View>
              <View style={styles.planHeader}>
                <View style={styles.planRadio}>
                  {selectedPlan === 'annual' && (
                    <View style={[styles.planRadioInner, { backgroundColor: colors.accent }]} />
                  )}
                </View>
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, { color: colors.text }]}>Annual</Text>
                  <Text style={[styles.planPrice, { color: colors.accent }]}>€39.99/year</Text>
                  <Text style={[styles.planSaving, { color: colors.textSecondary }]}>
                    Save €7.89 (16% off)
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Monthly Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedPlan === 'monthly' && { borderColor: colors.accent, borderWidth: 2 },
              ]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <View style={styles.planHeader}>
                <View style={styles.planRadio}>
                  {selectedPlan === 'monthly' && (
                    <View style={[styles.planRadioInner, { backgroundColor: colors.accent }]} />
                  )}
                </View>
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, { color: colors.text }]}>Monthly</Text>
                  <Text style={[styles.planPrice, { color: colors.accent }]}>€3.99/month</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Subscribe Button */}
            <TouchableOpacity
              style={[styles.subscribeButton, { backgroundColor: colors.accent }]}
              onPress={handleSubscribe}
              disabled={loading || membershipLoading}
            >
              {loading || membershipLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.subscribeButtonText}>
                  {isItalian ? 'Abbonati' : 'Subscribe'} - {selectedPlan === 'annual' ? '€39.99' : '€3.99'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Restore Purchases Button */}
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={[styles.restoreButton]}
                onPress={handleRestore}
                disabled={restoring}
              >
                {restoring ? (
                  <ActivityIndicator color={colors.accent} size="small" />
                ) : (
                  <Text style={[styles.restoreButtonText, { color: colors.accent }]}>
                    {isItalian ? 'Ripristina Acquisti' : 'Restore Purchases'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Pause Option for Members */}
        {isMember && membership.pausedMonthsUsed < 3 && (
          <View style={[styles.pauseSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.pauseTitle, { color: colors.text }]}>Need a Break?</Text>
            <Text style={[styles.pauseSubtitle, { color: colors.textSecondary }]}>
              Pause your membership for up to {3 - membership.pausedMonthsUsed} more months this year
            </Text>
            <View style={styles.pauseButtons}>
              {[1, 2, 3].filter(m => m <= 3 - membership.pausedMonthsUsed).map((months) => (
                <TouchableOpacity
                  key={months}
                  style={[styles.pauseButton, { borderColor: colors.border }]}
                  onPress={() => handlePause(months)}
                  disabled={loading}
                >
                  <Text style={[styles.pauseButtonText, { color: colors.text }]}>
                    {months} month{months > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Features Comparison */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          What's Included
        </Text>
        
        <View style={[styles.featuresCard, { backgroundColor: colors.card }]}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={[
                styles.featureRow,
                index < features.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={styles.featureLeft}>
                <Ionicons name={feature.icon as any} size={20} color={colors.accent} />
                <Text style={[styles.featureText, { color: colors.text }]}>{feature.text}</Text>
              </View>
              <View style={styles.featureRight}>
                {feature.free ? (
                  <>
                    <View style={[styles.featureBadge, { backgroundColor: '#E8F5E9' }]}>
                      <Text style={[styles.featureBadgeText, { color: '#4CAF50' }]}>FREE</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </>
                ) : (
                  <>
                    <View style={[styles.featureBadge, { backgroundColor: colors.accentLight }]}>
                      <Text style={[styles.featureBadgeText, { color: colors.accent }]}>MEMBER</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                  </>
                )}
              </View>
            </View>
          ))}
        </View>

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
  statusCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  statusTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statusSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginTop: 4,
  },
  statusExpiry: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 8,
  },
  resumeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  resumeButtonText: {
    color: '#FF9800',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  planSaving: {
    fontSize: 13,
    marginTop: 2,
  },
  subscribeButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  pauseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  pauseSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  pauseButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  pauseButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  pauseButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  featuresCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    marginLeft: 12,
  },
  featureRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
