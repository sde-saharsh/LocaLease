import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../../context/AppContext';
import Header from '../../components/Header';
import { Spacing, BorderRadius, Shadow } from '../../constants';

export default function ManageUsersScreen({ navigation }) {
  const colors = useTheme();
  const { users } = useApp();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filtered = users.filter((u) => {
    const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    renter: colors.primary,
    user: colors.primary,
    lender: colors.secondary,
    admin: colors.accent,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Manage Users" subtitle={`${users.length} total`} centerTitle />

      <View style={{ paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md }}>
        <View style={{
          flexDirection: 'row', backgroundColor: colors.inputBackground,
          borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg,
          alignItems: 'center', height: 44,
        }}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            placeholder="Search users..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: colors.textPrimary, marginLeft: 8, fontSize: 14 }}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['all', 'renter', 'lender', 'admin'].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setFilterRole(r)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: filterRole === r ? colors.primary : colors.inputBackground,
                }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: '600',
                  color: filterRole === r ? '#FFF' : colors.textSecondary,
                  textTransform: 'capitalize',
                }}>{r === 'all' ? 'All Roles' : r + 's'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 100 }}
      >
        {filtered.map((u) => (
          <View key={u._id || u.id || u.email} style={[{
            backgroundColor: colors.card,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
          }, Shadow.sm]}>
            <Image source={{ uri: u.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={{ width: 48, height: 48, borderRadius: 24 }} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{u.name}</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{u.email}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={{
                  paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
                  backgroundColor: (roleColors[u.role] || colors.textTertiary) + '15',
                }}>
                  <Text style={{
                    fontSize: 10, fontWeight: '700',
                    color: roleColors[u.role] || colors.textTertiary,
                    textTransform: 'uppercase',
                  }}>{u.role}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                  <Ionicons name="star" size={12} color={colors.accent} />
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 3 }}>{u.rating}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert(
                u.name,
                `Email: ${u.email}\nRole: ${u.role}\nRating: ${u.rating ?? 'N/A'}`
              )}
              style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: colors.inputBackground,
              alignItems: 'center', justifyContent: 'center',
            }}
            >
              <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
