import React, { createContext, useContext, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USERS, ITEMS, REQUESTS } from '../data/mockData';

const AppContext = createContext();

const initialState = {
  user: null,
  role: null,
  token: null,
  isAuthenticated: false,
  isDarkMode: false,
  items: [],
  requests: [],
  users: [],
  wishlist: [],
  searchQuery: '',
  selectedCategory: null,
  loading: false,
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
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const API_URL = 'http://localhost:5000/api';

  // Load token and user on startup
  React.useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser);
          dispatch({ 
            type: ActionTypes.LOGIN, 
            payload: { user, token: storedToken } 
          });
        }
      } catch (err) {
        console.error('Failed to load storage data:', err);
      }
    };
    loadStorageData();
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/items`);
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
      if (res.ok) dispatch({ type: ActionTypes.SET_REQUESTS, payload: data });
    } catch (err) {
      console.error('Fetch requests error:', err);
      dispatch({ type: ActionTypes.SET_REQUESTS, payload: REQUESTS });
    }
  }, [state.token]);

  React.useEffect(() => {
    fetchItems();
    fetchRequests();
  }, [fetchItems, fetchRequests]);

  const register = useCallback(async (userData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        dispatch({ type: ActionTypes.LOGIN, payload: { user: data.user, token: data.token } });
        return { success: true, role: data.user.role };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Registration failed' };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        dispatch({ type: ActionTypes.LOGIN, payload: { user: data.user, token: data.token } });
        return { success: true, role: data.user.role };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error' };
    }
  }, []);

  const loginAsRole = useCallback((role) => {
    // If user is logged in, just update their active role for the UI
    if (state.user) {
      // Security: Only allow switching to 'admin' if the user is actually an admin in DB
      if (role === 'admin' && state.user.role !== 'admin') {
        return { success: false, message: 'Not authorized for Admin role' };
      }
      
      dispatch({ 
        type: ActionTypes.LOGIN, 
        payload: { user: { ...state.user, role }, token: state.token } 
      });
      return { success: true, role };
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
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    dispatch({ type: ActionTypes.LOGOUT });
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
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Failed to update request' };
    }
  }, [state.token]);

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
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Failed to create request' };
    }
  }, [state.token]);

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
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Failed to list item' };
    }
  }, [state.token]);

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
