import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { USERS, ITEMS, REQUESTS } from '../data/mockData';

const AppContext = createContext();

const normalizeUserRole = (role) => (role === 'user' ? 'renter' : role);

const initialState = {
  user: null,
  role: null,
  token: null,
  isAuthenticated: false,
  isDarkMode: false,
  items: [],
  requests: [],
  users: USERS,
  wishlist: [],
  searchQuery: '',
  selectedCategory: null,
  loading: false,
  userLocation: null,      // { lat, lng, city }
  locationFilter: 'all',  // 'all' | 'nearby' | 'city'
  locationLoading: false,
};

const ActionTypes = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
  TOGGLE_WISHLIST: 'TOGGLE_WISHLIST',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_CATEGORY: 'SET_CATEGORY',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_REQUEST_STATUS: 'UPDATE_REQUEST_STATUS',
  CREATE_REQUEST: 'CREATE_REQUEST',
  SET_LOADING: 'SET_LOADING',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_ITEMS: 'SET_ITEMS',
  SET_REQUESTS: 'SET_REQUESTS',
  SET_TOKEN: 'SET_TOKEN',
  SET_USER_LOCATION: 'SET_USER_LOCATION',
  SET_LOCATION_FILTER: 'SET_LOCATION_FILTER',
  SET_LOCATION_LOADING: 'SET_LOCATION_LOADING',
};

