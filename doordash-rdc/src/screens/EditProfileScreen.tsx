import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { useAuth } from '../context/AuthContext';
import { getUserAvatarUri } from '../utils/resolveUserPhotoUrl';
import { launchImageLibraryAsync, MediaType, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { config } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<any>;

export default function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, updateProfile, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState<string | null>(user?.photo || null);
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name, phone });
      Alert.alert('Succès', 'Profil mis à jour', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à vos photos');
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    setPhotoLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      // Get token
      const token = await AsyncStorage.getItem('auth_token');
      console.log('Token exists:', !!token);
      const base = config.API_BASE_URL.replace(/\/$/, '');
      const response = await fetch(`${base}/profile/photo`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        if (data.photo_url) {
          setPhoto(data.photo_url);
        } else if (data.user?.photo) {
          const origin = base.replace(/\/api$/, '');
          setPhoto(`${origin}/${String(data.user.photo).replace(/^\//, '')}`);
        }
        if (data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
        }
        await refreshUser();
        Alert.alert('Succès', 'Photo mise à jour');
      } else {
        throw new Error(data.message || `Erreur ${response.status}`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour la photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header avec retour */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Modifier le profil</Text>
        </View>

        {/* Photo de profil */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: getUserAvatarUri(photo ?? user?.photo) }}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handlePickImage}
            disabled={photoLoading}
          >
            {photoLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Ionicons name="camera" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Nom complet"
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Numéro de téléphone"
              placeholderTextColor={COLORS.textLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Enregistrer</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backButton: { marginRight: SPACING.md },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.backgroundSecondary,
  },
  photoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    }),
  },
  form: { gap: SPACING.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...({
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    }),
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
