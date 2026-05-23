import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { RestaurantCard, BottomCartBar, CartBadge } from '../components';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/types';
import { useStoreRestaurants } from '../hooks/useStoreRestaurants';

const SUBCATEGORIES = [
  'Tous',
  'Nourriture',
  'Accessoires',
  'Hygiène',
  'Jouets',
  'Vétérinaire',
];

const PET_COLORS = {
  primary: '#FF8C00',
  light: '#FFF3E0',
  medium: '#FFE0B2',
  accent: '#E65100',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PetStoreScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { cartCount, cartTotal } = useCart();
  const [activeSubcategory, setActiveSubcategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { loading, error, restaurants } = useStoreRestaurants('pet');

  const filteredStores = useMemo(() => {
    return restaurants.filter(store => {
      if (activeSubcategory !== 'Tous' && !(store.categories || []).includes(activeSubcategory)) {
        return false;
      }
      if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [restaurants, activeSubcategory, searchQuery]);

  const handleStorePress = (store: any) => {
    navigation.navigate('Restaurant', { restaurant: store });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.petIcon}>
            <Ionicons name="paw" size={24} color={PET_COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Animalerie</Text>
        </View>
        <View style={styles.headerRight}>
          <CartBadge variant="pill" count={cartCount} onPress={() => navigation.navigate('Cart')} />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name="search" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher une animalerie…"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.closeSearch}
            onPress={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
          >
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.subcategories}
        contentContainerStyle={styles.subcategoriesContent}
      >
        {SUBCATEGORIES.map((sub) => (
          <TouchableOpacity
            key={sub}
            style={[
              styles.subcategoryChip,
              activeSubcategory === sub && styles.subcategoryChipActive,
            ]}
            onPress={() => setActiveSubcategory(sub)}
          >
            <Ionicons
              name={
                sub === 'Nourriture'
                  ? 'fast-food-outline'
                  : sub === 'Accessoires'
                  ? 'bag-outline'
                  : sub === 'Hygiène'
                  ? 'water-outline'
                  : sub === 'Jouets'
                  ? 'game-controller-outline'
                  : sub === 'Vétérinaire'
                  ? 'medical-outline'
                  : 'paw-outline'
              }
              size={14}
              color={activeSubcategory === sub ? '#FFF' : PET_COLORS.primary}
              style={styles.subcategoryIcon}
            />
            <Text
              style={[
                styles.subcategoryText,
                activeSubcategory === sub && styles.subcategoryTextActive,
              ]}
            >
              {sub}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.pawsDivider}>
        <Ionicons name="paw" size={12} color={PET_COLORS.medium} />
        <Ionicons name="paw" size={12} color={PET_COLORS.medium} />
        <Ionicons name="paw" size={12} color={PET_COLORS.medium} />
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptySubtitle}>Chargement...</Text>
        </View>
      ) : filteredStores.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="paw-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Aucune animalerie trouvée</Text>
          <Text style={styles.emptySubtitle}>
            {error || 'Essayez de modifier vos filtres ou votre recherche'}
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setActiveSubcategory('Tous');
              setSearchQuery('');
            }}
          >
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={styles.storeCount}>
            {filteredStores.length} animalerie{filteredStores.length > 1 ? 's' : ''} disponible{filteredStores.length > 1 ? 's' : ''}
          </Text>

          <FlatList
            data={filteredStores}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.storesList}
            renderItem={({ item }) => (
              <RestaurantCard
                restaurant={item}
                variant="list"
                onPress={() => handleStorePress(item)}
              />
            )}
          />

          <View style={styles.infoCard}>
            <Ionicons name="heart" size={18} color={PET_COLORS.primary} />
            <Text style={styles.infoText}>
              Tout pour le bien-être de vos animaux. Livraison rapide et sécurisée.
            </Text>
          </View>
        </>
      )}

      <BottomCartBar
        count={cartCount}
        total={cartTotal}
        onPress={() => navigation.navigate('Cart')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorText: { color: COLORS.error, textAlign: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: PET_COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    paddingVertical: 0,
  },
  closeSearch: {
    marginLeft: 'auto',
  },
  subcategories: {
    marginTop: SPACING.sm,
    maxHeight: 48,
  },
  subcategoriesContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  subcategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 0,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: PET_COLORS.light,
    marginRight: SPACING.sm,
  },
  subcategoryChipActive: {
    backgroundColor: PET_COLORS.primary,
  },
  subcategoryIcon: {
    marginRight: 2,
  },
  subcategoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: PET_COLORS.primary,
    lineHeight: 18,
  },
  subcategoryTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  pawsDivider: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  storeCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  storesList: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: PET_COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: PET_COLORS.light,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: PET_COLORS.accent,
    fontWeight: '500',
  },
});
