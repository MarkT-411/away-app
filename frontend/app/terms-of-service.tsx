import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { selectedLanguage } = useLanguage();

  const isItalian = selectedLanguage === 'it';

  const content = isItalian ? {
    title: 'Termini di Servizio',
    lastUpdate: 'Ultimo aggiornamento: Marzo 2026',
    sections: [
      {
        title: '1. Accettazione dei Termini',
        text: 'Utilizzando l\'app AWay, accetti questi Termini di Servizio. Se non sei d\'accordo, non utilizzare l\'app.'
      },
      {
        title: '2. Descrizione del Servizio',
        text: 'AWay è una piattaforma social per motociclisti che offre:\n• Condivisione di post e foto\n• Organizzazione di eventi e viaggi di gruppo\n• Marketplace per compravendita\n• Tracce GPX per percorsi\n• Sistema SOS per emergenze\n• Pianificazione viaggi con AI'
      },
      {
        title: '3. Account Utente',
        text: 'Per utilizzare AWay devi:\n• Avere almeno 16 anni\n• Fornire informazioni accurate\n• Mantenere sicure le tue credenziali\n• Non condividere l\'account con altri\n• Essere responsabile delle attività sul tuo account'
      },
      {
        title: '4. Regole di Condotta',
        text: 'È vietato:\n• Pubblicare contenuti illegali, offensivi o inappropriati\n• Molestare, minacciare o discriminare altri utenti\n• Pubblicare spam o contenuti ingannevoli\n• Violare i diritti di proprietà intellettuale\n• Utilizzare l\'app per scopi illegali\n• Creare account falsi'
      },
      {
        title: '5. Contenuti Utente',
        text: 'Mantieni la proprietà dei tuoi contenuti ma ci concedi una licenza per utilizzarli nell\'app. Sei responsabile dei contenuti che pubblichi.'
      },
      {
        title: '6. Abbonamento Member',
        text: 'L\'abbonamento Member:\n• Si rinnova automaticamente\n• Può essere cancellato in qualsiasi momento\n• Non prevede rimborsi per periodi parziali\n• Include funzionalità premium (SOS, AI Trip Planner, ecc.)'
      },
      {
        title: '7. Limitazione di Responsabilità',
        text: 'AWay è fornito "così com\'è". Non garantiamo che:\n• Il servizio sia sempre disponibile\n• La funzione SOS sostituisca i servizi di emergenza ufficiali\n• Le informazioni degli altri utenti siano accurate'
      },
      {
        title: '8. Modifiche ai Termini',
        text: 'Possiamo modificare questi termini. Le modifiche significative saranno comunicate via email o notifica nell\'app.'
      },
      {
        title: '9. Chiusura Account',
        text: 'Puoi chiudere il tuo account in qualsiasi momento dalle impostazioni. Ci riserviamo il diritto di sospendere account che violano questi termini.'
      },
      {
        title: '10. Contatti',
        text: 'Per domande sui Termini di Servizio:\nsupport@tam-app.com'
      }
    ]
  } : {
    title: 'Terms of Service',
    lastUpdate: 'Last updated: March 2026',
    sections: [
      {
        title: '1. Acceptance of Terms',
        text: 'By using the AWay app, you accept these Terms of Service. If you disagree, do not use the app.'
      },
      {
        title: '2. Service Description',
        text: 'AWay is a social platform for motorcyclists offering:\n• Sharing posts and photos\n• Organizing events and group rides\n• Marketplace for buying/selling\n• GPX tracks for routes\n• SOS system for emergencies\n• AI trip planning'
      },
      {
        title: '3. User Account',
        text: 'To use AWay you must:\n• Be at least 16 years old\n• Provide accurate information\n• Keep your credentials secure\n• Not share your account\n• Be responsible for account activities'
      },
      {
        title: '4. Code of Conduct',
        text: 'Prohibited:\n• Posting illegal, offensive or inappropriate content\n• Harassing, threatening or discriminating users\n• Posting spam or misleading content\n• Violating intellectual property rights\n• Using the app for illegal purposes\n• Creating fake accounts'
      },
      {
        title: '5. User Content',
        text: 'You retain ownership of your content but grant us a license to use it in the app. You are responsible for your published content.'
      },
      {
        title: '6. Member Subscription',
        text: 'Member subscription:\n• Renews automatically\n• Can be canceled anytime\n• No refunds for partial periods\n• Includes premium features (SOS, AI Trip Planner, etc.)'
      },
      {
        title: '7. Limitation of Liability',
        text: 'AWay is provided "as is". We do not guarantee that:\n• The service will always be available\n• SOS feature replaces official emergency services\n• Other users\' information is accurate'
      },
      {
        title: '8. Changes to Terms',
        text: 'We may modify these terms. Significant changes will be communicated via email or app notification.'
      },
      {
        title: '9. Account Closure',
        text: 'You can close your account anytime from settings. We reserve the right to suspend accounts violating these terms.'
      },
      {
        title: '10. Contact',
        text: 'For Terms of Service questions:\nsupport@tam-app.com'
      }
    ]
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{content.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdate, { color: colors.textSecondary }]}>
          {content.lastUpdate}
        </Text>

        {content.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
              {section.text}
            </Text>
          </View>
        ))}

        <View style={styles.bottomSpacing} />
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lastUpdate: {
    fontSize: 13,
    marginTop: 16,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 40,
  },
});