function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.LOGIN:
      return {
        ...state,
        user: action.payload.user,
        role: action.payload.user.role,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        role: null,
        token: null,
        isAuthenticated: false,
      };
    case ActionTypes.TOGGLE_DARK_MODE:
      return {
        ...state,
        isDarkMode: !state.isDarkMode,
      };
    case ActionTypes.TOGGLE_WISHLIST: {
      const itemId = action.payload;
      const isWishlisted = state.wishlist.includes(itemId);
      return {
        ...state,
        wishlist: isWishlisted
          ? state.wishlist.filter(id => id !== itemId)
          : [...state.wishlist, itemId],
      };
    }
    case ActionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };
    case ActionTypes.SET_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload,
      };
    case ActionTypes.ADD_ITEM: {
      const newItem = {
        ...action.payload,
        id: String(state.items.length + 1),
        owner: state.user,
        rating: 0,
        reviews: 0,
        available: true,
        wishlist: false,
      };
      return {
        ...state,
        items: [newItem, ...state.items],
      };
    }
    case ActionTypes.UPDATE_REQUEST_STATUS:
      return {
        ...state,
        requests: state.requests.map(req =>
          req.id === action.payload.id
            ? { ...req, status: action.payload.status }
            : req
        ),
      };
    case ActionTypes.CREATE_REQUEST: {
      const newRequest = {
        ...action.payload,
        id: String(state.requests.length + 1),
        renter: state.user,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        requests: [newRequest, ...state.requests],
      };
    }
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ActionTypes.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case ActionTypes.SET_ITEMS:
      return {
        ...state,
        items: action.payload,
      };
    case ActionTypes.SET_REQUESTS:
      return {
        ...state,
        requests: action.payload,
      };
    case ActionTypes.SET_TOKEN:
      return {
        ...state,
        token: action.payload,
      };
    case ActionTypes.SET_USER_LOCATION:
      return {
        ...state,
        userLocation: action.payload,
      };
    case ActionTypes.SET_LOCATION_FILTER:
      return {
        ...state,
        locationFilter: action.payload,
      };
    case ActionTypes.SET_LOCATION_LOADING:
      return {
        ...state,
        locationLoading: action.payload,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const forceLogout = useCallback(async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    dispatch({ type: ActionTypes.LOGOUT });
  }, []);

  // Resolve API URL in this order:
  // 1) EXPO_PUBLIC_API_URL (recommended for custom setups)
  // 2) deployed fallback
  const resolveApiUrl = () => {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) return envUrl;

    return 'https://localease-1o38.onrender.com/api';
  };
  const API_URL = resolveApiUrl();

  // Load token and user on startup
  React.useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser);
          const normalizedUser = { ...user, role: normalizeUserRole(user?.role) };
          dispatch({ 
            type: ActionTypes.LOGIN, 
            payload: { user: normalizedUser, token: storedToken } 
          });
        }
      } catch (err) {
        console.error('Failed to load storage data:', err);
      }
    };
    loadStorageData();
  }, []);

  const fetchItems = useCallback(async (locationParams = {}) => {
    try {
      const params = new URLSearchParams();
      if (locationParams.lat) params.append('lat', locationParams.lat);
      if (locationParams.lng) params.append('lng', locationParams.lng);
      if (locationParams.radius) params.append('radius', locationParams.radius);
      if (locationParams.city) params.append('city', locationParams.city);
      const query = params.toString();
      const res = await fetch(`${API_URL}/items${query ? `?${query}` : ''}`);
      const data = await res.json();
      if (res.ok) dispatch({ type: ActionTypes.SET_ITEMS, payload: data });
    } catch (err) {
      console.error('Fetch items error:', err);
      dispatch({ type: ActionTypes.SET_ITEMS, payload: ITEMS });
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    if (!state.token) {
      dispatch({ type: ActionTypes.SET_REQUESTS, payload: REQUESTS });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/requests`, {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        dispatch({ type: ActionTypes.SET_REQUESTS, payload: data });
        return;
      }
      if (res.status === 401) {
        await forceLogout();
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
      dispatch({ type: ActionTypes.SET_REQUESTS, payload: REQUESTS });
    }
  }, [state.token, forceLogout]);

  React.useEffect(() => {
    fetchItems();
    fetchRequests();
  }, [fetchItems, fetchRequests]);

  const register = useCallback(async (userData) => {
    try {
      const selectedRole = userData?.role === 'lender' ? 'lender' : 'renter';
      const registerPath = selectedRole === 'lender' ? '/auth/lender/register' : '/auth/renter/register';
      const res = await fetch(`${API_URL}${registerPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok) {
        const normalizedUser = { ...data.user, role: normalizeUserRole(data?.user?.role) };
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
        dispatch({ type: ActionTypes.LOGIN, payload: { user: normalizedUser, token: data.token } });
        return { success: true, role: normalizedUser.role };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return {
        success: false,
        message: `Registration failed. Check backend/API URL. (${err.message})`,
      };
    }
  }, [API_URL]);

  const login = useCallback(async (email, password) => {
    try {
      // Always login through the non-role-restricted endpoint.
      // The backend returns the actual user.role; we should trust it to avoid 403s when users pick the wrong portal.
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        const normalizedUser = { ...data.user, role: normalizeUserRole(data?.user?.role) };
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
        dispatch({ type: ActionTypes.LOGIN, payload: { user: normalizedUser, token: data.token } });
        return { success: true, role: normalizedUser.role };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return {
        success: false,
        message: `Login failed. Check backend/API URL. (${err.message})`,
      };
    }
  }, [API_URL]);

  const loginAsRole = useCallback((role) => {
    // If user is logged in, just update their active role for the UI
    if (state.user) {
      // Security: only admin users can switch across portals.
      if (state.user.role !== 'admin' && role !== state.user.role) {
        return { success: false, message: 'Role switching is disabled for signed-in users' };
      }
      dispatch({ 
        type: ActionTypes.LOGIN, 
        payload: {
          user: { ...state.user, role: state.user.role === 'admin' ? role : state.user.role },
          token: state.token,
        } 
      });
      return { success: true, role: state.user.role === 'admin' ? role : state.user.role };
    }

    // Fallback to demo mode for guest users
    const user = USERS.find(u => u.role === role);
    if (user) {
      dispatch({ type: ActionTypes.LOGIN, payload: { user, token: 'demo_token' } });
      return { success: true, user };
    }
    return { success: false };
  }, [state.user, state.token]);

  const logout = useCallback(async () => {
    await forceLogout();
  }, [forceLogout]);

  // ─── Location ────────────────────────────────────────────────────────────────

  /**
   * Requests foreground location permission, fetches GPS coords, and reverse-
   * geocodes to extract the city name. Stores result in userLocation state.
   */
  const requestUserLocation = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOCATION_LOADING, payload: true });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        dispatch({ type: ActionTypes.SET_LOCATION_LOADING, payload: false });
        return { success: false, message: 'Location permission denied' };
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const city =
        geo?.city || geo?.subregion || geo?.district || geo?.region || 'Your City';
      const locationData = { lat: latitude, lng: longitude, city };
      dispatch({ type: ActionTypes.SET_USER_LOCATION, payload: locationData });
      dispatch({ type: ActionTypes.SET_LOCATION_LOADING, payload: false });
      return { success: true, location: locationData };
    } catch (err) {
      console.error('Location error:', err);
      dispatch({ type: ActionTypes.SET_LOCATION_LOADING, payload: false });
      return { success: false, message: err.message };
    }
  }, []);

  const setLocationFilter = useCallback((filter) => {
    dispatch({ type: ActionTypes.SET_LOCATION_FILTER, payload: filter });
  }, []);

  const toggleDarkMode = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_DARK_MODE });
  }, []);

  const toggleWishlist = useCallback((itemId) => {
    dispatch({ type: ActionTypes.TOGGLE_WISHLIST, payload: itemId });
  }, []);

  const setSearchQuery = useCallback((query) => {
    dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query });
  }, []);

  const setCategory = useCallback((category) => {
    dispatch({ type: ActionTypes.SET_CATEGORY, payload: category });
  }, []);

  const updateRequestStatus = useCallback(async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch({ type: ActionTypes.UPDATE_REQUEST_STATUS, payload: { id, status } });
        return { success: true };
      }
      if (res.status === 401) {
        await forceLogout();
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Failed to update request' };
    }
  }, [state.token, forceLogout]);

  const createRequest = useCallback(async (requestData) => {
    try {
      const res = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify(requestData),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch({ type: ActionTypes.CREATE_REQUEST, payload: data });
        return { success: true };
      }
      if (res.status === 401) {
        await forceLogout();
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Failed to create request' };
    }
  }, [state.token, forceLogout]);

  const updateProfile = useCallback((updates) => {
    dispatch({ type: ActionTypes.UPDATE_PROFILE, payload: updates });
  }, []);

  const addItem = useCallback(async (itemData) => {
    try {
      const res = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify(itemData),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch({ type: ActionTypes.ADD_ITEM, payload: data });
        return { success: true };
      }
      if (res.status === 401) {
        await forceLogout();
      }
      return { success: false, status: res.status, message: data.message };
    } catch (err) {
      return { success: false, message: 'Failed to list item' };
    }
  }, [state.token, forceLogout]);

  const value = {
    ...state,
    API_URL,
    login,
    register,
    loginAsRole,
    logout,
    toggleDarkMode,
    toggleWishlist,
    setSearchQuery,
    setCategory,
    addItem,
    updateRequestStatus,
    createRequest,
    updateProfile,
    fetchItems,
    requestUserLocation,
    setLocationFilter,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useTheme() {
  const { isDarkMode } = useApp();
  const { Colors } = require('../constants/colors');
  return isDarkMode ? Colors.dark : Colors.light;
}
