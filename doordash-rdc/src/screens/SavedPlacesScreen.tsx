import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { addressService } from '../services/addressService';
import type { ApiAddress } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SavedAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  city: string;
  neighborhood: string;
  instructions?: string;
  isDefault: boolean;
}

const LABEL_ICONS: Record<SavedAddress['label'], string> = {
  Home: 'home',
  Work: 'briefcase',
  Other: 'location',
};

const LABEL_COLORS: Record<SavedAddress['label'], string> = {
  Home: COLORS.info,
  Work: COLORS.warning,
  Other: COLORS.textSecondary,
};

export default function SavedPlacesScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: 'Home' as SavedAddress['label'],
    street: '',
    city: 'Kinshasa',
    neighborhood: '',
    instructions: '',
  });

  const mapApiAddressToUi = (a: ApiAddress): SavedAddress => ({
    id: String(a.id),
    label: (a.label === 'Work' || a.label === 'Other' || a.label === 'Home' ? a.label : 'Home'),
    street: a.street ?? '',
    city: a.city ?? 'Kinshasa',
    neighborhood: a.neighborhood ?? '',
    instructions: a.instructions ?? undefined,
    isDefault: !!a.is_default,
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await addressService.getAll();
      const rows = res.data;
      setAddresses(Array.isArray(rows) ? rows.map(mapApiAddressToUi) : []);
    } catch (err: any) {
      setAddresses([]);
      setError(err.response?.data?.message || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const handleAddAddress = () => {
    setFormData({
      label: 'Home',
      street: '',
      city: 'Kinshasa',
      neighborhood: '',
      instructions: '',
    });
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleEditAddress = (address: SavedAddress) => {
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      neighborhood: address.neighborhood,
      instructions: address.instructions || '',
    });
    setEditingId(address.id);
    setShowAddForm(true);
  };

  const handleSaveAddress = async () => {
    if (!formData.street || !formData.neighborhood) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (editingId) {
        await addressService.update(editingId, {
          label: formData.label,
          street: formData.street,
          city: formData.city,
          neighborhood: formData.neighborhood,
          instructions: formData.instructions,
        } as any);
      } else {
        await addressService.create({
          label: formData.label,
          street: formData.street,
          city: formData.city,
          neighborhood: formData.neighborhood,
          instructions: formData.instructions || undefined,
          latitude: 0,
          longitude: 0,
          is_default: addresses.length === 0,
        } as any);
      }
      setShowAddForm(false);
      setEditingId(null);
      await fetchAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde');
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Supprimer l\'adresse',
      'Êtes-vous sûr de vouloir supprimer cette adresse ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              setError('');
              await addressService.delete(id);
              await fetchAddresses();
            } catch (err: any) {
              setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression');
              Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la suppression');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleSetDefault = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      await addressService.setDefault(id);
      await fetchAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour');
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const renderAddress = (address: SavedAddress) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={[styles.labelBadge, { backgroundColor: LABEL_COLORS[address.label] + '20' }]}>
          <Ionicons
            name={LABEL_ICONS[address.label] as any}
            size={18}
            color={LABEL_COLORS[address.label]}
          />
          <Text style={[styles.labelText, { color: LABEL_COLORS[address.label] }]}>
            {address.label === 'Home' ? 'Maison' : address.label === 'Work' ? 'Travail' : 'Autre'}
          </Text>
        </View>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>DÉFAUT</Text>
          </View>
        )}
      </View>

      <View style={styles.addressContent}>
        <Text style={styles.addressStreet}>{address.street}</Text>
        <Text style={styles.addressDetails}>
          {address.neighborhood}, {address.city}
        </Text>
        {address.instructions && (
          <Text style={styles.addressInstructions}>
            <Ionicons name="information-circle-outline" size={14} /> {address.instructions}
          </Text>
        )}
      </View>

      <View style={styles.addressActions}>
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(address.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
            <Text style={[styles.actionText, { color: COLORS.success }]}>Définir par défaut</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditAddress(address)}
        >
          <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.actionText, { color: COLORS.primary }]}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteAddress(address.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adresses enregistrées</Text>
        <View style={styles.headerRight} />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false}>
        {!showAddForm ? (
          <>
            {/* Address List */}
            <View style={styles.addressList}>
              {addresses.map(renderAddress)}
            </View>
            {!loading && addresses.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="location-outline" size={64} color={COLORS.textLight} />
                <Text style={styles.emptyTitle}>Aucune adresse</Text>
                <Text style={styles.emptyText}>Ajoutez une adresse pour faciliter vos commandes</Text>
              </View>
            ) : null}

            {/* Add Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
              <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Ajouter une nouvelle adresse</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Add/Edit Form */
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {editingId ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
            </Text>

            {/* Label Selection */}
            <View style={styles.labelSelector}>
              <Text style={styles.inputLabel}>Type d'adresse</Text>
              <View style={styles.labelOptions}>
                {(['Home', 'Work', 'Other'] as const).map(label => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.labelOption,
                      formData.label === label && styles.labelOptionSelected,
                      { borderColor: LABEL_COLORS[label] },
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, label }))}
                  >
                    <Ionicons
                      name={LABEL_ICONS[label] as any}
                      size={20}
                      color={formData.label === label ? '#FFF' : LABEL_COLORS[label]}
                    />
                    <Text
                      style={[
                        styles.labelOptionText,
                        formData.label === label && styles.labelOptionTextSelected,
                      ]}
                    >
                      {label === 'Home' ? 'Maison' : label === 'Work' ? 'Travail' : 'Autre'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Street */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rue/Avenue *</Text>
              <TextInput
                style={styles.input}
                value={formData.street}
                onChangeText={(value) => setFormData(prev => ({ ...prev, street: value }))}
                placeholder="Numéro et nom de rue"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            {/* Neighborhood */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quartier *</Text>
              <TextInput
                style={styles.input}
                value={formData.neighborhood}
                onChangeText={(value) => setFormData(prev => ({ ...prev, neighborhood: value }))}
                placeholder="Nom du quartier"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ville</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => setFormData(prev => ({ ...prev, city: value }))}
                placeholder="Ville"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            {/* Instructions */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Instructions de livraison</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.instructions}
                onChangeText={(value) => setFormData(prev => ({ ...prev, instructions: value }))}
                placeholder="Code d'accès, étage, instructions spéciales..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Form Actions */}
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  addressList: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  addressCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.sm,
  },
  labelText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
  },
  defaultText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#FFF',
  },
  addressContent: {
    marginBottom: SPACING.md,
  },
  addressStreet: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  addressDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  addressInstructions: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  addressActions: {
    flexDirection: 'row',
    gap: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  form: {
    padding: SPACING.md,
  },
  formTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  labelSelector: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  labelOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  labelOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  labelOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  labelOptionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  labelOptionTextSelected: {
    color: '#FFF',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  empty: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
