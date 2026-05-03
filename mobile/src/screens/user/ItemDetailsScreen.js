import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  Dimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useTheme } from '../../context/AppContext';
import CustomButton from '../../components/CustomButton';
import { Spacing, BorderRadius, Shadow } from '../../constants';
import { extractCity } from '../../utils/locationUtils';
import { resolveImageUri } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');

export default function ItemDetailsScreen({ route, navigation }) {
  const { item } = route.params;
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { wishlist, toggleWishlist, createRequest, API_URL } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const itemId = item?._id || item?.id;
  const isWishlisted = wishlist.includes(itemId);
  
  const rawImages = Array.isArray(item?.images) && item.images.length
    ? item.images
    : ['https://via.placeholder.com/800x600?text=No+Image'];
  const images = rawImages.map(img => resolveImageUri(img, API_URL));

  const owner = item?.owner || {};
  const ownerName = typeof owner?.name === 'string' ? owner.name : 'Unknown Owner';
  const ownerAvatar = resolveImageUri(owner?.avatar, API_URL);
  const ownerRating = typeof owner?.rating === 'number' ? owner.rating : 0;
  const ownerReviews = typeof owner?.reviews === 'number' ? owner.reviews : 0;
  const displayLocation = typeof item?.location === 'string'
    ? item.location
    : extractCity(item?.location || item?.address || '') || 'Location not available';
  const itemFeatures = Array.isArray(item?.features) ? item.features : [];
  const displayDistance = typeof item?.distance === 'string' ? item.distance : 'N/A';

  const handleRent = async () => {
    setLoading(true);
    const result = await createRequest({
      itemId: item._id || item.id,
        lender: owner._id || owner.id,
      startDate: '2024-05-01',
      endDate: '2024-05-03',
      totalPrice: item.price * 3,
      message: 'I would like to rent this item.',
    });
    setLoading(false);
    if (result.success) {
      navigation.navigate('UserTabs', { screen: 'History' });
    } else {
      alert(result.message);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
          size={16}
          color={colors.accent}
        />
      );
    }
    return stars;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Image Carousel */}
        <View style={{ position: 'relative' }}>
          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) => {
              setActiveSlide(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
          >
            {images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={{ width, height: 340 }} resizeMode="cover" />
            ))}
          </Animated.ScrollView>

          {/* Back + actions overlay */}
          <View style={{
            position: 'absolute', top: insets.top + 8,
            left: 16, right: 16,
            flexDirection: 'row', justifyContent: 'space-between',
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.4)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="share-outline" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => itemId && toggleWishlist(itemId)}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={isWishlisted ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isWishlisted ? '#EF4444' : '#FFF'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dots */}
          <View style={{
            position: 'absolute', bottom: 16,
            width: '100%', flexDirection: 'row',
            justifyContent: 'center', gap: 6,
          }}>
            {images.map((_, idx) => (
              <View key={idx} style={{
                width: activeSlide === idx ? 20 : 8,
                height: 8, borderRadius: 4,
                backgroundColor: activeSlide === idx ? '#FFF' : 'rgba(255,255,255,0.5)',
              }} />
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={{
          marginTop: -20,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          backgroundColor: colors.background,
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.xxl,
          paddingBottom: 120,
        }}>
          {/* Title & Price */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary }}>{item.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
                <Text style={{ fontSize: 13, color: colors.textTertiary, marginLeft: 4 }}>{displayLocation}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: colors.primary }}>₹{item.price}</Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>per {item.priceUnit}</Text>
            </View>
          </View>

          {/* Rating & Reviews */}
          <View style={[{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: colors.card, borderRadius: BorderRadius.md,
            padding: 12, marginBottom: 20,
          }, Shadow.sm]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {renderStars(item.rating)}
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginLeft: 8 }}>{item.rating}</Text>
            </View>
            <View style={{ width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 16 }} />
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{item.reviews} reviews</Text>
            <View style={{ width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 16 }} />
            <View style={{
              paddingHorizontal: 10, paddingVertical: 4,
              backgroundColor: colors.success + '15', borderRadius: 8,
            }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.success }}>{item.condition}</Text>
            </View>
          </View>

          {/* Features */}
          {itemFeatures.length > 0 && (
            <>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>Features</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {itemFeatures.map((feat, idx) => (
                  <View key={idx} style={{
                    paddingHorizontal: 14, paddingVertical: 8,
                    backgroundColor: colors.primary + '10',
                    borderRadius: BorderRadius.md,
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>{feat}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Description */}
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>Description</Text>
          <Text style={{ fontSize: 14, lineHeight: 22, color: colors.textSecondary, marginBottom: 20 }}>
            {item.description}
          </Text>

          {/* Rental Info */}
          <View style={[{
            backgroundColor: colors.card, borderRadius: BorderRadius.lg,
            padding: Spacing.lg, marginBottom: 20,
          }, Shadow.sm]}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>Rental Info</Text>
            {[
              { icon: 'shield-checkmark-outline', label: 'Security Deposit', value: `₹${item.deposit}` },
              { icon: 'time-outline', label: 'Min Rental', value: `${item.minRental} day(s)` },
              { icon: 'calendar-outline', label: 'Max Rental', value: `${item.maxRental} days` },
              { icon: 'location-outline', label: 'Distance', value: displayDistance },
            ].map((info, idx) => (
              <View key={idx} style={{
                flexDirection: 'row', alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: idx < 3 ? 1 : 0,
                borderBottomColor: colors.borderLight,
              }}>
                <Ionicons name={info.icon} size={18} color={colors.primary} />
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginLeft: 10, flex: 1 }}>{info.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{info.value}</Text>
              </View>
            ))}
          </View>

          {/* Safety & Property Section */}
          <View style={[{
            backgroundColor: colors.card, borderRadius: BorderRadius.lg,
            padding: Spacing.lg, marginBottom: 24,
            borderWidth: 1, borderColor: colors.borderLight,
          }, Shadow.sm]}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 }}>Safety & Property</Text>
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Rental Protection</Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>This item is covered under our basic rental protection policy.</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name="medical-outline" size={20} color={colors.textSecondary} />
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Cleaning Protocols</Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>Lender has committed to our 5-step enhanced cleaning process.</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name="alert-circle-outline" size={20} color={colors.textSecondary} />
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Report Issue</Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>24/7 support available if the item doesn't match description.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Owner */}
          <View style={[{
            backgroundColor: colors.card, borderRadius: BorderRadius.lg,
            padding: Spacing.lg, flexDirection: 'row', alignItems: 'center',
            borderWidth: 1, borderColor: colors.borderLight,
          }, Shadow.sm]}>
            <Image source={{ uri: ownerAvatar }} style={{ width: 56, height: 56, borderRadius: 28 }} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }}>{ownerName}</Text>
                <View style={{ marginLeft: 6, backgroundColor: '#3B82F6', borderRadius: 12, padding: 2 }}>
                  <Ionicons name="checkmark-circle" size={12} color="#FFF" />
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="star" size={13} color={colors.accent} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginLeft: 4 }}>
                  {ownerRating} · {ownerReviews} reviews
                </Text>
              </View>
            </View>
            <TouchableOpacity style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: colors.primary + '10',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: insets.bottom + 12,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }, Shadow.xl]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>Total for 3 days</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.primary }}>₹{item.price * 3}</Text>
          </View>
          <CustomButton
            title={item.available ? 'Rent Now' : 'Not Available'}
            onPress={handleRent}
            disabled={!item.available || loading}
            loading={loading}
            icon={item.available ? 'cart-outline' : 'close-circle-outline'}
            fullWidth={false}
            style={{ paddingHorizontal: 32 }}
            size="lg"
          />
        </View>
      </View>
    </View>
  );
}
