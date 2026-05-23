import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';

type FilterState = {
  price: string[];
  distance: string;
  deliveryTime: string;
  rating: string;
  dietary: string[];
  features: string[];
};

const AdvancedFilterScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [filters, setFilters] = useState<FilterState>({
    price: [],
    distance: 'All',
    deliveryTime: 'Any',
    rating: '',
    dietary: [],
    features: [],
  });

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[key] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const setSingleFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? (key === 'distance' ? 'All' : key === 'deliveryTime' ? 'Any' : '') : value,
    }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.price.length > 0) count++;
    if (filters.distance !== 'All') count++;
    if (filters.deliveryTime !== 'Any') count++;
    if (filters.rating !== '') count++;
    if (filters.dietary.length > 0) count++;
    if (filters.features.length > 0) count++;
    return count;
  };

  const handleApply = () => {
    navigation.navigate('Search', { filters });
  };

  const handleClear = () => {
    setFilters({
      price: [],
      distance: 'All',
      deliveryTime: 'Any',
      rating: '',
      dietary: [],
      features: [],
    });
  };

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtres</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearButton}>Effacer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FilterSection title="Prix">
          <View style={styles.chipRow}>
            {['Free', '$', '$$', '$$$'].map(price => (
              <FilterChip
                key={price}
                label={price}
                active={filters.price.includes(price)}
                onPress={() => toggleArrayFilter('price', price)}
              />
            ))}
          </View>
        </FilterSection>

        <FilterSection title="Distance">
          <View style={styles.chipRow}>
            {['< 1km', '< 3km', '< 5km', 'All'].map(distance => (
              <FilterChip
                key={distance}
                label={distance}
                active={filters.distance === distance}
                onPress={() => setSingleFilter('distance', distance)}
              />
            ))}
          </View>
        </FilterSection>

        <FilterSection title="Temps de livraison">
          <View style={styles.chipRow}>
            {['< 15min', '< 30min', '< 45min', 'Any'].map(time => (
              <FilterChip
                key={time}
                label={time}
                active={filters.deliveryTime === time}
                onPress={() => setSingleFilter('deliveryTime', time)}
              />
            ))}
          </View>
        </FilterSection>

        <FilterSection title="Note minimum">
          <View style={styles.chipRow}>
            {['3+', '4+', '4.5+'].map(rating => (
              <FilterChip
                key={rating}
                label={rating}
                active={filters.rating === rating}
                onPress={() => setSingleFilter('rating', rating)}
              />
            ))}
          </View>
        </FilterSection>

        <FilterSection title="Dietary">
          <View style={styles.chipRow}>
            {['Végétarien', 'Halal', 'Sans gluten', 'Sans lactose', 'Vegan'].map(diet => (
              <FilterChip
                key={diet}
                label={diet}
                active={filters.dietary.includes(diet)}
                onPress={() => toggleArrayFilter('dietary', diet)}
              />
            ))}
          </View>
        </FilterSection>

        <FilterSection title="Features">
          <View style={styles.chipRow}>
            {['Livraison gratuite', 'Nouveautés', 'Promos'].map(feature => (
              <FilterChip
                key={feature}
                label={feature}
                active={filters.features.includes(feature)}
                onPress={() => toggleArrayFilter('features', feature)}
              />
            ))}
          </View>
        </FilterSection>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>
            Appliquer les filtres {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  clearButton: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  chipTextActive: {
    color: COLORS.background,
    fontWeight: '500',
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});

export default AdvancedFilterScreen;
