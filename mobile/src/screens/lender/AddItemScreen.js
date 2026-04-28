import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../../context/AppContext';
import Header from '../../components/Header';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { CATEGORIES } from '../../data/mockData';
import { Spacing, BorderRadius, Shadow } from '../../constants';
import * as ImagePicker from 'expo-image-picker';

export default function AddItemScreen({ navigation }) {
  const colors = useTheme();
  const { addItem, API_URL, token } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const conditions = ['Like New', 'Excellent', 'Good', 'Fair'];

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Required';
    if (!description.trim()) e.description = 'Required';
    if (!price.trim()) e.price = 'Required';
    if (!category) e.category = 'Select a category';
    if (!condition) e.condition = 'Select condition';
    if (!location.trim()) e.location = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const uploadImages = async () => {
    if (!token) {
      return { urls: [], unauthorized: true, message: 'Session expired. Please login again.' };
    }

    const formData = new FormData();
    for (let i = 0; i < images.length; i++) {
      const uri = images[i];
      if (Platform.OS === 'web') {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('images', blob, `image-${Date.now()}-${i}.jpg`);
        } catch (e) {
          console.error('Failed to convert blob on web', e);
        }
      } else {
        const filename = uri.split('/').pop() || `image-${i}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('images', { uri, name: filename, type });
      }
    }

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      // Only set multipart/form-data explicitly on native mobile, web handles it automatically
      if (Platform.OS !== 'web') {
        headers['Content-Type'] = 'multipart/form-data';
      }

      const res = await fetch(`${API_URL}/items/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();

      if (res.status === 401) {
        return {
          urls: [],
          unauthorized: true,
          message: data?.message || 'Session expired. Please login again.',
        };
      }

      if (!res.ok) {
        return {
          urls: [],
          unauthorized: false,
          message: data?.message || 'Could not upload images',
        };
      }

      return { urls: data.urls || [], unauthorized: false, message: null };
    } catch (err) {
      console.error('Upload error:', err);
      return { urls: [], unauthorized: false, message: 'Upload failed. Please try again.' };
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!token) {
      Alert.alert('Login Required', 'Please login again to list your item.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    setLoading(true);
    const uploadResult = images.length > 0 ? await uploadImages() : { urls: [], unauthorized: false, message: null };
    
    if (uploadResult.unauthorized) {
      setLoading(false);
      Alert.alert('Session Expired', uploadResult.message || 'Please login again.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    if (uploadResult.urls.length === 0 && images.length > 0) {
      setLoading(false);
      Alert.alert('Upload Failed', uploadResult.message || 'Could not upload images. Please try again.');
      return;
    }

    const result = await addItem({
      title,
      description,
      price: Number(price),
      priceUnit: 'day',
      category,
      condition,
      location,
      distance: '0 km',
      deposit: Number(deposit) || Number(price) * 5,
      minRental: 1,
      maxRental: 30,
      images: uploadResult.urls,
      features: ['Quality Assured', 'Verified'],
    });

    setLoading(false);
    if (result.success) {
      if (Platform.OS === 'web') {
        window.alert('Success! Your item has been listed successfully.');
        navigation.goBack();
      } else {
        Alert.alert('Success!', 'Your item has been listed successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } else {
      if (result.status === 401) {
        Alert.alert('Session Expired', result.message || 'Please login again.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
        return;
      }
      Alert.alert('Error', result.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Add New Item"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        centerTitle
      />
      {Platform.OS === 'web' ? (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo Upload */}
          <TouchableOpacity 
            onPress={pickImage}
            style={[{
              backgroundColor: colors.card,
              borderRadius: BorderRadius.lg,
              height: 160,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: colors.border,
              marginBottom: images.length > 0 ? 12 : Spacing.xxl,
            }]}
          >
            <Ionicons name="camera-outline" size={36} color={colors.textTertiary} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginTop: 8 }}>
              Add Photos
            </Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
              Tap to upload up to 5 images
            </Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.xxl }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {images.map((uri, i) => (
                  <View key={i} style={{ position: 'relative' }}>
                    <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 12 }} />
                    <TouchableOpacity 
                      onPress={() => setImages(images.filter((_, idx) => idx !== i))}
                      style={{
                        position: 'absolute', top: -5, right: -5,
                        backgroundColor: colors.error, width: 22, height: 22, borderRadius: 11,
                        alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Ionicons name="close" size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 5 && (
                  <TouchableOpacity 
                    onPress={pickImage}
                    style={{ 
                      width: 100, height: 100, borderRadius: 12, 
                      borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border,
                      alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Ionicons name="add" size={24} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}

          <InputField
            label="Item Title"
            value={title}
            onChangeText={(t) => { setTitle(t); setErrors({ ...errors, title: null }); }}
            placeholder="e.g. Canon EOS R5 Camera"
            icon="pricetag-outline"
            error={errors.title}
          />
          <InputField
            label="Description"
            value={description}
            onChangeText={(t) => { setDescription(t); setErrors({ ...errors, description: null }); }}
            placeholder="Describe your item in detail..."
            icon="document-text-outline"
            multiline
            numberOfLines={4}
            error={errors.description}
          />

          {/* Category Selection */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: errors.category ? 4 : Spacing.lg }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => { setCategory(cat.name); setErrors({ ...errors, category: null }); }}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: category === cat.name ? colors.primary : colors.inputBackground,
                }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: '600',
                  color: category === cat.name ? '#FFF' : colors.textSecondary,
                }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && (
            <Text style={{ fontSize: 12, color: colors.error, marginBottom: Spacing.lg }}>{errors.category}</Text>
          )}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Price / Day (₹)"
                value={price}
                onChangeText={(t) => { setPrice(t); setErrors({ ...errors, price: null }); }}
                placeholder="500"
                keyboardType="numeric"
                icon="cash-outline"
                error={errors.price}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Deposit (₹)"
                value={deposit}
                onChangeText={setDeposit}
                placeholder="2500"
                keyboardType="numeric"
                icon="shield-outline"
              />
            </View>
          </View>

          {/* Condition */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>Condition</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: errors.condition ? 4 : Spacing.lg }}>
            {conditions.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => { setCondition(c); setErrors({ ...errors, condition: null }); }}
                style={{
                  flex: 1, alignItems: 'center',
                  paddingVertical: 10, borderRadius: BorderRadius.md,
                  backgroundColor: condition === c ? colors.success + '15' : colors.inputBackground,
                  borderWidth: condition === c ? 1 : 0,
                  borderColor: colors.success,
                }}
              >
                <Text style={{
                  fontSize: 12, fontWeight: '600',
                  color: condition === c ? colors.success : colors.textSecondary,
                }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.condition && (
            <Text style={{ fontSize: 12, color: colors.error, marginBottom: Spacing.lg }}>{errors.condition}</Text>
          )}

          <InputField
            label="Location"
            value={location}
            onChangeText={(t) => { setLocation(t); setErrors({ ...errors, location: null }); }}
            placeholder="e.g. Koramangala, Bangalore"
            icon="location-outline"
            error={errors.location}
          />

          <CustomButton
            title="List Item"
            onPress={handleSubmit}
            loading={loading}
            icon="cloud-upload-outline"
            size="lg"
            style={{ marginTop: Spacing.md }}
          />
        </ScrollView>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Photo Upload */}
            <TouchableOpacity 
              onPress={pickImage}
              style={[{
                backgroundColor: colors.card,
                borderRadius: BorderRadius.lg,
                height: 160,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: colors.border,
                marginBottom: images.length > 0 ? 12 : Spacing.xxl,
              }]}
            >
              <Ionicons name="camera-outline" size={36} color={colors.textTertiary} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginTop: 8 }}>
                Add Photos
              </Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
                Tap to upload up to 5 images
              </Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.xxl }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {images.map((uri, i) => (
                    <View key={i} style={{ position: 'relative' }}>
                      <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 12 }} />
                      <TouchableOpacity 
                        onPress={() => setImages(images.filter((_, idx) => idx !== i))}
                        style={{
                          position: 'absolute', top: -5, right: -5,
                          backgroundColor: colors.error, width: 22, height: 22, borderRadius: 11,
                          alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <Ionicons name="close" size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {images.length < 5 && (
                    <TouchableOpacity 
                      onPress={pickImage}
                      style={{ 
                        width: 100, height: 100, borderRadius: 12, 
                        borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border,
                        alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Ionicons name="add" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}

            <InputField
              label="Item Title"
              value={title}
              onChangeText={(t) => { setTitle(t); setErrors({ ...errors, title: null }); }}
              placeholder="e.g. Canon EOS R5 Camera"
              icon="pricetag-outline"
              error={errors.title}
            />
            <InputField
              label="Description"
              value={description}
              onChangeText={(t) => { setDescription(t); setErrors({ ...errors, description: null }); }}
              placeholder="Describe your item in detail..."
              icon="document-text-outline"
              multiline
              numberOfLines={4}
              error={errors.description}
            />

            {/* Category Selection */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: errors.category ? 4 : Spacing.lg }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => { setCategory(cat.name); setErrors({ ...errors, category: null }); }}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: category === cat.name ? colors.primary : colors.inputBackground,
                  }}
                >
                  <Text style={{
                    fontSize: 13, fontWeight: '600',
                    color: category === cat.name ? '#FFF' : colors.textSecondary,
                  }}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.category && (
              <Text style={{ fontSize: 12, color: colors.error, marginBottom: Spacing.lg }}>{errors.category}</Text>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Price / Day (₹)"
                  value={price}
                  onChangeText={(t) => { setPrice(t); setErrors({ ...errors, price: null }); }}
                  placeholder="500"
                  keyboardType="numeric"
                  icon="cash-outline"
                  error={errors.price}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Deposit (₹)"
                  value={deposit}
                  onChangeText={setDeposit}
                  placeholder="2500"
                  keyboardType="numeric"
                  icon="shield-outline"
                />
              </View>
            </View>

            {/* Condition */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>Condition</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: errors.condition ? 4 : Spacing.lg }}>
              {conditions.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => { setCondition(c); setErrors({ ...errors, condition: null }); }}
                  style={{
                    flex: 1, alignItems: 'center',
                    paddingVertical: 10, borderRadius: BorderRadius.md,
                    backgroundColor: condition === c ? colors.success + '15' : colors.inputBackground,
                    borderWidth: condition === c ? 1 : 0,
                    borderColor: colors.success,
                  }}
                >
                  <Text style={{
                    fontSize: 12, fontWeight: '600',
                    color: condition === c ? colors.success : colors.textSecondary,
                  }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.condition && (
              <Text style={{ fontSize: 12, color: colors.error, marginBottom: Spacing.lg }}>{errors.condition}</Text>
            )}

            <InputField
              label="Location"
              value={location}
              onChangeText={(t) => { setLocation(t); setErrors({ ...errors, location: null }); }}
              placeholder="e.g. Koramangala, Bangalore"
              icon="location-outline"
              error={errors.location}
            />

            <CustomButton
              title="List Item"
              onPress={handleSubmit}
              loading={loading}
              icon="cloud-upload-outline"
              size="lg"
              style={{ marginTop: Spacing.md }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
