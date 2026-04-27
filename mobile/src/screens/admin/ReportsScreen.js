import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/AppContext';
import { REPORTS } from '../../data/mockData';
import Header from '../../components/Header';
import { Spacing, BorderRadius, Shadow } from '../../constants';

export default function ReportsScreen() {
  const colors = useTheme();

  const statusConfig = {
    open: { color: colors.error, icon: 'alert-circle-outline', bg: colors.error + '15' },
    investigating: { color: colors.warning, icon: 'search-outline', bg: colors.warning + '15' },
    resolved: { color: colors.success, icon: 'checkmark-circle-outline', bg: colors.success + '15' },
  };

  const typeConfig = {
    complaint: { color: colors.error, icon: 'warning-outline' },
    dispute: { color: colors.warning, icon: 'git-compare-outline' },
    feedback: { color: colors.success, icon: 'chatbubble-ellipses-outline' },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Reports & Issues" subtitle={`${REPORTS.length} total`} centerTitle />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 100 }}
      >
        {/* Summary */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: Spacing.xl }}>
          {[
            { label: 'Open', count: REPORTS.filter(r => r.status === 'open').length, color: colors.error },
            { label: 'In Progress', count: REPORTS.filter(r => r.status === 'investigating').length, color: colors.warning },
            { label: 'Resolved', count: REPORTS.filter(r => r.status === 'resolved').length, color: colors.success },
          ].map((s, idx) => (
            <View key={idx} style={[{
              flex: 1, backgroundColor: colors.card,
              borderRadius: BorderRadius.md, padding: Spacing.md,
              alignItems: 'center',
            }, Shadow.sm]}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: s.color }}>{s.count}</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Report Cards */}
        {REPORTS.map((report) => {
          const sc = statusConfig[report.status];
          const tc = typeConfig[report.type];
          return (
            <View key={report.id} style={[{
              backgroundColor: colors.card,
              borderRadius: BorderRadius.lg,
              padding: Spacing.lg,
              marginBottom: Spacing.md,
            }, Shadow.sm]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: tc.color + '15',
                  alignItems: 'center', justifyContent: 'center', marginRight: 10,
                }}>
                  <Ionicons name={tc.icon} size={18} color={tc.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{report.title}</Text>
                  <Text style={{ fontSize: 11, color: colors.textTertiary, textTransform: 'capitalize' }}>{report.type}</Text>
                </View>
                <View style={{
                  paddingHorizontal: 10, paddingVertical: 4,
                  borderRadius: 10, backgroundColor: sc.bg,
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: sc.color, textTransform: 'capitalize' }}>
                    {report.status}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 10 }}>
                {report.description}
              </Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                borderTopWidth: 1, borderTopColor: colors.borderLight,
                paddingTop: 10,
              }}>
                <Image source={{ uri: report.reporter.avatar }} style={{ width: 24, height: 24, borderRadius: 12 }} />
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 8 }}>
                  Reported by {report.reporter.name}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textTertiary, marginLeft: 'auto' }}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
