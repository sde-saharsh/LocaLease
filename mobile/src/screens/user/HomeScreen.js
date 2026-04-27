import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, FlatList, Animated, Dimensions, Image, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useTheme } from '../../context/AppContext';
import { ItemCard } from '../../components/Cards';
import { CATEGORIES } from '../../data/mockData';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';

const { width } = Dimensions.get('window');

export default function UserHomeScreen({ navigation }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { items, searchQuery, setSearchQuery, selectedCategory, setCategory, user } = useApp();
  const [viewMode, setViewMode] = useState('grid');
  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredItems = items.filter((item) => {
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradient.hero}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 30,
          paddingHorizontal: Spacing.xxl,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
              Hello, {user?.name?.split(' ')[0] || 'User'}
            </Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 }}>Find Rentals</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
            style={{
              width: 54, height: 54, borderRadius: 27,
              backgroundColor: 'rgba(255,255,255,0.25)',
              padding: 2,
              borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
            }}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%', borderRadius: 27 }} />
            ) : (
              <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person" size={26} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={{
          flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 20, paddingHorizontal: 18,
          alignItems: 'center', height: 60,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        }}>
          <Ionicons name="search" size={24} color="#FFF" style={{ opacity: 0.9 }} />
          <TextInput
            placeholder="Search cameras, bikes, tools..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, color: '#FFF', marginLeft: 12, fontSize: 16, fontWeight: '500' }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={22} color="#FFF" style={{ opacity: 0.8 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Search')}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 14 }}
            >
              <Ionicons name="options-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: Platform.OS !== 'web' }
        )}
        scrollEventThrottle={16}
      >
        {/* Categories Section */}
        <View style={{ marginTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.xxl, marginBottom: 18, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>Categories</Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '700' }}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.xxl, gap: 16 }}
          >
            <TouchableOpacity
              onPress={() => setCategory(null)}
              activeOpacity={0.8}
              style={[
                {
                  paddingHorizontal: 24,
                  paddingVertical: 14,
                  borderRadius: 18,
                  backgroundColor: !selectedCategory ? colors.primary : colors.card,
                  alignItems: 'center',
                  minWidth: 90,
                  flexDirection: 'row',
                  borderWidth: 1,
                  borderColor: !selectedCategory ? colors.primary : colors.borderLight,
                },
                Shadow.md,
              ]}
            >
              <Ionicons name="grid" size={22} color={!selectedCategory ? '#FFF' : colors.primary} />
              <Text style={{
                fontSize: 15, fontWeight: '700', marginLeft: 10,
                color: !selectedCategory ? '#FFF' : colors.textPrimary,
              }}>All</Text>
            </TouchableOpacity>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(selectedCategory === cat.name ? null : cat.name)}
                activeOpacity={0.8}
                style={[
                  {
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 18,
                    backgroundColor: selectedCategory === cat.name ? colors.primary : colors.card,
                    alignItems: 'center',
                    minWidth: 90,
                    flexDirection: 'row',
                    borderWidth: 1,
                    borderColor: selectedCategory === cat.name ? colors.primary : colors.borderLight,
                  },
                  Shadow.md,
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={22}
                  color={selectedCategory === cat.name ? '#FFF' : colors.primary}
                />
                <Text style={{
                  fontSize: 15, fontWeight: '700', marginLeft: 10,
                  color: selectedCategory === cat.name ? '#FFF' : colors.textPrimary,
                }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Listings Section */}
        <View style={{ marginTop: 36, paddingHorizontal: Spacing.xxl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textPrimary }}>
                {selectedCategory || 'Featured'}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>Top rentals for you today</Text>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: colors.card, padding: 5, borderRadius: 14, borderWidth: 1, borderColor: colors.borderLight, ...Shadow.sm }}>
              <TouchableOpacity
                onPress={() => setViewMode('grid')}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: viewMode === 'grid' ? colors.primary : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="grid" size={20} color={viewMode === 'grid' ? '#FFF' : colors.textTertiary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode('list')}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: viewMode === 'list' ? colors.primary : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="list" size={20} color={viewMode === 'list' ? '#FFF' : colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {filteredItems.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 80, backgroundColor: colors.card, borderRadius: 32, ...Shadow.sm }}>
              <View style={{ backgroundColor: colors.borderLight, padding: 24, borderRadius: 35, marginBottom: 20 }}>
                <Ionicons name="search" size={56} color={colors.textTertiary} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>No results found</Text>
              <Text style={{ fontSize: 15, color: colors.textTertiary, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
                Try adjusting your filters or search terms to find what you need.
              </Text>
            </View>
          ) : viewMode === 'grid' ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  compact
                  onPress={() => navigation.navigate('ItemDetails', { item })}
                />
              ))}
            </View>
          ) : (
            filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate('ItemDetails', { item })}
              />
            ))
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
