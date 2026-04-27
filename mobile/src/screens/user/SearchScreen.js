import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useTheme } from '../../context/AppContext';
import { ItemCard } from '../../components/Cards';
import { CATEGORIES } from '../../data/mockData';
import { Spacing, BorderRadius, Shadow } from '../../constants';

const { width } = Dimensions.get('window');

const SORT_OPTIONS = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'price_low', label: 'Price: Low to High' },
  { key: 'price_high', label: 'Price: High to Low' },
  { key: 'rating', label: 'Highest Rated' },
];

export default function SearchScreen({ navigation }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { items } = useApp();
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (name) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const filteredItems = items.filter((item) => {
    const matchesQuery = !query || item.title.toLowerCase().includes(query.toLowerCase());
    const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(item.category);
    return matchesQuery && matchesCat;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_low': return a.price - b.price;
      case 'price_high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      default: return 0;
    }
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      {/* Search Header */}
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
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Ionicons name="options-outline" size={20} color={showFilters ? '#FFF' : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={[{
          backgroundColor: colors.card,
          marginHorizontal: Spacing.xl,
          borderRadius: 24,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1, borderColor: colors.borderLight
        }, Shadow.md]}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Categories</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => toggleCategory(cat.name)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8,
                  borderRadius: 12,
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
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sort By</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSortBy(opt.key)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8,
                  borderRadius: 12,
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
        </View>
      )}

      {/* Results or Trending */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 100, flexGrow: 1 }}
      >
        {query === '' && selectedCategories.length === 0 ? (
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
                  key={item.id}
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
            </View>

            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate('ItemDetails', { item })}
              />
            ))}
            {filteredItems.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 80 }}>
                <Ionicons name="search-outline" size={64} color={colors.textTertiary} />
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textSecondary, marginTop: 20 }}>No items found</Text>
                <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
                  Try adjusting your search or filters to find what you're looking for.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
