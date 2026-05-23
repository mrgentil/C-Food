import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { favoritesService } from '../services/favoritesService';
import { mapApiRestaurantToUi } from '../utils/mapApiToUi';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SHADOWS = {
  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
};

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try {
      const response = await favoritesService.getFavorites();
      const rows = response.data || [];
      setRestaurants(
        rows
          .map((f) => (f.restaurant ? mapApiRestaurantToUi(f.restaurant) : null))
          .filter((r): r is NonNullable<typeof r> => !!r)
      );
    } catch (err) {
      setRestaurants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchFavorites(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchFavorites(); };

  const toggleFavorite = async (id: string) => {
    try {
      await favoritesService.toggle(id);
      fetchFavorites();
    } catch (err) {}
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.cardMeta}>
          <Ionicons name="star" size={14} color={COLORS.warning} />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.deliveryTime}>{item.delivery_time}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.deliveryFee}>{item.delivery_fee} FC</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.heartButton} onPress={() => toggleFavorite(item.id)}>
        <Ionicons name="heart" size={24} color={COLORS.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favoris</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : restaurants.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptyText}>Appuyez sur le cœur pour sauvegarder vos restaurants préférés</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  headerRight: { width: 40 },
  list: { padding: SPACING.md, gap: SPACING.md },
  card: { borderRadius: BORDER_RADIUS.md, overflow: 'hidden', backgroundColor: COLORS.card, ...SHADOWS },
  cardImage: { width: '100%', height: 160 },
  cardContent: { padding: SPACING.md },
  cardName: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  rating: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  dot: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  deliveryTime: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  deliveryFee: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  heartButton: { position: 'absolute', top: SPACING.md, right: SPACING.md, backgroundColor: '#FFF', borderRadius: 20, padding: 6, ...SHADOWS },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
});
