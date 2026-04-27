import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../../context/AppContext';
import { RequestCard } from '../../components/RequestCard';
import Header from '../../components/Header';
import { Spacing } from '../../constants';

export default function RequestStatusScreen({ navigation }) {
  const colors = useTheme();
  const { requests, user } = useApp();

  const userRequests = requests.filter((r) => {
    const renterId = r.renter?._id || r.renter?.id || r.renter;
    const currentUserId = user?._id || user?.id;
    return renterId === currentUserId;
  });

  const grouped = {
    pending: userRequests.filter((r) => r.status === 'pending'),
    accepted: userRequests.filter((r) => r.status === 'accepted'),
    completed: userRequests.filter((r) => r.status === 'completed'),
    rejected: userRequests.filter((r) => r.status === 'rejected'),
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="My Requests" subtitle={`${userRequests.length} total`} centerTitle />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 100 }}
      >
        {Object.entries(grouped).map(([status, reqs]) => {
          if (reqs.length === 0) return null;
          return (
            <View key={status} style={{ marginBottom: Spacing.xxl }}>
              <Text style={{
                fontSize: 16, fontWeight: '700', color: colors.textPrimary,
                marginBottom: Spacing.md, textTransform: 'capitalize',
              }}>
                {status} ({reqs.length})
              </Text>
              {reqs.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </View>
          );
        })}
        {userRequests.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="cube-outline" size={64} color={colors.textTertiary} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textSecondary }}>No requests yet</Text>
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 4 }}>
              Start renting items to see your requests here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
