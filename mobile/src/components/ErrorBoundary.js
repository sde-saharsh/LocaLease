import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center',
          padding: 24, backgroundColor: '#F9FAFB',
        }}>
          <Ionicons name="alert-circle-outline" size={80} color="#EF4444" style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{
            fontSize: 13, color: '#6B7280', textAlign: 'center',
            marginBottom: 20, lineHeight: 18,
          }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{
              backgroundColor: '#4F46E5', paddingHorizontal: 24,
              paddingVertical: 12, borderRadius: 12,
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
