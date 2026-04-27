import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useTheme } from '../../context/AppContext';
import { Spacing, BorderRadius, Shadow } from '../../constants';

export default function ProfileScreen({ navigation }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout, isDarkMode, toggleDarkMode, role, loginAsRole } = useApp();

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', color: '#4F46E5' },
    { icon: 'card-outline', label: 'Payment Methods', color: '#06B6D4' },
    { icon: 'notifications-outline', label: 'Notifications', color: '#F59E0B' },
    { icon: 'shield-outline', label: 'Privacy & Security', color: '#10B981' },
    { icon: 'help-circle-outline', label: 'Help & Support', color: '#3B82F6' },
    { icon: 'document-text-outline', label: 'Terms & Conditions', color: '#6366F1' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={colors.gradient.hero}
          style={{
            paddingTop: insets.top + 20,
            paddingBottom: 70,
            paddingHorizontal: Spacing.xxl,
            alignItems: 'center',
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={{
            width: 110, height: 110, borderRadius: 55,
            padding: 4, backgroundColor: 'rgba(255,255,255,0.2)',
            marginBottom: 16,
          }}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: '100%', height: '100%', borderRadius: 55, borderWidth: 3, borderColor: '#FFF' }}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 55,
                  borderWidth: 3,
                  borderColor: '#FFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                }}
              >
                <Ionicons name="person" size={42} color="#FFF" />
              </View>
            )}
          </View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#FFF' }}>{user?.name || 'User'}</Text>
          <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{user?.email}</Text>
          
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 16, paddingVertical: 8,
            borderRadius: 12, marginTop: 16,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
          }}>
            <Ionicons
              name={role === 'lender' ? 'storefront' : role === 'admin' ? 'shield' : 'person'}
              size={16} color="#FFF"
            />
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFF', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              {role} Account
            </Text>
            <View style={{ marginLeft: 8, backgroundColor: '#3B82F6', borderRadius: 10, padding: 2 }}>
              <Ionicons name="checkmark-circle" size={14} color="#FFF" />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={[{
          backgroundColor: colors.card,
          borderRadius: 24,
          marginHorizontal: Spacing.xxl,
          marginTop: -40,
          padding: 24,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }, Shadow.lg]}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: colors.primary }}>{user?.rating || 4.8}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textTertiary, marginTop: 4, textTransform: 'uppercase' }}>Rating</Text>
          </View>
          <View style={{ width: 1, height: 30, backgroundColor: colors.borderLight }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: colors.primary }}>{user?.reviews || 24}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textTertiary, marginTop: 4, textTransform: 'uppercase' }}>Reviews</Text>
          </View>
          <View style={{ width: 1, height: 30, backgroundColor: colors.borderLight }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: colors.primary }}>{user?.joined?.slice(0, 4) || '2024'}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textTertiary, marginTop: 4, textTransform: 'uppercase' }}>Joined</Text>
          </View>
        </View>

        {/* Settings Groups */}
        <View style={{ paddingHorizontal: Spacing.xxl, marginTop: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 }}>Preferences</Text>
          
          <View style={[{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }, Shadow.sm]}>
            <View style={{
              width: 44, height: 44, borderRadius: 12,
              backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>Dark Mode</Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>Adjust app appearance</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          {user?.role === 'admin' && (
            <>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 32, marginBottom: 16 }}>Switch Role (Admin Only)</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                {[
                  { id: 'renter', icon: 'person', label: 'Renter' },
                  { id: 'lender', icon: 'storefront', label: 'Lender' },
                  { id: 'admin', icon: 'shield', label: 'Admin' }
                ].map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => {
                      loginAsRole(r.id);
                      navigation.reset({ index: 0, routes: [{ name: r.id === 'renter' ? 'UserTabs' : r.id === 'lender' ? 'LenderTabs' : 'AdminTabs' }] });
                    }}
                    style={{
                      flex: 1, backgroundColor: role === r.id ? colors.primary : colors.card,
                      borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1, borderColor: role === r.id ? colors.primary : colors.borderLight,
                      ...Shadow.sm
                    }}
                  >
                    <Ionicons name={r.icon} size={20} color={role === r.id ? '#FFF' : colors.textSecondary} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: role === r.id ? '#FFF' : colors.textSecondary, marginTop: 6, textTransform: 'uppercase' }}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 32, marginBottom: 16 }}>Account Settings</Text>
          <View style={[{
            backgroundColor: colors.card,
            borderRadius: 20,
            overflow: 'hidden',
          }, Shadow.sm]}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: idx < menuItems.length - 1 ? 1 : 0,
                  borderBottomColor: colors.borderLight,
                }}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: item.color + '10',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginLeft: 16 }}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            style={[{
              backgroundColor: colors.error + '10',
              borderRadius: 20,
              marginTop: 40,
              paddingVertical: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1, borderColor: colors.error + '20',
            }]}
          >
            <Ionicons name="log-out" size={22} color={colors.error} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.error, marginLeft: 10 }}>
              Sign Out Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

