import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useTheme } from '../../context/AppContext';
import { Spacing, BorderRadius, Shadow } from '../../constants';
import { resolveImageUri } from '../../utils/imageUtils';

export default function MyListingsScreen({ navigation }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { items, user, API_URL } = useApp();
  const myItems = items.filter((i) => {
    const ownerId = i.owner?._id || i.owner?.id;
    const currentUserId = user?._id || user?.id;
    return ownerId === currentUserId;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.gradient.hero}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 24,
          paddingHorizontal: Spacing.xxl,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFF' }}>My Listings</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddItem')}>
            <Ionicons name="add-circle" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.xxl, paddingBottom: 100 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1 }}>
            Manage your items ({myItems.length})
          </Text>
        </View>

        {myItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ItemDetails', { item })}
            style={[{
              backgroundColor: colors.card,
              borderRadius: 24,
              marginBottom: 16,
              flexDirection: 'row',
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.borderLight,
            }, Shadow.sm]}
          >
            <Image source={{ uri: resolveImageUri(item.images[0], API_URL) }} style={{ width: 110, height: 110 }} />
            <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textTertiary, marginTop: 4, textTransform: 'uppercase' }}>{item.category}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: colors.primary }}>₹{item.price}<Text style={{ fontSize: 12, fontWeight: '600', color: colors.textTertiary }}>/day</Text></Text>
                <View style={{
                  paddingHorizontal: 10, paddingVertical: 4,
                  borderRadius: 10,
                  backgroundColor: item.available ? colors.success + '15' : colors.error + '15',
                }}>
                  <Text style={{
                    fontSize: 10, fontWeight: '900',
                    color: item.available ? colors.success : colors.error,
                    textTransform: 'uppercase'
                  }}>
                    {item.available ? 'Active' : 'Rented'}
                  </Text>
                </View>
                </View>
            </View>
            <View style={{ justifyContent: 'center', paddingRight: 16 }}>
              <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        {myItems.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 80 }}>
            <Ionicons name="cube-outline" size={64} color={colors.textTertiary} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textSecondary, marginTop: 20 }}>No listings yet</Text>
            <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
              Start earning by listing your equipment for others to rent.
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AddItem')}
              style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 12 }}
            >
              <Text style={{ color: '#FFF', fontWeight: '800' }}>Add Your First Item</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
