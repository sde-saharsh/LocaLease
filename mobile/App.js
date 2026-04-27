import React from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

function AppContent() {
  const { isDarkMode } = useApp();
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    body {
      overflow: auto !important;
    }
    #root {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `;
  document.head.appendChild(style);
}

// On web, GestureHandlerRootView can block scrolling, so use a plain View
const RootWrapper = Platform.OS === 'web'
  ? ({ children, style }) => <View style={style}>{children}</View>
  : GestureHandlerRootView;

export default function App() {
  return (
    <RootWrapper style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <ErrorBoundary>
          <AppProvider>
            <View style={{ flex: 1 }}>
              <AppContent />
            </View>
          </AppProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </RootWrapper>
  );
}
