import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../../context/AppContext';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants';

export default function LoginScreen({ navigation }) {
  const colors = useTheme();
  const { login, loginAsRole } = useApp();
  const [role, setRole] = useState('user'); // 'user' or 'lender'

  const [email, setEmail] = useState('saharsh@example.com');
  const [password, setPassword] = useState('password123');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      // If user logs in as lender but chose user portal, we should warn or redirect
      navigateByRole(result.role);
    } else {
      setErrors({ server: result.message });
    }
  };

  const navigateByRole = (role) => {
    if (role === 'admin') navigation.replace('AdminTabs');
    else if (role === 'lender') navigation.replace('LenderTabs');
    else navigation.replace('UserTabs');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={colors.gradient.hero}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Ionicons name="cube-outline" size={28} color="#4F46E5" />
            </View>
            <Text style={styles.logoText}>LocaLease</Text>
          </View>
          <Text style={styles.welcomeText}>Portal Login</Text>
          <Text style={styles.welcomeSub}>Select your portal and sign in</Text>
        </View>
      </LinearGradient>

      <View style={styles.portalToggleContainer}>
        <TouchableOpacity 
          onPress={() => setRole('user')}
          style={[styles.portalToggle, role === 'user' && { backgroundColor: colors.primary }]}
        >
          <Ionicons name="person-outline" size={18} color={role === 'user' ? '#FFF' : colors.textSecondary} />
          <Text style={[styles.portalToggleText, { color: role === 'user' ? '#FFF' : colors.textSecondary }]}>Renter Portal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setRole('lender')}
          style={[styles.portalToggle, role === 'lender' && { backgroundColor: colors.secondary }]}
        >
          <Ionicons name="storefront-outline" size={18} color={role === 'lender' ? '#FFF' : colors.textSecondary} />
          <Text style={[styles.portalToggleText, { color: role === 'lender' ? '#FFF' : colors.textSecondary }]}>Lender Portal</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
        enabled={Platform.OS !== 'web'}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
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
              label="Password"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors({ ...errors, password: null }); }}
              placeholder="Enter your password"
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />

            {errors.server && <Text style={{ color: colors.error, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{errors.server}</Text>}

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton
              title={`Sign In to ${role === 'user' ? 'Renter' : 'Lender'} Portal`}
              onPress={handleLogin}
              loading={loading}
              icon="log-in-outline"
              color={role === 'user' ? colors.primary : colors.secondary}
              size="lg"
            />

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <TouchableOpacity
              onPress={() => navigateByRole('admin')}
              style={styles.adminAccessBtn}
            >
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.textTertiary} />
              <Text style={[styles.adminAccessText, { color: colors.textTertiary }]}>Admin Command Access</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signupRow}>
            <Text style={[styles.signupText, { color: colors.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
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
    paddingBottom: 40,
    paddingHorizontal: Spacing.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {},
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  portalToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    marginHorizontal: Spacing.xl,
    marginTop: -28,
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  portalToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  portalToggleText: {
    fontSize: 13,
    fontWeight: '800',
  },
  formContainer: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 40,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
    marginTop: -Spacing.sm,
  },
  forgotText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  divider: { flex: 1, height: 1 },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSize.sm,
  },
  adminAccessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  adminAccessText: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  signupText: { fontSize: FontSize.md },
  signupLink: { fontSize: FontSize.md, fontWeight: '700' },
});
