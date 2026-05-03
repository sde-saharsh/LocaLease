import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Animated, Dimensions, Image, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useTheme } from '../../context/AppContext';
import { ItemCard } from '../../components/Cards';
import { CATEGORIES } from '../../data/mockData';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { getDistanceKm, extractCity, isSameCity } from '../../utils/locationUtils';
import { resolveImageUri } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');

const LOCATION_FILTERS = [
  { key: 'all',    icon: 'globe-outline',    label: 'All' },
  { key: 'nearby', icon: 'navigate-outline', label: '5 km' },
  { key: 'city',   icon: 'business-outline', label: 'Same City' },
];

export default function UserHomeScreen({ navigation }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const {
    items, searchQuery, setSearchQuery, selectedCategory, setCategory, user,
    userLocation, locationFilter, locationLoading,
    requestUserLocation, setLocationFilter, API_URL
  } = useApp();

  const [viewMode, setViewMode] = useState('grid');
  const scrollY = useRef(new Animated.Value(0)).current;
  const locationChipAnim = useRef(new Animated.Value(0)).current;

  // Animate location chip in when location becomes available
  useEffect(() => {
    if (userLocation) {
      Animated.spring(locationChipAnim, {
        toValue: 1, useNativeDriver: true, tension: 80, friction: 8,
      }).start();
    }
  }, [userLocation]);

  // ─── Handle location filter press ────────────────────────────────────────────
  const handleLocationFilter = async (key) => {
    if (key === 'all') {
      setLocationFilter('all');
      return;
    }
    // Need location permission first
    if (!userLocation) {
      const result = await requestUserLocation();
      if (!result.success) {
        Alert.alert(
          'Location Required',
          result.message === 'Location permission denied'
            ? 'Please enable location permission in your device settings to use this filter.'
            : `Could not get location: ${result.message}`,
          [{ text: 'OK' }]
        );
        return;
      }
    }
    setLocationFilter(key);
  };

  // ─── Client-side location filtering ──────────────────────────────────────────
  const applyLocationFilter = (list) => {
    if (locationFilter === 'all' || !userLocation) return list;

    if (locationFilter === 'nearby') {
      return list.filter((item) => {
        const coords = item.coordinates || item.location?.coordinates;
        if (!coords) return false;
        // Handle both { lat, lng } and GeoJSON [lng, lat]
        const itemLat = coords.lat ?? coords[1];
        const itemLng = coords.lng ?? coords[0];
        if (!itemLat || !itemLng) return false;
        const dist = getDistanceKm(userLocation.lat, userLocation.lng, itemLat, itemLng);
        return dist <= 5;
      });
    }

    if (locationFilter === 'city') {
      const userCity = userLocation.city;
      return list.filter((item) => {
        try {
          const itemCity = extractCity(item.location || item.address || '');
          return isSameCity(userCity, itemCity);
        } catch (err) {
          return false;
        }
      });
    }

    return list;
  };

  // ─── Final filtered list ──────────────────────────────────────────────────────
  const filteredItems = applyLocationFilter(
    items.filter((item) => {
      const matchesSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
  );

  const filterLabel =
    locationFilter === 'nearby' ? 'Within 5 km'
    : locationFilter === 'city'   ? `In ${userLocation?.city || 'Your City'}`
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
        {/* Top row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
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
              <Image source={{ uri: resolveImageUri(user.avatar, API_URL) }} style={{ width: '100%', height: '100%', borderRadius: 27 }} />
            ) : (
              <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person" size={26} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Location chip */}
        {userLocation && (
          <Animated.View style={{
            opacity: locationChipAnim,
            transform: [{ translateY: locationChipAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
            alignSelf: 'flex-start', marginBottom: 12,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
          }}>
            <Ionicons name="location" size={13} color="#FFF" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFF', marginLeft: 6 }}>
              {userLocation.city}
            </Text>
          </Animated.View>
        )}

        {/* Search bar */}
        <View style={{
          flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 20, paddingHorizontal: 18,
          alignItems: 'center', height: 58,
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

        {/* ── Location Filter Strip ─────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', marginTop: 14, gap: 8 }}>
          {LOCATION_FILTERS.map((f) => {
            const isActive = locationFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => handleLocationFilter(f.key)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 14, paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isActive ? '#FFF' : 'rgba(255,255,255,0.18)',
                  borderWidth: 1,
                  borderColor: isActive ? '#FFF' : 'rgba(255,255,255,0.3)',
                }}
              >
                {locationLoading && f.key !== 'all' && !userLocation ? (
                  <ActivityIndicator size={13} color={isActive ? colors.primary : '#FFF'} />
                ) : (
                  <Ionicons name={f.icon} size={14} color={isActive ? colors.primary : '#FFF'} />
                )}
                <Text style={{
                  fontSize: 13, fontWeight: '700', marginLeft: 6,
                  color: isActive ? colors.primary : '#FFF',
                }}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
        {/* ── Categories ─────────────────────────────────────────────────────── */}
        <View style={{ marginTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.xxl, marginBottom: 18, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
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
              style={[{
                paddingHorizontal: 24, paddingVertical: 14, borderRadius: 18,
                backgroundColor: !selectedCategory ? colors.primary : colors.card,
                alignItems: 'center', minWidth: 90, flexDirection: 'row',
                borderWidth: 1, borderColor: !selectedCategory ? colors.primary : colors.borderLight,
              }, Shadow.md]}
            >
              <Ionicons name="grid" size={22} color={!selectedCategory ? '#FFF' : colors.primary} />
              <Text style={{ fontSize: 15, fontWeight: '700', marginLeft: 10, color: !selectedCategory ? '#FFF' : colors.textPrimary }}>All</Text>
            </TouchableOpacity>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(selectedCategory === cat.name ? null : cat.name)}
                activeOpacity={0.8}
                style={[{
                  paddingHorizontal: 24, paddingVertical: 14, borderRadius: 18,
                  backgroundColor: selectedCategory === cat.name ? colors.primary : colors.card,
                  alignItems: 'center', minWidth: 90, flexDirection: 'row',
                  borderWidth: 1, borderColor: selectedCategory === cat.name ? colors.primary : colors.borderLight,
                }, Shadow.md]}
              >
                <Ionicons name={cat.icon} size={22} color={selectedCategory === cat.name ? '#FFF' : colors.primary} />
                <Text style={{
                  fontSize: 15, fontWeight: '700', marginLeft: 10,
                  color: selectedCategory === cat.name ? '#FFF' : colors.textPrimary,
                }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Listings ───────────────────────────────────────────────────────── */}
        <View style={{ marginTop: 36, paddingHorizontal: Spacing.xxl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textPrimary }}>
                {selectedCategory || 'Featured'}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
                {filterLabel
                  ? `Showing ${filteredItems.length} items · ${filterLabel}`
                  : 'Top rentals for you today'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: colors.card, padding: 5, borderRadius: 14, borderWidth: 1, borderColor: colors.borderLight, ...Shadow.sm }}>
              <TouchableOpacity
                onPress={() => setViewMode('grid')}
                style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: viewMode === 'grid' ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="grid" size={20} color={viewMode === 'grid' ? '#FFF' : colors.textTertiary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode('list')}
                style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: viewMode === 'list' ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="list" size={20} color={viewMode === 'list' ? '#FFF' : colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* No-location nudge for non-"all" modes without permission */}
          {(locationFilter === 'nearby' || locationFilter === 'city') && !userLocation && !locationLoading && (
            <TouchableOpacity
              onPress={requestUserLocation}
              style={[{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: colors.primary + '12',
                borderRadius: 18, padding: 16, marginBottom: 20,
                borderWidth: 1, borderColor: colors.primary + '30',
              }, Shadow.sm]}
            >
              <View style={{ backgroundColor: colors.primary + '20', padding: 10, borderRadius: 14 }}>
                <Ionicons name="location-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>Enable Location</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  Tap to allow access and see nearby items
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}

          {filteredItems.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 80, backgroundColor: colors.card, borderRadius: 32, ...Shadow.sm }}>
              <View style={{ backgroundColor: colors.borderLight, padding: 24, borderRadius: 35, marginBottom: 20 }}>
                <Ionicons
                  name={locationFilter !== 'all' ? 'location-outline' : 'search'}
                  size={56}
                  color={colors.textTertiary}
                />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>
                {locationFilter !== 'all' ? 'No nearby items found' : 'No results found'}
              </Text>
              <Text style={{ fontSize: 15, color: colors.textTertiary, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
                {locationFilter === 'nearby'
                  ? 'There are no available items within 5 km of your location.'
                  : locationFilter === 'city'
                  ? `No items found in ${userLocation?.city || 'your city'}.`
                  : 'Try adjusting your filters or search terms.'}
              </Text>
              {locationFilter !== 'all' && (
                <TouchableOpacity
                  onPress={() => setLocationFilter('all')}
                  style={{ marginTop: 16, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Show All Items</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : viewMode === 'grid' ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id || item._id}
                  item={item}
                  compact
                  onPress={() => navigation.navigate('ItemDetails', { item })}
                />
              ))}
            </View>
          ) : (
            filteredItems.map((item) => (
              <ItemCard
                key={item.id || item._id}
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
