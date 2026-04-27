import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Platform } from 'react-native';
import { useApp, useTheme } from '../context/AppContext';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// User Screens
import UserHomeScreen from '../screens/user/HomeScreen';
import ItemDetailsScreen from '../screens/user/ItemDetailsScreen';
import SearchScreen from '../screens/user/SearchScreen';
import RequestStatusScreen from '../screens/user/RequestStatusScreen';

// Lender Screens
import LenderDashboard from '../screens/lender/LenderDashboard';
import AddItemScreen from '../screens/lender/AddItemScreen';
import MyListingsScreen from '../screens/lender/MyListingsScreen';
import LenderRequestsScreen from '../screens/lender/LenderRequestsScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import ManageListingsScreen from '../screens/admin/ManageListingsScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';

// Shared
import ProfileScreen from '../screens/shared/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab Icons ───
function TabIcon({ name, focused, color }) {
  // Handle case where name might already include -outline
  const iconName = focused ? name : (name.endsWith('-outline') ? name : `${name}-outline`);
  
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {focused && (
        <View style={{
          position: 'absolute',
          top: -10,
          width: 24,
          height: 3,
          borderRadius: 2,
          backgroundColor: color,
        }} />
      )}
      <Ionicons name={iconName} size={24} color={color} />
    </View>
  );
}

// ─── User Tabs ───
function UserTabs() {
  const { role } = useApp();
  if (role === 'lender') return <LenderTabs />;
  if (role === 'admin') return <AdminTabs />;
  const colors = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: Platform.select({ ios: 100, android: 80, web: 85 }),
          paddingBottom: Platform.select({ ios: 35, android: 15, web: 15 }),
          paddingTop: 15,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 30,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.1,
          shadowRadius: 25,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 6,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={UserHomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="search" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={RequestStatusScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="receipt" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Lender Tabs ───
function LenderTabs() {
  const { role } = useApp();
  if (role === 'renter') return <UserTabs />;
  if (role === 'admin') return <AdminTabs />;
  const colors = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: Platform.select({ ios: 100, android: 80, web: 85 }),
          paddingBottom: Platform.select({ ios: 35, android: 15, web: 15 }),
          paddingTop: 15,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 30,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.1,
          shadowRadius: 25,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 6,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={LenderDashboard}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="grid" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Listings"
        component={MyListingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="list" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={LenderRequestsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="mail" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Admin Tabs ───
function AdminTabs() {
  const { role } = useApp();
  if (role === 'renter') return <UserTabs />;
  if (role === 'lender') return <LenderTabs />;
  const colors = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: Platform.select({ ios: 100, android: 80, web: 85 }),
          paddingBottom: Platform.select({ ios: 35, android: 15, web: 15 }),
          paddingTop: 15,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 30,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.1,
          shadowRadius: 25,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 6,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="stats-chart" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={ManageUsersScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="people" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Listings"
        component={ManageListingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="list" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="flag" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Main Navigator ───
export default function AppNavigator() {
  const { isDarkMode } = useApp();
  const colors = useTheme();
  const linking = Platform.OS === 'web' ? { enabled: false } : undefined;

  const baseTheme = isDarkMode ? DarkTheme : DefaultTheme;

  const fontConfig = {
    regular: { fontFamily: Platform.OS === 'web' ? 'System' : undefined, fontWeight: '400' },
    medium: { fontFamily: Platform.OS === 'web' ? 'System' : undefined, fontWeight: '500' },
    bold: { fontFamily: Platform.OS === 'web' ? 'System' : undefined, fontWeight: '700' },
    heavy: { fontFamily: Platform.OS === 'web' ? 'System' : undefined, fontWeight: '800' },
  };

  const theme = {
    ...baseTheme,
    dark: isDarkMode,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.accent,
    },
    fonts: {
      ...baseTheme.fonts,
      ...fontConfig,
    },
  };

  return (
    <NavigationContainer theme={theme} linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: Platform.OS !== 'web',
          ...(Platform.OS !== 'web' ? TransitionPresets.SlideFromRightIOS : {}),
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="UserTabs" component={UserTabs} />
        <Stack.Screen name="LenderTabs" component={LenderTabs} />
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
        <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="AddItem" component={AddItemScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

