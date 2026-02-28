import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES } from '../context/CountryContext';
import { MOTO_TYPES } from '../context/MotoTypesContext';
import { LANGUAGES, useLanguage } from '../context/LanguageContext';

interface AuthScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function AuthScreen({ onComplete, onSkip }: AuthScreenProps) {
  const [mode, setMode] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedMotoTypes, setSelectedMotoTypes] = useState<string[]>(['all']);
  const [step, setStep] = useState(1); // For register: 1=credentials, 2=preferences, 3=language

  const { login, register, authenticateWithBiometric, biometricAvailable, biometricType, continueAsGuest } = useAuth();
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const [tempLanguage, setTempLanguage] = useState(selectedLanguage);

  const handleSkip = async () => {
    await setSelectedLanguage(tempLanguage);
    await continueAsGuest();
    onSkip();
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return { hasMinLength, hasNumber, hasSpecial, isValid: hasMinLength && hasNumber && hasSpecial };
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      onComplete();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleRegister = async () => {
    if (step === 1) {
      // Validate step 1
      if (!email || !password || !confirmPassword || !username) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      if (!validateEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email');
        return;
      }
      const pwdValidation = validatePassword(password);
      if (!pwdValidation.isValid) {
        Alert.alert('Error', 'Password must be at least 6 characters with 1 number and 1 special character');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (username.length < 3) {
        Alert.alert('Error', 'Username must be at least 3 characters');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      // Go to language selection
      setStep(3);
      return;
    }

    // Step 3 - Submit registration with language
    setLoading(true);
    await setSelectedLanguage(tempLanguage);
    const motoTypes = selectedMotoTypes.includes('all') ? [] : selectedMotoTypes;
    const result = await register({
      email,
      password,
      username,
      country: selectedCountry !== 'all' ? selectedCountry : undefined,
      moto_types: motoTypes,
    });
    setLoading(false);

    if (result.success) {
      onComplete();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    const result = await authenticateWithBiometric();
    setLoading(false);

    if (result.success) {
      onComplete();
    } else {
      Alert.alert('Info', result.message);
    }
  };

  const toggleMotoType = (typeId: string) => {
    if (typeId === 'all') {
      setSelectedMotoTypes(['all']);
    } else {
      const filtered = selectedMotoTypes.filter(t => t !== 'all');
      if (filtered.includes(typeId)) {
        const newTypes = filtered.filter(t => t !== typeId);
        setSelectedMotoTypes(newTypes.length === 0 ? ['all'] : newTypes);
      } else {
        setSelectedMotoTypes([...filtered, typeId]);
      }
    }
  };

  const pwdValidation = validatePassword(password);

  // Welcome Screen
  if (mode === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="bicycle" size={80} color="#FF6B35" />
            <Text style={styles.appName}>Moto Community</Text>
            <Text style={styles.tagline}>Connect with riders worldwide</Text>
          </View>

          <View style={styles.welcomeButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setMode('register')}
            >
              <Ionicons name="person-add" size={22} color="#fff" />
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setMode('login')}
            >
              <Ionicons name="log-in" size={22} color="#FF6B35" />
              <Text style={styles.secondaryButtonText}>Log In</Text>
            </TouchableOpacity>

            {biometricAvailable && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
              >
                <Ionicons 
                  name={biometricType === 'Face ID' ? 'scan' : 'finger-print'} 
                  size={22} 
                  color="#FF6B35" 
                />
                <Text style={styles.biometricButtonText}>Login with {biometricType}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleSkip}
            >
              <Text style={styles.guestButtonText}>Browse as Guest</Text>
              <Ionicons name="arrow-forward" size={18} color="#888" />
            </TouchableOpacity>
          </View>

          <Text style={styles.guestNote}>
            Guests can browse content but cannot interact
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Login Screen
  if (mode === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => setMode('welcome')}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login to your account</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Log In</Text>
                )}
              </TouchableOpacity>

              {biometricAvailable && (
                <TouchableOpacity
                  style={styles.biometricLoginButton}
                  onPress={handleBiometricLogin}
                >
                  <Ionicons 
                    name={biometricType === 'Face ID' ? 'scan' : 'finger-print'} 
                    size={24} 
                    color="#FF6B35" 
                  />
                  <Text style={styles.biometricLoginText}>Use {biometricType}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => setMode('register')}>
                <Text style={styles.switchText}>
                  Don't have an account? <Text style={styles.switchLink}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Register Screen
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => step === 1 ? setMode('welcome') : setStep(step - 1)}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              {step === 1 ? 'Enter your details' : step === 2 ? 'Set your preferences' : 'Choose your language'}
            </Text>
          </View>

          {/* Progress indicator - 3 steps */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
            <View style={styles.progressLine} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
            <View style={styles.progressLine} />
            <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]} />
          </View>

          {step === 1 ? (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#666"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
                </TouchableOpacity>
              </View>

              {/* Password requirements */}
              {password.length > 0 && (
                <View style={styles.passwordReqs}>
                  <View style={styles.reqRow}>
                    <Ionicons 
                      name={pwdValidation.hasMinLength ? 'checkmark-circle' : 'close-circle'} 
                      size={16} 
                      color={pwdValidation.hasMinLength ? '#4CAF50' : '#888'} 
                    />
                    <Text style={[styles.reqText, pwdValidation.hasMinLength && styles.reqTextValid]}>
                      At least 6 characters
                    </Text>
                  </View>
                  <View style={styles.reqRow}>
                    <Ionicons 
                      name={pwdValidation.hasNumber ? 'checkmark-circle' : 'close-circle'} 
                      size={16} 
                      color={pwdValidation.hasNumber ? '#4CAF50' : '#888'} 
                    />
                    <Text style={[styles.reqText, pwdValidation.hasNumber && styles.reqTextValid]}>
                      At least 1 number
                    </Text>
                  </View>
                  <View style={styles.reqRow}>
                    <Ionicons 
                      name={pwdValidation.hasSpecial ? 'checkmark-circle' : 'close-circle'} 
                      size={16} 
                      color={pwdValidation.hasSpecial ? '#4CAF50' : '#888'} 
                    />
                    <Text style={[styles.reqText, pwdValidation.hasSpecial && styles.reqTextValid]}>
                      At least 1 special character
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#666"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleRegister}
              >
                <Text style={styles.submitButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMode('login')}>
                <Text style={styles.switchText}>
                  Already have an account? <Text style={styles.switchLink}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.prefLabel}>Select your country (optional)</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.prefScroll}
              >
                <TouchableOpacity
                  style={[styles.prefChip, selectedCountry === 'all' && styles.prefChipSelected]}
                  onPress={() => setSelectedCountry('all')}
                >
                  <Text style={styles.prefChipIcon}>🌍</Text>
                  <Text style={[styles.prefChipText, selectedCountry === 'all' && styles.prefChipTextSelected]}>
                    Worldwide
                  </Text>
                </TouchableOpacity>
                {COUNTRIES.filter(c => c.code !== 'all').slice(0, 10).map(country => (
                  <TouchableOpacity
                    key={country.code}
                    style={[styles.prefChip, selectedCountry === country.code && styles.prefChipSelected]}
                    onPress={() => setSelectedCountry(country.code)}
                  >
                    <Text style={styles.prefChipIcon}>{country.flag}</Text>
                    <Text style={[styles.prefChipText, selectedCountry === country.code && styles.prefChipTextSelected]}>
                      {country.name.length > 10 ? country.name.substring(0, 10) + '...' : country.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.prefLabel, { marginTop: 20 }]}>Motorcycle types you like</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.prefScroll}
              >
                {MOTO_TYPES.map(type => {
                  const isSelected = type.id === 'all' 
                    ? selectedMotoTypes.includes('all')
                    : selectedMotoTypes.includes(type.id);
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[styles.prefChip, isSelected && styles.prefChipSelected]}
                      onPress={() => toggleMotoType(type.id)}
                    >
                      <Text style={styles.prefChipIcon}>{type.icon}</Text>
                      <Text style={[styles.prefChipText, isSelected && styles.prefChipTextSelected]}>
                        {type.label.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleRegister}
              >
                <Text style={styles.submitButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : step === 3 ? (
            <View style={styles.form}>
              <Text style={styles.prefLabel}>Select your preferred language</Text>
              <View style={styles.languageGrid}>
                {LANGUAGES.map(lang => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageCard,
                      tempLanguage === lang.code && styles.languageCardSelected
                    ]}
                    onPress={() => setTempLanguage(lang.code)}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text style={[
                      styles.languageName,
                      tempLanguage === lang.code && styles.languageNameSelected
                    ]}>
                      {lang.nativeName}
                    </Text>
                    <Text style={styles.languageNameEn}>{lang.name}</Text>
                    {tempLanguage === lang.code && (
                      <View style={styles.languageCheck}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Create Account</Text>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
  },
  tagline: {
    color: '#888',
    fontSize: 16,
    marginTop: 8,
  },
  welcomeButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#FF6B35',
    fontSize: 17,
    fontWeight: '600',
  },
  biometricButton: {
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  biometricButtonText: {
    color: '#FF6B35',
    fontSize: 15,
    fontWeight: '500',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  guestButtonText: {
    color: '#888',
    fontSize: 15,
  },
  guestNote: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  progressDotActive: {
    backgroundColor: '#FF6B35',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  passwordReqs: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginTop: -8,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reqText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 8,
  },
  reqTextValid: {
    color: '#4CAF50',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#555',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  biometricLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  biometricLoginText: {
    color: '#FF6B35',
    fontSize: 15,
  },
  switchText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  switchLink: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  prefLabel: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  prefScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  prefChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  prefChipSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#2A2A2A',
  },
  prefChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  prefChipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  prefChipTextSelected: {
    color: '#FF6B35',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  languageCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  languageCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#2A2A2A',
  },
  languageFlag: {
    fontSize: 28,
    marginBottom: 6,
  },
  languageName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  languageNameSelected: {
    color: '#FF6B35',
  },
  languageNameEn: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  languageCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
