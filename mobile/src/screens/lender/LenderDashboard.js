import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useTheme } from '../../context/AppContext';
import { Spacing, BorderRadius, Shadow } from '../../constants';

const { width } = Dimensions.get('window');

export default function LenderDashboard({ navigation }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { user, items, requests } = useApp();

  const myItems = items.filter((i) => {
    const ownerId = i.owner?._id || i.owner?.id || i.owner;
    const currentUserId = user?._id || user?.id;
    return ownerId === currentUserId;
  });
  const myRequests = requests.filter((r) => {
    const lenderId = r.lender?._id || r.lender?.id || r.lender;
    const currentUserId = user?._id || user?.id;
    return lenderId === currentUserId;
  });
  const pendingRequests = myRequests.filter((r) => r.status === 'pending');
  const totalEarnings = myRequests
    .filter((r) => r.status === 'completed' || r.status === 'accepted')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const stats = [
    { title: 'Active Listings', value: myItems.length, icon: 'cube', color: '#4F46E5' },
    { title: 'Pending', value: pendingRequests.length, icon: 'time', color: '#F59E0B' },
    { title: 'Total Earned', value: `₹${totalEarnings}`, icon: 'wallet', color: '#10B981' },
    { title: 'Total Requests', value: myRequests.length, icon: 'swap-horizontal', color: '#3B82F6' },
  ];

  const quickActions = [
    { icon: 'add-circle', label: 'Add Item', screen: 'AddItem', color: '#4F46E5' },
    { icon: 'list', label: 'My Listings', screen: 'MyListings', color: '#6366F1' },
    { icon: 'mail', label: 'Requests', screen: 'LenderRequests', color: '#F59E0B' },
    { icon: 'person', label: 'Profile', screen: 'Profile', color: '#10B981' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.gradient.hero}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 40,
          paddingHorizontal: Spacing.xxl,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Lender Dashboard</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 }}>Hi, {user?.name?.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
            style={{
              width: 50, height: 50, borderRadius: 25,
              backgroundColor: 'rgba(255,255,255,0.25)',
              padding: 2,
              borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
            }}
          >
             <Image 
              source={{ uri: user?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
              style={{ width: '100%', height: '100%', borderRadius: 25 }} 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.xxl, paddingBottom: 120, flexGrow: 1 }}
      >
        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 }}>
          {stats.map((stat, idx) => (
            <View key={idx} style={[{
              backgroundColor: colors.card,
              borderRadius: 28,
              padding: 24,
              width: (width - Spacing.xxl * 2 - 16) / 2,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }, Shadow.md]}>
              <View style={{
                width: 52, height: 52, borderRadius: 16,
                backgroundColor: stat.color + '15',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Ionicons name={stat.icon} size={26} color={stat.color} />
              </View>
              <Text style={{ fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 }}>{stat.value}</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textTertiary, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <Ionicons name="trending-up" size={14} color="#10B981" />
                <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '700', marginLeft: 4 }}>+12% <Text style={{ color: colors.textTertiary, fontWeight: '400' }}>vs last mo</Text></Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 }}>Quick Actions</Text>
        <View style={{ flexDirection: 'row', gap: 14, marginBottom: 40 }}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
              style={[{
                flex: 1, alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 20,
                paddingVertical: 20,
              }, Shadow.sm]}
            >
              <View style={{
                width: 48, height: 48, borderRadius: 14,
                backgroundColor: action.color + '15',
                alignItems: 'center', justifyContent: 'center', marginBottom: 10,
              }}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Requests */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>Recent Requests</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LenderRequests')}>
            <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '700' }}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {myRequests.slice(0, 3).map((req, idx) => {
          const statusColors = {
            pending: '#F59E0B',
            accepted: '#10B981',
            rejected: '#EF4444',
            completed: '#3B82F6',
          };
          return (
            <TouchableOpacity 
              key={idx} 
              activeOpacity={0.8}
              style={[{
                backgroundColor: colors.card,
                borderRadius: 24,
                padding: 16,
                marginBottom: 14,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.borderLight,
              }, Shadow.sm]}
            >
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: req.item?.images?.[0] || 'https://images.unsplash.com/photo-1518611012118-fd5e0b33a7c5?w=200' }} style={{ width: 64, height: 64, borderRadius: 16 }} />
                <View style={{ 
                  position: 'absolute', bottom: -4, right: -4, 
                  backgroundColor: '#FFF', padding: 2, borderRadius: 10 
                }}>
                  <Image source={{ uri: req.renter?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }} style={{ width: 20, height: 20, borderRadius: 10 }} />
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 20 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }} numberOfLines={1}>
                  {req.item.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <View style={{
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                    backgroundColor: statusColors[req.status] + '15'
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: '900', color: statusColors[req.status], textTransform: 'uppercase' }}>
                      {req.status}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginLeft: 10 }}>
                    {req.renter.name.split(' ')[0]}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: colors.primary }}>₹{req.totalPrice}</Text>
                <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 4 }}>{req.startDate}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {myRequests.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60, backgroundColor: colors.card, borderRadius: 24, ...Shadow.sm }}>
            <Ionicons name="mail-unread-outline" size={48} color={colors.textTertiary} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textSecondary, marginTop: 16 }}>No requests yet</Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4 }}>Your listing requests will appear here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

