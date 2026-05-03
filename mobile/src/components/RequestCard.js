import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useApp } from '../context/AppContext';
import { BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '../constants';
import { resolveImageUri } from '../utils/imageUtils';

const { width } = Dimensions.get('window');

export function RequestCard({ request, onAccept, onReject, showActions = false }) {
  const colors = useTheme();
  const { API_URL } = useApp();
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { color: colors.warning, icon: 'time', label: 'Pending' };
      case 'accepted': return { color: colors.success, icon: 'checkmark-circle', label: 'Accepted' };
      case 'rejected': return { color: colors.error, icon: 'close-circle', label: 'Declined' };
      case 'completed': return { color: colors.info, icon: 'checkmark-done-circle', label: 'Completed' };
      default: return { color: colors.textTertiary, icon: 'help-circle', label: status };
    }
  };

  const status = getStatusInfo(request.status);

  return (
    <View style={[{
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
    }, Shadow.sm]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: resolveImageUri(request.item?.images?.[0], API_URL) }} style={{ width: 70, height: 70, borderRadius: 16 }} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 }} numberOfLines={1}>
            {request.item?.title || 'Rental Item'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 4 }}>
              {request.startDate} - {request.endDate}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ 
              paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, 
              backgroundColor: status.color + '15', flexDirection: 'row', alignItems: 'center'
            }}>
              <Ionicons name={status.icon} size={12} color={status.color} />
              <Text style={{ fontSize: 10, fontWeight: '900', color: status.color, textTransform: 'uppercase', marginLeft: 4 }}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: '700', textTransform: 'uppercase' }}>Total</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.primary }}>₹{request.totalPrice}</Text>
        </View>
      </View>

      {request.message && (
        <View style={{
          backgroundColor: colors.background, padding: 12, borderRadius: 12, marginTop: 16,
          flexDirection: 'row', alignItems: 'flex-start'
        }}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.textTertiary} style={{ marginTop: 2 }} />
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 10, lineHeight: 18, flex: 1 }} numberOfLines={2}>
            "{request.message}"
          </Text>
        </View>
      )}

      {showActions && request.status === 'pending' && (
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <TouchableOpacity
            onPress={onReject}
            style={{
              flex: 1, height: 44, borderRadius: 12, 
              backgroundColor: colors.error + '10', 
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: colors.error + '30'
            }}
          >
            <Text style={{ color: colors.error, fontWeight: '800', fontSize: 14 }}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAccept}
            style={{
              flex: 1, height: 44, borderRadius: 12, 
              backgroundColor: colors.success, 
              alignItems: 'center', justifyContent: 'center',
              ...Shadow.sm
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>Accept Request</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export function StatCard({ title, value, icon, color, trend, trendValue }) {
  const colors = useTheme();
  return (
    <View style={[{
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      width: (width - Spacing.lg * 3) / 2,
      marginBottom: Spacing.md,
    }, Shadow.sm]}>
      <View style={{
        width: 44, height: 44, borderRadius: BorderRadius.md,
        backgroundColor: color + '15',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.md,
      }}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={{ fontSize: FontSize.xxl, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 }}>{value}</Text>
      <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary }}>{title}</Text>
      {trend && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Ionicons
            name={trend === 'up' ? 'trending-up' : 'trending-down'}
            size={14}
            color={trend === 'up' ? colors.success : colors.error}
          />
          <Text style={{ color: trend === 'up' ? colors.success : colors.error, fontSize: 10, marginLeft: 2 }}>
            {trendValue}
          </Text>
        </View>
      )}
    </View>
  );
}
