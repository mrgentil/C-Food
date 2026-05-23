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

const OCCASIONS = [
  'Tous',
  'Anniversaire',
  'Mariage',
  'Romantique',
  'Deuil',
  'Congratulations',
];

const FLOWER_COLORS = {
  primary: '#E91E63',
  light: '#FCE4EC',
  medium: '#F8BBD0',
  accent: '#AD1457',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FlowersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { cartCount, cartTotal } = useCart();
  const [activeOccasion, setActiveOccasion] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { loading, error, restaurants } = useStoreRestaurants('flowers');

  const filteredStores = useMemo(() => {
    return restaurants.filter(store => {
      if (activeOccasion !== 'Tous' && !(store.categories || []).includes(activeOccasion)) {
        return false;
      }
      if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [restaurants, activeOccasion, searchQuery]);

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
          <View style={styles.flowerIcon}>
            <Ionicons name="flower" size={24} color={FLOWER_COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Fleurs</Text>
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
            placeholder="Rechercher un fleuriste…"
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
        style={styles.occasions}
        contentContainerStyle={styles.occasionsContent}
      >
        {OCCASIONS.map((occasion) => (
          <TouchableOpacity
            key={occasion}
            style={[
              styles.occasionChip,
              activeOccasion === occasion && styles.occasionChipActive,
            ]}
            onPress={() => setActiveOccasion(occasion)}
          >
            <Ionicons
              name={
                occasion === 'Anniversaire'
                  ? 'gift-outline'
                  : occasion === 'Mariage'
                  ? 'heart-outline'
                  : occasion === 'Romantique'
                  ? 'heart'
                  : occasion === 'Deuil'
                  ? 'sad-outline'
                  : occasion === 'Congratulations'
                  ? 'star-outline'
                  : 'leaf-outline'
              }
              size={14}
              color={activeOccasion === occasion ? '#FFF' : FLOWER_COLORS.primary}
              style={styles.occasionIcon}
            />
            <Text
              style={[
                styles.occasionText,
                activeOccasion === occasion && styles.occasionTextActive,
              ]}
            >
              {occasion}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.deliveryBadge}>
        <Ionicons name="time-outline" size={16} color={FLOWER_COLORS.primary} />
        <Text style={styles.deliveryBadgeText}>Livraison en 45-60 min</Text>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptySubtitle}>Chargement...</Text>
        </View>
      ) : filteredStores.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="flower-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Aucune fleuriste trouvée</Text>
          <Text style={styles.emptySubtitle}>
            {error || 'Essayez de modifier vos filtres ou votre recherche'}
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setActiveOccasion('Tous');
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
            {filteredStores.length} fleuriste{filteredStores.length > 1 ? 's' : ''} disponible{filteredStores.length > 1 ? 's' : ''}
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
            <Ionicons name="sparkles" size={18} color={FLOWER_COLORS.primary} />
            <Text style={styles.infoText}>
              Bouquets frais livrés avec soin. Message personnalisé disponible.
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
  flowerIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: FLOWER_COLORS.light,
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
  occasions: {
    marginTop: SPACING.sm,
    maxHeight: 48,
  },
  occasionsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  occasionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 0,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: FLOWER_COLORS.light,
    marginRight: SPACING.sm,
  },
  occasionChipActive: {
    backgroundColor: FLOWER_COLORS.primary,
  },
  occasionIcon: {
    marginRight: 2,
  },
  occasionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: FLOWER_COLORS.primary,
    lineHeight: 18,
  },
  occasionTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: FLOWER_COLORS.light,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
  },
  deliveryBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: FLOWER_COLORS.primary,
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
    backgroundColor: FLOWER_COLORS.primary,
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
    backgroundColor: FLOWER_COLORS.light,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: FLOWER_COLORS.accent,
    fontWeight: '500',
  },
});
