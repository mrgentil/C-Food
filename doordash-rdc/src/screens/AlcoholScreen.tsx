import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
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
  'Bières',
  'Vins',
  'Spirits',
  'Champagne',
  'Cocktails',
  'Sans alcool',
];

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AlcoholScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { cartCount, cartTotal } = useCart();
  const [activeSubcategory, setActiveSubcategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(true);

  const { loading, error, restaurants } = useStoreRestaurants('alcohol');

  const handleAgeVerification = (isOfAge: boolean) => {
    if (isOfAge) {
      setAgeVerified(true);
      setShowAgeModal(false);
    } else {
      setShowAgeModal(false);
    }
  };

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
      <Modal
        visible={showAgeModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.ageModalOverlay}>
          <View style={styles.ageModal}>
            <View style={styles.ageIconContainer}>
              <Ionicons name="shield-checkmark" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.ageModalTitle}>Vérification de l'âge</Text>
            <Text style={styles.ageModalDescription}>
              Vous devez avoir 18 ans ou plus pour commander de l'alcool. En continuant, vous confirmez respecter cette condition.
            </Text>
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={16} color={COLORS.warning} />
              <Text style={styles.warningText}>
                L'abus d'alcool est dangereux pour la santé. À consommer avec modération.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.ageConfirmButton}
              onPress={() => handleAgeVerification(true)}
            >
              <Text style={styles.ageConfirmButtonText}>J'ai 18 ans ou plus</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ageDenyButton}
              onPress={() => handleAgeVerification(false)}
            >
              <Text style={styles.ageDenyButtonText}>Je suis mineur(e)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!ageVerified ? (
        <View style={styles.blockedState}>
          <Ionicons name="lock-closed" size={64} color={COLORS.textLight} />
          <Text style={styles.blockedTitle}>Accès restreint</Text>
          <Text style={styles.blockedSubtitle}>
            Vous devez vérifier votre âge pour accéder à cette section.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setShowAgeModal(true)}
          >
            <Text style={styles.retryButtonText}>Vérifier mon âge</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alcool</Text>
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
                placeholder="Rechercher un magasin…"
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

          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.emptySubtitle}>Chargement...</Text>
            </View>
          ) : filteredStores.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="wine-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Aucun magasin trouvé</Text>
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
                {filteredStores.length} magasin{filteredStores.length > 1 ? 's' : ''} disponible{filteredStores.length > 1 ? 's' : ''}
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

              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={18} color={COLORS.warning} />
                <Text style={styles.warningBannerText}>
                  Vente interdite aux mineurs. L'abus d'alcool est dangereux pour la santé.
                </Text>
              </View>
            </>
          )}

          <BottomCartBar
            count={cartCount}
            total={cartTotal}
            onPress={() => navigation.navigate('Cart')}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorText: { color: COLORS.error, textAlign: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  ageModalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  ageModal: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  ageIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ageModalTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  ageModalDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warning + '15',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '500',
  },
  ageConfirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    width: '100%',
    marginBottom: SPACING.sm,
  },
  ageConfirmButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  ageDenyButton: {
    paddingVertical: SPACING.md,
    width: '100%',
  },
  ageDenyButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  blockedState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  blockedTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  blockedSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
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
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 0,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SPACING.sm,
  },
  subcategoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  subcategoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  subcategoryTextActive: {
    color: '#FFF',
    fontWeight: '600',
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
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    padding: SPACING.sm,
    backgroundColor: COLORS.warning + '10',
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.sm,
  },
  warningBannerText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '500',
  },
});
