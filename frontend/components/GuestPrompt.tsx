import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

interface GuestPromptProps {
  visible: boolean;
  action: string;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export default function GuestPrompt({ 
  visible, 
  action, 
  onClose, 
  onLogin, 
  onRegister 
}: GuestPromptProps) {
  const { t } = useLanguage();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#888" />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={48} color="#FF6B35" />
          </View>
          
          <Text style={styles.title}>{t('guest.accountRequired')}</Text>
          <Text style={styles.message}>
            {t('guest.createAccountTo')} {action}
          </Text>
          
          <TouchableOpacity style={styles.primaryButton} onPress={onRegister}>
            <Ionicons name="person-add" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>{t('auth.createAccount')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={onLogin}>
            <Text style={styles.secondaryButtonText}>{t('auth.alreadyHaveAccount')} {t('auth.login')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#FF6B35',
    fontSize: 14,
  },
});
