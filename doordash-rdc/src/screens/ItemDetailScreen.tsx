import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../theme';
import { useCart } from '../context/CartContext';
import { MenuItemOption } from '../types';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'ItemDetail'>;

interface OptionGroup {
  id: string;
  name: string;
  required: boolean;
  options: { id: string; name: string; price: number }[];
}

const MOCK_OPTION_GROUPS: OptionGroup[] = [
  {
    id: 'size',
    name: 'Taille',
    required: true,
    options: [
      { id: 's1', name: 'Normal', price: 0 },
      { id: 's2', name: 'Grand', price: 2000 },
      { id: 's3', name: 'Family', price: 5000 },
    ],
  },
  {
    id: 'extras',
    name: 'Extras',
    required: false,
    options: [
      { id: 'e1', name: 'Fromage extra', price: 1500 },
      { id: 'e2', name: 'Sauce speciale', price: 500 },
      { id: 'e3', name: 'Boisson', price: 1000 },
      { id: 'e4', name: 'Frites supplementaires', price: 2000 },
    ],
  },
];

export default function ItemDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { item } = route.params;
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, MenuItemOption | null>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ size: true, extras: true });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const selectOption = (groupId: string, option: MenuItemOption) => {
    const group = MOCK_OPTION_GROUPS.find(g => g.id === groupId);
    if (!group) return;

    setSelectedOptions(prev => {
      if (group.required) {
        return { ...prev, [groupId]: prev[groupId]?.id === option.id ? null : option };
      }
      return { ...prev, [groupId]: prev[groupId]?.id === option.id ? null : option };
    });
  };

  const extrasTotal = Object.values(selectedOptions).reduce((sum, opt) => {
    return sum + (opt ? opt.price : 0);
  }, 0);

  const itemTotal = (item.price + extrasTotal) * quantity;

  const handleAddToCart = () => {
    const requiredGroups = MOCK_OPTION_GROUPS.filter(g => g.required);
    for (const group of requiredGroups) {
      if (!selectedOptions[group.id]) {
        Alert.alert(
          'Option requise',
          `Veuillez selectionner une option pour "${group.name}"`,
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const allSelected: MenuItemOption[] = Object.values(selectedOptions).filter(
      (opt): opt is MenuItemOption => opt !== null
    );

    const note = instructions.trim();
    addToCart(item, quantity, allSelected, note || undefined);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="restaurant" size={64} color={COLORS.textLight} />
            </View>
          )}
          <View style={styles.heroOverlay} />

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Popular Badge */}
          {item.isPopular && (
            <View style={styles.popularBadge}>
              <Ionicons name="star" size={12} color="#FFF" />
              <Text style={styles.popularText}>Populaire</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title and Description */}
          <View style={styles.headerSection}>
            <View style={styles.titleRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.isVeg && (
                <View style={[styles.dietBadge, styles.vegBadge]}>
                  <Ionicons name="leaf" size={12} color="#FFF" />
                </View>
              )}
              {item.isSpicy && (
                <View style={[styles.dietBadge, styles.spicyBadge]}>
                  <Ionicons name="flame" size={12} color="#FFF" />
                </View>
              )}
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.price}>{item.price.toLocaleString()} FC</Text>
          </View>

          {/* Customization Options */}
          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>Personnalisation</Text>

            {MOCK_OPTION_GROUPS.map(group => (
              <View key={group.id} style={styles.optionGroup}>
                <TouchableOpacity
                  style={styles.optionGroupHeader}
                  onPress={() => toggleGroup(group.id)}
                >
                  <View style={styles.optionGroupTitle}>
                    <Text style={styles.optionGroupName}>{group.name}</Text>
                    {group.required && (
                      <Text style={styles.requiredText}>Requis</Text>
                    )}
                  </View>
                  <Ionicons
                    name={expandedGroups[group.id] ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>

                {expandedGroups[group.id] && (
                  <View style={styles.optionsList}>
                    {group.options.map(option => {
                      const isSelected = selectedOptions[group.id]?.id === option.id;
                      return (
                        <TouchableOpacity
                          key={option.id}
                          style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                          onPress={() => selectOption(group.id, option)}
                        >
                          <View style={styles.optionRadio}>
                            <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                              {isSelected && <View style={styles.radioInner} />}
                            </View>
                            <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                              {option.name}
                            </Text>
                          </View>
                          {option.price > 0 && (
                            <Text style={[styles.optionPrice, isSelected && styles.optionPriceSelected]}>
                              +{option.price.toLocaleString()} FC
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Special Instructions */}
          <View style={styles.instructionsSection}>
            <Text style={styles.sectionTitle}>Instructions speciales</Text>
            <TextInput
              style={styles.instructionsInput}
              placeholder="Allergies, preferences..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
              value={instructions}
              onChangeText={setInstructions}
              textAlignVertical="top"
            />
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantite</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.textLight : COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.min(20, quantity + 1))}
              >
                <Ionicons name="add" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart} activeOpacity={0.85}>
            <View style={styles.addButtonContent}>
              <Text style={styles.addButtonText}>Ajouter au panier</Text>
              <Text style={styles.addButtonPrice}>{itemTotal.toLocaleString()} FC</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  popularBadge: {
    position: 'absolute',
    top: 50,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
    zIndex: 10,
  },
  popularText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  headerSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemName: {
    flex: 1,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  dietBadge: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  vegBadge: {
    backgroundColor: COLORS.success,
  },
  spicyBadge: {
    backgroundColor: COLORS.error,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  price: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionsSection: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  optionGroup: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  optionGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  optionGroupTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  optionGroupName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  requiredText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  optionsList: {
    paddingBottom: SPACING.sm,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primary + '08',
  },
  optionRadio: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
  },
  optionName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  optionNameSelected: {
    color: COLORS.text,
    fontWeight: '500',
  },
  optionPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  optionPriceSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  instructionsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  instructionsInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 80,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quantityLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.md,
  },
  addButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  addButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#FFF',
  },
  addButtonPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#FFF',
  },
});
