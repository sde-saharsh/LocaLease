import React from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/AppContext';
import { ADMIN_STATS } from '../../data/mockData';
import { Spacing, BorderRadius, Shadow } from '../../constants';

const { width } = Dimensions.get('window');

export default function AdminDashboard({ navigation }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const stats = ADMIN_STATS;

  const cards = [
    { title: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: 'people', color: '#4F46E5', trend: 'up', trendVal: `+${stats.userGrowth}%` },
    { title: 'Total Lenders', value: stats.totalLenders.toLocaleString(), icon: 'storefront', color: '#06B6D4', trend: 'up', trendVal: '+5.2%' },
    { title: 'Active Rentals', value: stats.activeRentals.toString(), icon: 'swap-horizontal', color: '#10B981', trend: 'up', trendVal: '+18%' },
    { title: 'Revenue', value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: 'wallet', color: '#F59E0B', trend: 'up', trendVal: `+${stats.monthlyGrowth}%` },
  ];

  const quickActions = [
    { label: 'Manage Users', icon: 'people', color: '#3B82F6', target: 'Users' },
    { label: 'Manage Listings', icon: 'list', color: '#10B981', target: 'Listings' },
    { label: 'Reports', icon: 'warning', color: '#F59E0B', target: 'Reports' },
    { label: 'Admin Profile', icon: 'person', color: '#F43F5E', target: 'Profile' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981', letterSpacing: 1 }}>SYSTEM ONLINE</Text>
            </View>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 }}>Command Center</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Reports')}
            style={{
            width: 54, height: 54, borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.1)',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
          }}
          >
            <Ionicons name="notifications-outline" size={26} color="#FFF" />
            <View style={{ position: 'absolute', top: 12, right: 12, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.error, borderWidth: 2, borderColor: '#1E293B' }} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 30 }}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                if (action.target) {
                  navigation.navigate(action.target);
                  return;
                }
                Alert.alert('Coming soon', `${action.label} will be available in a future update.`);
              }}
              style={{ 
              backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 20, paddingVertical: 12, 
              borderRadius: 16, marginRight: 12, flexDirection: 'row', alignItems: 'center',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
            }}>
              <Ionicons name={action.icon} size={18} color={action.color} />
              <Text style={{ color: '#FFF', fontWeight: '800', marginLeft: 10, fontSize: 13 }}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.xxl, paddingBottom: 120, flexGrow: 1 }}
      >
        {/* Stat Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 }}>
          {cards.map((card, idx) => (
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
                width: 48, height: 48, borderRadius: 14,
                backgroundColor: card.color + '10',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Ionicons name={card.icon} size={24} color={card.color} />
              </View>
              <Text style={{ fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 }}>{card.value}</Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textTertiary, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{card.title}</Text>
            </View>
          ))}
        </View>

        {/* Live Activity Pulse */}
        <View style={[{
          backgroundColor: colors.card,
          borderRadius: 30,
          padding: 24,
          marginBottom: 32,
          borderWidth: 1,
          borderColor: colors.borderLight,
        }, Shadow.md]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary }}>Live Pulse</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>Real-time event stream</Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#10B98115', borderRadius: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#10B981' }}>LIVE</Text>
            </View>
          </View>

          {[
            { user: 'Saharsh K.', action: 'new listing', item: 'Sony Alpha A7III', time: '2m ago', icon: 'camera', color: '#4F46E5' },
            { user: 'John Doe', action: 'rented', item: 'MacBook Pro M2', time: '12m ago', icon: 'laptop', color: '#06B6D4' },
            { user: 'Rahul S.', action: 'joined', item: 'as Lender', time: '45m ago', icon: 'person-add', color: '#F59E0B' },
          ].map((item, i) => (
            <View key={i} style={{ 
              flexDirection: 'row', alignItems: 'center', marginBottom: 20,
              paddingBottom: i < 2 ? 20 : 0,
              borderBottomWidth: i < 2 ? 1 : 0,
              borderBottomColor: colors.borderLight
            }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: item.color + '15', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                  {item.user} <Text style={{ fontWeight: '400', color: colors.textSecondary }}>{item.action}</Text>
                </Text>
                <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 2 }}>{item.item}</Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.textTertiary }}>{item.time}</Text>
            </View>
          ))}
        </View>

        {/* System Health */}
        <View style={[{
          backgroundColor: '#1E1B4B',
          borderRadius: 30,
          padding: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
        }, Shadow.md]}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#FFF', marginBottom: 20 }}>System Resources</Text>
          {[
            { label: 'CPU Usage', val: '24%', color: '#10B981' },
            { label: 'Memory', val: '68%', color: '#F59E0B' },
            { label: 'Storage', val: '42%', color: '#3B82F6' },
          ].map((stat, i) => (
            <View key={i} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' }}>{stat.label}</Text>
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>{stat.val}</Text>
              </View>
              <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: stat.val, backgroundColor: stat.color, borderRadius: 3 }} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

