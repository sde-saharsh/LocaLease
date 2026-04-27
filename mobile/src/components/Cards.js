import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useApp } from '../context/AppContext';
import { BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

export function ItemCard({ item, onPress, compact = false }) {
  const colors = useTheme();
  const { wishlist, toggleWishlist } = useApp();
  const itemId = item?._id || item?.id;
  const handleToggleWishlist = () => {
    if (!itemId) return;
    toggleWishlist(itemId);
  };
  const isWishlisted = wishlist.includes(itemId);
  const coverImage = item?.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image';
  const owner = item?.owner || {};
  const ownerName = typeof owner?.name === 'string' ? owner.name : 'Owner';
  const ownerAvatar = owner?.avatar || 'https://via.placeholder.com/100?text=U';

  const Badge = ({ text, color = colors.primary, style }) => (
    <View style={[{
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      // Note: backdropFilter is handled by the wrapper if needed, 
      // but for mobile we use semi-transparent white for a glass effect
    }, style]}>
      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>{text}</Text>
    </View>
  );

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[{
          backgroundColor: colors.card,
          width: CARD_WIDTH,
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 20,
        }, Shadow.md]}
      >
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: coverImage }} style={{ width: '100%', height: 160 }} />
          <TouchableOpacity
            onPress={handleToggleWishlist}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.9)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={isWishlisted ? '#F43F5E' : '#1F2937'}
            />
          </TouchableOpacity>
          <Badge 
            text={item.category || 'Item'} 
            style={{ position: 'absolute', bottom: 12, left: 12 }} 
          />
        </View>
        <View style={{ padding: 14 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 }} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginLeft: 4 }}>
              {item.rating}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.primary }}>₹{item.price}</Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary, marginLeft: 2 }}>/{item.priceUnit}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[{
        backgroundColor: colors.card,
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 24,
      }, Shadow.lg]}
    >
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: coverImage }} style={{ width: '100%', height: 260 }} />
        <TouchableOpacity
          onPress={handleToggleWishlist}
          style={{
            position: 'absolute', top: 20, right: 20,
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: 'rgba(255,255,255,0.95)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={24}
            color={isWishlisted ? '#F43F5E' : '#1F2937'}
          />
        </TouchableOpacity>
        
        <View style={{ position: 'absolute', bottom: 20, left: 20, flexDirection: 'row', gap: 10 }}>
          <Badge text={item.category || 'Item'} />
          {!item.available && (
            <View style={{
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
              backgroundColor: colors.error + 'EE',
            }}>
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>Rented</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ padding: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: colors.textPrimary, marginBottom: 8 }} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <Ionicons name="star" size={14} color="#D97706" />
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#D97706', marginLeft: 4 }}>
                  {item.rating}
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.textTertiary, marginLeft: 8 }}>
                ({item.reviews} reviews)
              </Text>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border, marginHorizontal: 10 }} />
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginLeft: 4 }}>{item.distance}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: colors.borderLight, marginVertical: 20 }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 11, color: colors.textTertiary, textTransform: 'uppercase', fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 }}>
              Rental Price
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 28, fontWeight: '900', color: colors.primary }}>₹{item.price}</Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary, marginLeft: 4, fontWeight: '600' }}>/{item.priceUnit}</Text>
            </View>
          </View>

          <TouchableOpacity 
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, padding: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight }}
          >
            <Image source={{ uri: ownerAvatar }} style={{ width: 34, height: 34, borderRadius: 17, marginRight: 10, borderWidth: 2, borderColor: '#FFF' }} />
            <View>
              <Text style={{ fontSize: 10, color: colors.textTertiary, fontWeight: '600' }}>Listed by</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>{ownerName.split(' ')[0]}</Text>
                <View style={{ marginLeft: 4, backgroundColor: '#3B82F6', borderRadius: 10, padding: 1 }}>
                  <Ionicons name="checkmark-circle" size={10} color="#FFF" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

