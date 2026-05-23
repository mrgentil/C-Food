import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { BottomCartBar } from '../components';
import { FLOWER_ITEMS } from '../data/mockData';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/types';
import type { Store } from '../data/mockData';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'FlowersDetail'>;

const SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 3,
};

const ADD_SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
};

const FLOWER_COLORS = {
  primary: '#E91E63',
  light: '#FCE4EC',
  medium: '#F8BBD0',
  accent: '#AD1457',
};

const OCCASIONS = ['Tous', 'Anniversaire', 'Mariage', 'Romantique', 'Deuil', 'Congratulations'];

export default function FlowersDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { store } = route.params;
  const { addToCart, cartCount, cartTotal } = useCart();
  const [activeCategory, setActiveCategory] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const items = FLOWER_ITEMS[store.id] || [];
  const categories = [...new Set(items.map(item => item.occasion))];
  const filteredItems = activeCategory === 0
    ? items
    : items.filter(item => item.occasion === categories[activeCategory - 1]);

  const allCategories = ['Tous', ...categories];

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      restaurantId: item.storeId,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.occasion,
    });
  };

  const handleAddWithMessage = () => {
    if (selectedItem) {
      addToCart({
        id: selectedItem.id,
        restaurantId: selectedItem.storeId,
        name: selectedItem.name,
        description: `${selectedItem.description}${message ? ` | Message: "${message}"` : ''}`,
        price: selectedItem.price,
        image: selectedItem.image,
        category: selectedItem.occasion,
      });
      setShowMessageModal(false);
      setMessage('');
      setSelectedItem(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroContainer}>
        <Image source={{ uri: store.image }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => Alert.alert('Partager', 'Lien de partage copié!')}
          >
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.deliveryBadge}>
          <Ionicons name="time-outline" size={14} color={FLOWER_COLORS.primary} />
          <Text style={styles.deliveryBadgeText}>{store.deliveryTime}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.storeName}>{store.name}</Text>
        <View style={styles.infoRow}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={16} color={COLORS.warning} />
            <Text style={styles.rating}>{store.rating}</Text>
            <Text style={styles.reviews}>({store.reviewCount})</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.deliveryTime}>{store.deliveryTime}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.distance}>{store.distance}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.deliveryFee}>
            {store.deliveryFee === 0 ? 'Livraison gratuite' : `Livraison: ${store.deliveryFee.toLocaleString()} FC`}
          </Text>
          <View style={styles.minOrderBadge}>
            <Ionicons name="flower" size={14} color={FLOWER_COLORS.primary} />
            <Text style={styles.minOrderText}>Min. {store.minOrder.toLocaleString()} FC</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
      >
        {OCCASIONS.map((cat, index) => (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, activeCategory === index && styles.tabActive]}
            onPress={() => setActiveCategory(index)}
          >
            <Text style={[styles.tabText, activeCategory === index && styles.tabTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.productsList}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flower-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Aucun bouquet dans cette catégorie</Text>
          </View>
        ) : (
          filteredItems.map(item => (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <View style={styles.occasionBadge}>
                    <Text style={styles.occasionBadgeText}>{item.occasion}</Text>
                  </View>
                </View>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={styles.productPrice}>{item.price.toLocaleString()} FC</Text>
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={() => {
                    setSelectedItem(item);
                    setShowMessageModal(true);
                  }}
                >
                  <Ionicons name="card-outline" size={14} color={FLOWER_COLORS.primary} />
                  <Text style={styles.messageButtonText}>Ajouter un message</Text>
                </TouchableOpacity>
              </View>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.productImage} />
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToCart(item)}
              >
                <Ionicons name="add" size={24} color={FLOWER_COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showMessageModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Message personnalisé</Text>
              <TouchableOpacity onPress={() => setShowMessageModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Ajoutez un message pour accompagner votre bouquet
            </Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Votre message..."
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{message.length}/200</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAddWithMessage}
            >
              <Text style={styles.modalButtonText}>Ajouter au panier</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  heroContainer: {
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
  },
  deliveryBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: FLOWER_COLORS.primary,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS,
  },
  storeName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 2,
    marginRight: 2,
  },
  reviews: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  infoDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryTime: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  distance: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryFee: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  minOrderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FLOWER_COLORS.light,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  minOrderText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: FLOWER_COLORS.primary,
  },
  tabs: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabsContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: FLOWER_COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: FLOWER_COLORS.primary,
    fontWeight: '600',
  },
  productsList: {
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  productInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  productName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  occasionBadge: {
    backgroundColor: FLOWER_COLORS.light,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  occasionBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: FLOWER_COLORS.primary,
  },
  productDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: FLOWER_COLORS.primary,
    marginBottom: SPACING.xs,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  messageButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: FLOWER_COLORS.primary,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
  },
  addButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.round,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...ADD_SHADOWS,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  messageInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  modalButton: {
    backgroundColor: FLOWER_COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});
