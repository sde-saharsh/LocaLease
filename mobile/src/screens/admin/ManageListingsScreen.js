import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../../context/AppContext';
import Header from '../../components/Header';
import { Spacing, BorderRadius, Shadow } from '../../constants';

export default function ManageListingsScreen({ navigation }) {
  const colors = useTheme();
  const { items, API_URL, token, fetchItems } = useApp();
  const [search, setSearch] = useState('');

  const filtered = items.filter((i) =>
    !search || i.title.toLowerCase().includes(search.toLowerCase())
  );

  const deleteListing = async (item) => {
    const itemId = item?._id || item?.id;
    if (!itemId) return;

    if (!token) {
      Alert.alert('Session expired', 'Please login again as admin.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        await fetchItems();
        Alert.alert('Deleted', 'Listing removed successfully.');
        return;
      }

      Alert.alert('Delete failed', data?.message || 'Could not delete listing.');
    } catch (err) {
      Alert.alert('Delete failed', 'Network error while deleting listing.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Manage Listings" subtitle={`${items.length} items`} centerTitle />
      <View style={{ paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md }}>
        <View style={{
          flexDirection: 'row', backgroundColor: colors.inputBackground,
          borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg,
          alignItems: 'center', height: 44,
        }}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            placeholder="Search listings..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: colors.textPrimary, marginLeft: 8, fontSize: 14 }}
          />
        </View>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 100 }}
      >
        {filtered.map((item) => (
          <View key={item._id || item.id} style={[{
            backgroundColor: colors.card,
            borderRadius: BorderRadius.lg,
            marginBottom: Spacing.md,
            flexDirection: 'row',
            overflow: 'hidden',
          }, Shadow.sm]}>
            <Image source={{ uri: item?.images?.[0] || 'https://via.placeholder.com/200x200?text=No+Image' }} style={{ width: 90, height: 90 }} />
            <View style={{ flex: 1, padding: Spacing.md }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                by {item?.owner?.name || 'Unknown owner'} · {item?.category || 'Uncategorized'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>₹{item.price}/{item.priceUnit}</Text>
                <View style={{
                  paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
                  backgroundColor: item.available ? colors.success + '15' : colors.error + '15',
                }}>
                  <Text style={{
                    fontSize: 10, fontWeight: '600',
                    color: item.available ? colors.success : colors.error,
                  }}>{item.available ? 'Active' : 'Rented'}</Text>
                </View>
              </View>
            </View>
            <View style={{ justifyContent: 'center', paddingRight: 10, gap: 8 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ItemDetails', { item })}
                style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: colors.info + '15',
                alignItems: 'center', justifyContent: 'center',
              }}
              >
                <Ionicons name="eye-outline" size={16} color={colors.info} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Delete listing', `Delete "${item.title}"?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteListing(item) },
                  ])
                }
                style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: colors.error + '15',
                alignItems: 'center', justifyContent: 'center',
              }}
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
