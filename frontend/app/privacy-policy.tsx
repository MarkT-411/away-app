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

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { selectedLanguage } = useLanguage();

  const isItalian = selectedLanguage === 'it';

  const content = isItalian ? {
    title: 'Informativa sulla Privacy',
    lastUpdate: 'Ultimo aggiornamento: Marzo 2026',
    sections: [
      {
        title: '1. Introduzione',
        text: 'AWay ("noi", "nostro" o "app") rispetta la tua privacy. Questa informativa descrive come raccogliamo, utilizziamo e proteggiamo le tue informazioni personali.'
      },
      {
        title: '2. Dati Raccolti',
        text: 'Raccogliamo i seguenti dati:\n• Informazioni account (email, username, password criptata)\n• Foto profilo e contenuti pubblicati\n• Posizione geografica (solo con il tuo consenso)\n• Dati del dispositivo per migliorare l\'esperienza\n• Dati di utilizzo e preferenze'
      },
      {
        title: '3. Utilizzo dei Dati',
        text: 'Utilizziamo i tuoi dati per:\n• Fornire e migliorare i nostri servizi\n• Personalizzare la tua esperienza\n• Funzionalità SOS e rilevamento incidenti\n• Comunicazioni relative al servizio\n• Sicurezza e prevenzione frodi'
      },
      {
        title: '4. Condivisione dei Dati',
        text: 'Non vendiamo i tuoi dati. Condividiamo informazioni solo con:\n• Provider di servizi che ci aiutano a operare l\'app\n• Autorità legali se richiesto dalla legge\n• Contatti di emergenza (funzione SOS)'
      },
      {
        title: '5. Sicurezza',
        text: 'Utilizziamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati, inclusa la crittografia dei dati sensibili.'
      },
      {
        title: '6. I Tuoi Diritti',
        text: 'Hai diritto di:\n• Accedere ai tuoi dati\n• Correggere dati inesatti\n• Richiedere la cancellazione del tuo account\n• Opporti al trattamento dei dati\n• Portabilità dei dati'
      },
      {
        title: '7. Conservazione',
        text: 'Conserviamo i tuoi dati finché il tuo account è attivo. Dopo la cancellazione, i dati vengono eliminati entro 30 giorni.'
      },
      {
        title: '8. Contatti',
        text: 'Per domande sulla privacy, contattaci a:\nprivacy@away-app.com'
      }
    ]
  } : {
    title: 'Privacy Policy',
    lastUpdate: 'Last updated: March 2026',
    sections: [
      {
        title: '1. Introduction',
        text: 'AWay ("we", "our" or "app") respects your privacy. This policy describes how we collect, use, and protect your personal information.'
      },
      {
        title: '2. Data Collected',
        text: 'We collect the following data:\n• Account information (email, username, encrypted password)\n• Profile photos and published content\n• Geographic location (only with your consent)\n• Device data to improve experience\n• Usage data and preferences'
      },
      {
        title: '3. Use of Data',
        text: 'We use your data to:\n• Provide and improve our services\n• Personalize your experience\n• SOS and crash detection features\n• Service-related communications\n• Security and fraud prevention'
      },
      {
        title: '4. Data Sharing',
        text: 'We do not sell your data. We share information only with:\n• Service providers who help us operate the app\n• Legal authorities if required by law\n• Emergency contacts (SOS feature)'
      },
      {
        title: '5. Security',
        text: 'We use technical and organizational security measures to protect your data, including encryption of sensitive data.'
      },
      {
        title: '6. Your Rights',
        text: 'You have the right to:\n• Access your data\n• Correct inaccurate data\n• Request deletion of your account\n• Object to data processing\n• Data portability'
      },
      {
        title: '7. Retention',
        text: 'We retain your data as long as your account is active. After deletion, data is removed within 30 days.'
      },
      {
        title: '8. Contact',
        text: 'For privacy questions, contact us at:\nprivacy@away-app.com'
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
