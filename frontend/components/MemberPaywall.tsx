import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface MemberPaywallProps {
  featureName: string;
  featureIcon?: string;
  description?: string;
}

export default function MemberPaywall({ 
  featureName, 
  featureIcon = 'lock-closed',
  description 
}: MemberPaywallProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const features = [
    { icon: 'map', text: 'AI Trip Planner' },
    { icon: 'alert-circle', text: 'SOS & Safety' },
    { icon: 'bicycle', text: 'Rides & Trips' },
    { icon: 'download', text: 'Track Downloads' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.lockContainer, { backgroundColor: colors.accentLight }]}>
        <Ionicons name={featureIcon as any} size={64} color={colors.accent} />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        🔒 {featureName}
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {description || t('membership.featureRequiresMember') || 'This feature is available for AWay Members'}
      </Text>

      <View style={[styles.featuresCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.featuresTitle, { color: colors.text }]}>
          {t('membership.memberBenefits') || 'Member Benefits:'}
        </Text>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name={feature.icon as any} size={20} color={colors.accent} />
            <Text style={[styles.featureText, { color: colors.text }]}>{feature.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.pricingRow}>
        <View style={[styles.priceTag, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.priceAmount, { color: colors.accent }]}>€3.99</Text>
          <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>/month</Text>
        </View>
        <Text style={[styles.orText, { color: colors.textSecondary }]}>or</Text>
        <View style={[styles.priceTag, styles.priceTagBest, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}>
          <Text style={[styles.priceAmount, { color: colors.accent }]}>€39.99</Text>
          <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>/year</Text>
          <View style={[styles.saveBadge, { backgroundColor: colors.accent }]}>
            <Text style={styles.saveBadgeText}>SAVE 16%</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.subscribeButton, { backgroundColor: colors.accent }]}
        onPress={() => router.push('/subscription')}
      >
        <Ionicons name="star" size={22} color="#fff" />
        <Text style={styles.subscribeButtonText}>
          {t('membership.becomeMember') || 'Become a Member'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
          {t('common.goBack') || 'Go Back'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  featuresCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    marginLeft: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  priceTag: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  priceTagBest: {
    borderWidth: 2,
    position: 'relative',
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  pricePeriod: {
    fontSize: 12,
    marginTop: 2,
  },
  orText: {
    fontSize: 14,
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 15,
  },
});
