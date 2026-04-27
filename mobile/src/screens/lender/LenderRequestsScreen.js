import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../../context/AppContext';
import { RequestCard } from '../../components/RequestCard';
import Header from '../../components/Header';
import { Spacing } from '../../constants';

export default function LenderRequestsScreen({ navigation }) {
  const colors = useTheme();
  const { requests, user, updateRequestStatus } = useApp();
  const myRequests = requests.filter((r) => {
    const lenderId = r.lender?._id || r.lender?.id || r.lender;
    const currentUserId = user?._id || user?.id;
    return lenderId === currentUserId;
  });

  const handleAccept = (id) => {
    Alert.alert('Accept Request', 'Are you sure you want to accept this rental request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => updateRequestStatus(id, 'accepted') },
    ]);
  };

  const handleReject = (id) => {
    Alert.alert('Decline Request', 'Are you sure you want to decline this rental request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => updateRequestStatus(id, 'rejected') },
    ]);
  };

  const pending = myRequests.filter((r) => r.status === 'pending');
  const others = myRequests.filter((r) => r.status !== 'pending');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Rental Requests"
        subtitle={`${pending.length} pending`}
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        centerTitle
      />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 100 }}
      >
        {pending.length > 0 && (
          <View style={{ marginBottom: Spacing.xxl }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: Spacing.md }}>
              Pending ({pending.length})
            </Text>
            {pending.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                showActions
                onAccept={() => handleAccept(req.id)}
                onReject={() => handleReject(req.id)}
              />
            ))}
          </View>
        )}
        {others.length > 0 && (
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: Spacing.md }}>
              Past Requests ({others.length})
            </Text>
            {others.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </View>
        )}
        {myRequests.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="mail-outline" size={64} color={colors.textTertiary} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary }}>No requests yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
