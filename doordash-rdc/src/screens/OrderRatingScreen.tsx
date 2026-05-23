import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { orderService } from '../services/orderService';
import type { ApiOrder } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OrderRatingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };

  const [loadingOrder, setLoadingOrder] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<ApiOrder | null>(null);

  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');

  const foodTags = ['Délicieux', 'Bien présenté', 'Portion généreuse', 'Froid', 'Pas frais'];
  const deliveryTags = ['Rapide', 'Ponctuel', 'Polite', 'En retard', 'Froid'];

  const hasDriver = !!(order?.driver_id ?? order?.driver);

  const loadOrder = useCallback(async () => {
    setLoadingOrder(true);
    try {
      const res = await orderService.getById(orderId);
      const o = res.data;
      setOrder(o);
      if (o.status !== 'delivered') {
        Alert.alert('Info', 'Seules les commandes livrées peuvent être évaluées.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      if (o.review_exists) {
        Alert.alert('Info', 'Cette commande a déjà été évaluée.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || e.message || 'Chargement impossible', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoadingOrder(false);
    }
  }, [navigation, orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (foodRating < 1) {
      Alert.alert('Note requise', 'Merci de noter la qualité de la commande (établissement).');
      return;
    }
    if (hasDriver && deliveryRating < 1) {
      Alert.alert('Note requise', 'Merci de noter le service de livraison.');
      return;
    }

    const payload: {
      restaurant_rating: number;
      driver_rating?: number;
      feedback?: string;
      tags?: string[];
    } = {
      restaurant_rating: foodRating,
      feedback: feedback.trim() || undefined,
      tags: selectedTags.length ? selectedTags : undefined,
    };
    if (hasDriver) {
      payload.driver_rating = deliveryRating;
    }

    setSubmitting(true);
    try {
      await orderService.rate(orderId, payload);
      Alert.alert('Merci !', 'Votre avis a bien été enregistré.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const status = e.response?.status;
      const msg =
        e.response?.data?.message ||
        (status === 409 ? 'Cette commande a déjà été évaluée.' : null) ||
        e.message ||
        'Envoi impossible';
      Alert.alert('Erreur', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, setRating: (r: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={36}
              color={star <= rating ? COLORS.warning : COLORS.textLight}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loadingOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Évaluer la commande</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.orderId}>Commande #{orderId}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Établissement & repas</Text>
          {renderStars(foodRating, setFoodRating)}
          <View style={styles.tagsContainer}>
            {foodTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {hasDriver ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service de livraison</Text>
            {renderStars(deliveryRating, setDeliveryRating)}
            <View style={styles.tagsContainer}>
              {deliveryTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commentaire (optionnel)</Text>
          <TextInput
            style={styles.feedbackInput}
            placeholder="Dites-nous en plus…"
            placeholderTextColor={COLORS.textLight}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Envoyer l'évaluation</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  orderId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tagSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  tagTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
