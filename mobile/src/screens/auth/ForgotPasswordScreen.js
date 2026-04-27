import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/AppContext';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { Spacing, FontSize, BorderRadius } from '../../constants';

export default function ForgotPasswordScreen({ navigation }) {
  const colors = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email address'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <LinearGradient colors={colors.gradient.hero} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Ionicons name="key-outline" size={48} color="rgba(255,255,255,0.8)" style={{ marginBottom: 16 }} />
        <Text style={styles.headerTitle}>Forgot Password?</Text>
        <Text style={styles.headerSub}>No worries, we'll send you reset instructions</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.content, { flexGrow: 1 }]} keyboardShouldPersistTaps="handled">
        {sent ? (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            </View>
            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Check your email</Text>
            <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
              We've sent a password reset link to {email}
            </Text>
            <CustomButton
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              icon="arrow-back-outline"
              style={{ marginTop: 24 }}
            />
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InputField
              label="Email Address"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              placeholder="your@email.com"
              keyboardType="email-address"
              icon="mail-outline"
              error={error}
            />
            <CustomButton
              title="Send Reset Link"
              onPress={handleReset}
              loading={loading}
              icon="send-outline"
              size="lg"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
