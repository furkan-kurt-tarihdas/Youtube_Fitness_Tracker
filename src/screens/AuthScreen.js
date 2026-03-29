import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { colors } from '../utils/colors';

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function AuthScreen() {
  const [isLogin, setIsLogin]         = useState(true);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [fieldError, setFieldError]   = useState('');
  const [lockoutLeft, setLockoutLeft] = useState(0);

  const attemptCount = useRef(0);
  const lockoutTimer = useRef(null);

  function startLockout() {
    setLockoutLeft(LOCKOUT_SECONDS);
    let remaining = LOCKOUT_SECONDS;
    lockoutTimer.current = setInterval(() => {
      remaining -= 1;
      setLockoutLeft(remaining);
      if (remaining <= 0) {
        clearInterval(lockoutTimer.current);
        attemptCount.current = 0;
      }
    }, 1000);
  }

  function validate() {
    if (!email || !password) {
      setFieldError('E-posta ve şifre gerekli.');
      return false;
    }
    if (!isValidEmail(email)) {
      setFieldError('Geçerli bir e-posta adresi girin.');
      return false;
    }
    if (password.length < 8) {
      setFieldError('Şifre en az 8 karakter olmalı.');
      return false;
    }
    setFieldError('');
    return true;
  }

  async function handleAuth() {
    if (lockoutLeft > 0) return;
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          // Increment attempt counter only on login failure (not signup errors)
          attemptCount.current += 1;
          if (attemptCount.current >= MAX_ATTEMPTS) {
            startLockout();
          }
          throw error;
        }
        // Successful login resets counter
        attemptCount.current = 0;
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        Alert.alert(
          'Neredeyse bitti! 🎉',
          'Sana bir doğrulama e-postası gönderdik. Gelen kutunu kontrol et!'
        );
      }
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  }

  const isLocked = lockoutLeft > 0;
  const isDisabled = loading || isLocked;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mascot & Header */}
          <View style={styles.heroSection}>
            <View style={styles.mascotBubble}>
              <Text style={styles.mascotEmoji}>💜</Text>
            </View>
            <Text style={styles.title}>Hoş Geldin!</Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? 'Antrenman serisine kaldığın yerden devam et.'
                : 'Sağlıklı alışkanlıkların yeni adresi.'}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor="#B0AEBA"
              value={email}
              onChangeText={(t) => { setEmail(t); setFieldError(''); }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              editable={!isDisabled}
            />

            <Text style={styles.inputLabel}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="En az 8 karakter"
              placeholderTextColor="#B0AEBA"
              value={password}
              onChangeText={(t) => { setPassword(t); setFieldError(''); }}
              secureTextEntry
              autoCapitalize="none"
              editable={!isDisabled}
            />

            {/* Inline validation / lockout error */}
            {(fieldError !== '' || isLocked) && (
              <Text style={styles.errorText}>
                {isLocked
                  ? `Çok fazla deneme. ${lockoutLeft}s sonra tekrar dene.`
                  : fieldError}
              </Text>
            )}

            {/* Primary CTA */}
            <TouchableOpacity
              style={[styles.primaryButton, isDisabled && styles.primaryButtonDisabled]}
              onPress={handleAuth}
              disabled={isDisabled}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLocked
                    ? `${lockoutLeft}s bekle`
                    : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <TouchableOpacity
            onPress={() => { setIsLogin(!isLogin); setFieldError(''); }}
            style={styles.toggleContainer}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleText}>
              {isLogin ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
              <Text style={styles.toggleLink}>
                {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  /* Hero */
  heroSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  mascotBubble: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EDE7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#D8B4E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  mascotEmoji: {
    fontSize: 42,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#9A8FB5',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },

  /* Card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#C4B0D8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9A8FB5',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#F7F4FC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: -8,
  },

  /* Primary Button */
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#D8B4E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* Toggle */
  toggleContainer: {
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#9A8FB5',
  },
  toggleLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
