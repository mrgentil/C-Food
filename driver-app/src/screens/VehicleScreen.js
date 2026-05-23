import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { uploadDriverDocument } from '../services/documentUpload';

const DOC_CONFIG = [
  { key: 'license', apiField: 'license_url', title: 'Permis de conduire', icon: 'card-outline', urlKey: 'licenseUrl' },
  { key: 'insurance', apiField: 'insurance_url', title: 'Assurance véhicule', icon: 'shield-checkmark-outline', urlKey: 'insuranceUrl' },
  { key: 'id', apiField: 'id_url', title: "Pièce d'identité", icon: 'id-card-outline', urlKey: 'idUrl' },
];

function docStatusLabel(profile, hasUrl) {
  if (profile?.verificationStatus === 'approved') return { text: 'Vérifié', color: '#166534' };
  if (!hasUrl) return { text: 'À fournir', color: '#DC2626' };
  if (profile?.verificationStatus === 'rejected') return { text: 'À corriger', color: '#DC2626' };
  return { text: 'En attente de validation', color: '#B45309' };
}

const VehicleScreen = ({ navigation }) => {
  const { driverProfile, refreshProfile } = useAuth();
  const [vehicleType, setVehicleType] = useState(driverProfile?.vehicleType || 'moto');
  const [plateNumber, setPlateNumber] = useState(driverProfile?.plateNumber || '');
  const [loading, setLoading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const vehicleTypes = [
    { id: 'moto', label: 'Moto', icon: 'motorbike' },
    { id: 'car', label: 'Voiture', icon: 'car' },
    { id: 'bike', label: 'Vélo', icon: 'bike' },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/driver/profile', {
        vehicle_type: vehicleType,
        plate_number: plateNumber,
      });
      await refreshProfile();
      Alert.alert('Succès', 'Informations du véhicule mises à jour.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', error?.response?.data?.message || 'Impossible de mettre à jour.');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (doc) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission', 'Accès aux photos requis.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) return;

      setUploadingKey(doc.key);
      const url = await uploadDriverDocument(result.assets[0].uri);
      await api.put('/driver/profile', { [doc.apiField]: url });
      await refreshProfile();
      Alert.alert('Succès', `${doc.title} enregistré. En attente de validation admin.`);
    } catch (e) {
      Alert.alert('Erreur', e?.message || 'Échec du téléversement.');
    } finally {
      setUploadingKey(null);
    }
  };

  const vStatus = driverProfile?.verificationStatus;
  const bannerStyle =
    vStatus === 'approved'
      ? styles.bannerOk
      : vStatus === 'rejected'
        ? styles.bannerErr
        : styles.bannerWait;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111C44" />
        </TouchableOpacity>
        <Text style={styles.title}>Mon véhicule</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={styles.saveText}>{loading ? '...' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.banner, bannerStyle]}>
          <Text style={styles.bannerTitle}>{driverProfile?.verificationLabel || 'En attente'}</Text>
          {driverProfile?.verificationNote ? (
            <Text style={styles.bannerSub}>{driverProfile.verificationNote}</Text>
          ) : null}
          {vStatus === 'approved' ? (
            <Text style={styles.bannerSub}>Vous pouvez passer en ligne et accepter des courses.</Text>
          ) : (
            <Text style={styles.bannerSub}>
              Téléversez permis + assurance. L'admin valide votre dossier.
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Type de véhicule</Text>
        <View style={styles.typesContainer}>
          {vehicleTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeCard, vehicleType === type.id && styles.typeCardActive]}
              onPress={() => setVehicleType(type.id)}
            >
              <MaterialCommunityIcons
                name={type.icon}
                size={32}
                color={vehicleType === type.id ? 'white' : '#64748B'}
              />
              <Text style={[styles.typeLabel, vehicleType === type.id && styles.typeLabelActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Plaque d'immatriculation</Text>
        <TextInput
          style={styles.input}
          value={plateNumber}
          onChangeText={setPlateNumber}
          placeholder="Ex: 1234AB01"
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.sectionTitle}>Documents officiels</Text>

        {DOC_CONFIG.map((doc) => {
          const url = driverProfile?.[doc.urlKey];
          const status = docStatusLabel(driverProfile, !!url);
          const busy = uploadingKey === doc.key;

          return (
            <TouchableOpacity
              key={doc.key}
              style={styles.docCard}
              onPress={() => uploadDocument(doc)}
              disabled={!!busy}
            >
              {url ? (
                <Image source={{ uri: url }} style={styles.docThumb} />
              ) : (
                <View style={styles.docIcon}>
                  <Ionicons name={doc.icon} size={24} color="#0EA5E9" />
                </View>
              )}
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={[styles.docStatus, { color: status.color }]}>{status.text}</Text>
                <Text style={styles.docHint}>Appuyer pour {url ? 'remplacer' : 'téléverser'}</Text>
              </View>
              {busy ? (
                <ActivityIndicator color="#0EA5E9" />
              ) : (
                <Ionicons name="cloud-upload-outline" size={22} color="#0EA5E9" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111C44' },
  saveText: { color: '#0EA5E9', fontWeight: 'bold', fontSize: 16 },
  content: { padding: 16, paddingBottom: 32 },
  banner: { borderRadius: 14, padding: 14, marginBottom: 8 },
  bannerOk: { backgroundColor: '#DCFCE7' },
  bannerWait: { backgroundColor: '#FEF3C7' },
  bannerErr: { backgroundColor: '#FEE2E2' },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: '#111C44' },
  bannerSub: { fontSize: 13, color: '#475569', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111C44', marginTop: 20, marginBottom: 12 },
  typesContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  typeCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeCardActive: { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' },
  typeLabel: { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#64748B' },
  typeLabelActive: { color: 'white' },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    color: '#111C44',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docThumb: { width: 56, height: 56, borderRadius: 10, marginRight: 12 },
  docIcon: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  docStatus: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  docHint: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
});

export default VehicleScreen;
