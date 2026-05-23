import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { MENU_ITEMS, RESTAURANTS } from '../data/mockData';
import type { RootStackParamList } from '../navigation/types';
import type { CartItem } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface GroupParticipant {
  id: string;
  name: string;
  avatar: string;
  items: CartItem[];
}

const SAMPLE_PARTICIPANTS: GroupParticipant[] = [
  {
    id: 'p1',
    name: 'Vous',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    items: [
      { lineId: 'mock-p1-a', menuItem: MENU_ITEMS['r1'][0], quantity: 1, selectedOptions: [] },
      { lineId: 'mock-p1-b', menuItem: MENU_ITEMS['r1'][2], quantity: 2, selectedOptions: [] },
    ],
  },
  {
    id: 'p2',
    name: 'Marie L.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    items: [
      { lineId: 'mock-p2-a', menuItem: MENU_ITEMS['r1'][3], quantity: 1, selectedOptions: [] },
    ],
  },
  {
    id: 'p3',
    name: 'Jean P.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    items: [
      { lineId: 'mock-p3-a', menuItem: MENU_ITEMS['r1'][4], quantity: 1, selectedOptions: [] },
      { lineId: 'mock-p3-b', menuItem: MENU_ITEMS['r1'][0], quantity: 1, selectedOptions: [] },
    ],
  },
];

const GROUP_SHARE_LINK = 'https://c-food.cd/group/grp_abc123';

export default function GroupOrderScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [participants, setParticipants] = useState<GroupParticipant[]>(SAMPLE_PARTICIPANTS);
  const [minItems] = useState(4);

  const restaurant = RESTAURANTS[0];
  const totalItems = participants.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.quantity, 0), 0);
  const totalAmount = participants.reduce(
    (sum, p) => sum + p.items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0),
    0
  );

  const handleShareLink = () => {
    Alert.alert('Lien copié', 'Le lien de commande groupée a été copié dans le presse-papiers');
  };

  const handleCloseOrder = () => {
    Alert.alert(
      'Fermer la commande',
      'Êtes-vous sûr de vouloir fermer cette commande groupée et passer à la caisse ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => navigation.navigate('Checkout', { total: totalAmount }) },
      ]
    );
  };

  const renderParticipant = ({ item }: { item: GroupParticipant }) => {
    const participantTotal = item.items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);
    return (
      <View style={styles.participantCard}>
        <View style={styles.participantHeader}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.participantInfo}>
            <Text style={styles.participantName}>{item.name}</Text>
            <Text style={styles.itemCount}>
              {item.items.reduce((s, i) => s + i.quantity, 0)} article(s)
            </Text>
          </View>
          <Text style={styles.participantTotal}>{participantTotal.toLocaleString()} FC</Text>
        </View>
        {item.items.map((cartItem, idx) => (
          <View key={idx} style={styles.participantItem}>
            <Text style={styles.itemQuantity}>{cartItem.quantity}x</Text>
            <Text style={styles.itemName}>{cartItem.menuItem.name}</Text>
            <Text style={styles.itemPrice}>{(cartItem.menuItem.price * cartItem.quantity).toLocaleString()} FC</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Commande groupée</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={participants}
        keyExtractor={item => item.id}
        renderItem={renderParticipant}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.restaurantBanner}>
              <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
              <View style={styles.restaurantOverlay}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantInfo}>
                  {restaurant.deliveryTime} • {restaurant.deliveryFee} FC livraison
                </Text>
              </View>
            </View>

            <View style={styles.shareSection}>
              <Text style={styles.sectionTitle}>Inviter des amis</Text>
              <View style={styles.shareLinkContainer}>
                <TextInput
                  style={styles.shareLink}
                  value={GROUP_SHARE_LINK}
                  editable={false}
                />
                <TouchableOpacity style={styles.copyButton} onPress={handleShareLink}>
                  <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-social-outline" size={20} color={COLORS.background} />
                <Text style={styles.shareButtonText}>Partager le lien</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{participants.length} participant(s)</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="fast-food-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{totalItems} article(s) au total</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle-outline" size={20} color={totalItems >= minItems ? COLORS.success : COLORS.warning} />
                <Text style={styles.infoText}>
                  {totalItems >= minItems
                    ? `Minimum de ${minItems} articles atteint`
                    : `Minimum ${minItems} articles requis (encore ${minItems - totalItems})`}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Articles par participant</Text>
          </>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total de la commande</Text>
                <Text style={styles.totalAmount}>{totalAmount.toLocaleString()} FC</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalSubtext}>Frais de livraison et taxes en plus</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.checkoutButton, totalItems < minItems && styles.checkoutButtonDisabled]}
              onPress={handleCloseOrder}
              disabled={totalItems < minItems}
            >
              <Text style={styles.checkoutButtonText}>
                Fermer la commande & passer à la caisse
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  restaurantBanner: {
    position: 'relative',
    height: 150,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  restaurantOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  restaurantName: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  restaurantInfo: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  shareSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  shareLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  shareLink: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  copyButton: {
    padding: SPACING.sm,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  shareButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  infoSection: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  participantCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  participantTotal: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  itemQuantity: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    width: 30,
  },
  itemName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  itemPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  footer: {
    padding: SPACING.md,
  },
  totalSection: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    fontWeight: '700',
  },
  totalSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  checkoutButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
