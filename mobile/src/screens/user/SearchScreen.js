import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useTheme } from '../../context/AppContext';
import { ItemCard } from '../../components/Cards';
import { CATEGORIES } from '../../data/mockData';
import { Spacing, BorderRadius, Shadow } from '../../constants';
import { getDistanceKm, extractCity, isSameCity } from '../../utils/locationUtils';

const { width } = Dimensions.get('window');

const SORT_OPTIONS = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'price_low', label: 'Price: Low to High' },
  { key: 'price_high', label: 'Price: High to Low' },
  { key: 'rating', label: 'Highest Rated' },
  { key: 'nearest', label: 'Nearest First' },
];

const LOCATION_FILTERS = [
  { key: 'all',    icon: 'globe-outline',    label: 'All Areas' },
  { key: 'nearby', icon: 'navigate-outline', label: 'Within 5 km' },
  { key: 'city',   icon: 'business-outline', label: 'Same City' },
];

export default function SearchScreen({ navigation }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const {
    items,
    userLocation, locationLoading,
    requestUserLocation,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [locationMode, setLocationMode] = useState('all'); // local state for search screen

  const toggleCategory = (name) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  // ─── Location filter handling ─────────────────────────────────────────────
  const handleLocationMode = async (key) => {
    if (key === 'all') { setLocationMode('all'); return; }
    if (!userLocation) {
      const result = await requestUserLocation();
      if (!result.success) {
        Alert.alert(
          'Location Required',
          result.message === 'Location permission denied'
            ? 'Please enable location permission in your device settings.'
            : `Could not get location: ${result.message}`,
        );
        return;
      }
    }
    setLocationMode(key);
  };

  // ─── Apply location filter ────────────────────────────────────────────────
  const applyLocationFilter = (list) => {
    if (locationMode === 'all' || !userLocation) return list;
    if (locationMode === 'nearby') {
      return list.filter((item) => {
        const coords = item.coordinates || item.location?.coordinates;
        if (!coords) return false;
        const itemLat = coords.lat ?? coords[1];
        const itemLng = coords.lng ?? coords[0];
        if (!itemLat || !itemLng) return false;
        return getDistanceKm(userLocation.lat, userLocation.lng, itemLat, itemLng) <= 5;
      });
    }
    if (locationMode === 'city') {
      return list.filter((item) => {
        const itemCity = extractCity(item.location || item.address || '');
        return isSameCity(userLocation.city, itemCity);
      });
    }
    return list;
  };

  // ─── Filtering + sorting pipeline ────────────────────────────────────────
  const filteredItems = applyLocationFilter(
    items.filter((item) => {
      const matchesQuery = !query || item.title.toLowerCase().includes(query.toLowerCase());
      const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(item.category);
      return matchesQuery && matchesCat;
    })
  ).sort((a, b) => {
    switch (sortBy) {
      case 'price_low':  return a.price - b.price;
      case 'price_high': return b.price - a.price;
      case 'rating':     return b.rating - a.rating;
      case 'nearest': {
        if (!userLocation) return 0;
        const distA = (() => {
          const c = a.coordinates || a.location?.coordinates;
          if (!c) return Infinity;
          return getDistanceKm(userLocation.lat, userLocation.lng, c.lat ?? c[1], c.lng ?? c[0]);
        })();
        const distB = (() => {
          const c = b.coordinates || b.location?.coordinates;
          if (!c) return Infinity;
          return getDistanceKm(userLocation.lat, userLocation.lng, c.lat ?? c[1], c.lng ?? c[0]);
        })();
        return distA - distB;
      }
      default: return 0;
    }
  });

  const activeFilterCount =
    selectedCategories.length + (locationMode !== 'all' ? 1 : 0) + (sortBy !== 'relevance' ? 1 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      {/* ── Search Header ──────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md }}>
        <View style={{
          flexDirection: 'row', backgroundColor: colors.card,
          borderRadius: 20, paddingHorizontal: 16,
          alignItems: 'center', height: 56,
          borderWidth: 1, borderColor: colors.borderLight,
          ...Shadow.sm
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            placeholder="Search items, gear, equipment..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            style={{ flex: 1, color: colors.textPrimary, marginLeft: 12, fontSize: 16, fontWeight: '600' }}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              marginLeft: 12, width: 40, height: 40, borderRadius: 12,
              backgroundColor: showFilters ? colors.primary : colors.background,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {activeFilterCount > 0 && !showFilters ? (
              <View style={{
                position: 'absolute', top: 4, right: 4,
                width: 16, height: 16, borderRadius: 8,
                backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 1,
              }}>
                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>{activeFilterCount}</Text>
              </View>
            ) : null}
            <Ionicons name="options-outline" size={20} color={showFilters ? '#FFF' : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filters Panel ──────────────────────────────────────────────────── */}
      {showFilters && (
        <View style={[{
          backgroundColor: colors.card,
          marginHorizontal: Spacing.xl,
          borderRadius: 24,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1, borderColor: colors.borderLight
        }, Shadow.md]}>

          {/* Location Filter */}
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Location
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {LOCATION_FILTERS.map((f) => {
              const isActive = locationMode === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => handleLocationMode(f.key)}
                  style={{
                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    paddingVertical: 10, borderRadius: 14,
                    backgroundColor: isActive ? colors.primary : colors.background,
                    borderWidth: 1, borderColor: isActive ? colors.primary : colors.borderLight,
                  }}
                >
                  {locationLoading && f.key !== 'all' && !userLocation ? (
                    <ActivityIndicator size={12} color={isActive ? '#FFF' : colors.primary} />
                  ) : (
                    <Ionicons name={f.icon} size={14} color={isActive ? '#FFF' : colors.textSecondary} />
                  )}
                  <Text style={{
                    fontSize: 12, fontWeight: '700', marginLeft: 5,
                    color: isActive ? '#FFF' : colors.textSecondary,
                  }}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* City indicator */}
          {userLocation && locationMode !== 'all' && (
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: colors.primary + '12',
              borderRadius: 12, padding: 10, marginBottom: 18,
            }}>
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600', marginLeft: 6 }}>
                {locationMode === 'nearby'
                  ? `Items within 5 km of ${userLocation.city}`
                  : `Items in ${userLocation.city}`}
              </Text>
            </View>
          )}

          {/* Categories */}
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Categories</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => toggleCategory(cat.name)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                  backgroundColor: selectedCategories.includes(cat.name) ? colors.primary + '15' : colors.background,
                  borderWidth: 1, borderColor: selectedCategories.includes(cat.name) ? colors.primary : colors.borderLight
                }}
              >
                <Text style={{
                  fontSize: 12, fontWeight: '700',
                  color: selectedCategories.includes(cat.name) ? colors.primary : colors.textSecondary,
                }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort By */}
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sort By</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSortBy(opt.key)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                  backgroundColor: sortBy === opt.key ? colors.primary : colors.background,
                  borderWidth: 1, borderColor: sortBy === opt.key ? colors.primary : colors.borderLight
                }}
              >
                <Text style={{
                  fontSize: 12, fontWeight: '700',
                  color: sortBy === opt.key ? '#FFF' : colors.textSecondary,
                }}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <TouchableOpacity
              onPress={() => { setSelectedCategories([]); setSortBy('relevance'); setLocationMode('all'); }}
              style={{
                marginTop: 16, alignItems: 'center', paddingVertical: 10,
                borderRadius: 14, borderWidth: 1, borderColor: colors.borderLight,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>
                Clear All Filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Results ────────────────────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 100, flexGrow: 1 }}
      >
        {query === '' && selectedCategories.length === 0 && locationMode === 'all' ? (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginBottom: 20 }}>Trending Searches</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {['DSLR Camera', 'Camping Tent', 'Mountain Bike', 'Electric Guitar', 'Projector', 'Drill Machine'].map((t, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setQuery(t)}
                  style={{
                    backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 10,
                    borderRadius: 14, borderWidth: 1, borderColor: colors.borderLight,
                    flexDirection: 'row', alignItems: 'center'
                  }}
                >
                  <Ionicons name="trending-up" size={14} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginTop: 40 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginBottom: 20 }}>Recent Items</Text>
              {items.slice(0, 3).map((item) => (
                <ItemCard
                  key={item.id || item._id}
                  item={item}
                  onPress={() => navigation.navigate('ItemDetails', { item })}
                />
              ))}
            </View>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1 }}>
                {filteredItems.length} results found
              </Text>
              {locationMode !== 'all' && userLocation && (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                  <Ionicons name="location" size={12} color={colors.primary} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, marginLeft: 4 }}>
                    {locationMode === 'nearby' ? '5 km radius' : userLocation.city}
                  </Text>
                </View>
              )}
            </View>

            {filteredItems.map((item) => (
              <ItemCard
                key={item.id || item._id}
                item={item}
                onPress={() => navigation.navigate('ItemDetails', { item })}
              />
            ))}

            {filteredItems.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 80 }}>
                <Ionicons
                  name={locationMode !== 'all' ? 'location-outline' : 'search-outline'}
                  size={64}
                  color={colors.textTertiary}
                />
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textSecondary, marginTop: 20 }}>
                  {locationMode !== 'all' ? 'No nearby items found' : 'No items found'}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
                  {locationMode === 'nearby'
                    ? 'No items available within 5 km of your location.'
                    : locationMode === 'city'
                    ? `No items found in ${userLocation?.city || 'your city'}.`
                    : "Try adjusting your search or filters."}
                </Text>
                {locationMode !== 'all' && (
                  <TouchableOpacity
                    onPress={() => setLocationMode('all')}
                    style={{ marginTop: 16, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Search All Areas</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
