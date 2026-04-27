import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../../context/AppContext';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { Spacing, FontSize, BorderRadius } from '../../constants';

export default function SignupScreen({ navigation }) {
  const colors = useTheme();
  const { login, register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!phone.trim()) e.phone = 'Phone number is required';
    if (!password.trim()) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    console.log('Sending Signup Request:', { name, email, phone, password, role });
    const result = await register({ name, email, phone, password, role });
    setLoading(false);
    if (result.success) {
      switch (result.role) {
        case 'lender': navigation.replace('LenderTabs'); break;
        case 'admin': navigation.replace('AdminTabs'); break;
        default: navigation.replace('UserTabs');
      }
    } else {
      setErrors({ server: result.message });
    }
  };

  const roles = [
    { key: 'user', label: 'Renter', icon: 'person-outline', desc: 'Rent items from others' },
    { key: 'lender', label: 'Lender', icon: 'storefront-outline', desc: 'List items for rent' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={colors.gradient.hero}
        style={styles.headerGradient}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSub}>Join LocaLease today</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        enabled={Platform.OS !== 'web'}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>I want to</Text>
            <View style={styles.roleRow}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  onPress={() => setRole(r.key)}
                  style={[
                    styles.roleCard,
                    {
                      borderColor: role === r.key ? colors.primary : colors.border,
                      backgroundColor: role === r.key ? colors.primary + '08' : 'transparent',
                    },
                  ]}
                >
                  <Ionicons
                    name={r.icon}
                    size={28}
                    color={role === r.key ? colors.primary : colors.textTertiary}
                  />
                  <Text style={[
                    styles.roleLabel,
                    { color: role === r.key ? colors.primary : colors.textPrimary },
                  ]}>
                    {r.label}
                  </Text>
                  <Text style={[styles.roleDesc, { color: colors.textTertiary }]}>{r.desc}</Text>
                  {role === r.key && (
                    <View style={[styles.roleCheck, { backgroundColor: colors.primary }]}>
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <InputField
              label="Full Name"
              value={name}
              onChangeText={(t) => { setName(t); setErrors({ ...errors, name: null }); }}
              placeholder="John Doe"
              icon="person-outline"
              autoCapitalize="words"
              error={errors.name}
            />
            <InputField
              label="Email"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors({ ...errors, email: null }); }}
              placeholder="your@email.com"
              keyboardType="email-address"
              icon="mail-outline"
              error={errors.email}
            />
            <InputField
              label="Phone"
              value={phone}
              onChangeText={(t) => { setPhone(t); setErrors({ ...errors, phone: null }); }}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              icon="call-outline"
              error={errors.phone}
            />
            <InputField
              label="Password"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors({ ...errors, password: null }); }}
              placeholder="Min. 6 characters"
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />
            <InputField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrors({ ...errors, confirmPassword: null }); }}
              placeholder="Re-enter password"
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.confirmPassword}
            />

            <CustomButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              icon="person-add-outline"
              size="lg"
              style={{ marginTop: Spacing.md }}
            />
          </View>

          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: Spacing.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: { marginBottom: Spacing.lg },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: 40,
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    position: 'relative',
  },
  roleLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  roleDesc: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  roleCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  loginText: { fontSize: FontSize.md },
  loginLink: { fontSize: FontSize.md, fontWeight: '700' },
});
