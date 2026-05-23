import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../theme';
import CartBadge from './CartBadge';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/types';

interface Props {
  title: string;
  showBack?: boolean;
  showCart?: boolean;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
}

export default function CustomHeader({
  title,
  showBack = true,
  showCart = false,
  rightComponent,
  transparent = false,
}: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { cartCount } = useCart();

  return (
    <>
      <StatusBar barStyle={transparent ? 'light-content' : 'dark-content'} backgroundColor={transparent ? 'transparent' : COLORS.background} />
      <View style={[styles.container, transparent && styles.transparent]}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={transparent ? '#FFF' : COLORS.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, transparent && styles.transparentTitle]} numberOfLines={1}>{title}</Text>
        </View>
        {(showCart || rightComponent) && (
          <View style={styles.right}>
            {showCart && (
              <CartBadge
                count={cartCount}
                light={transparent}
                onPress={() => navigation.navigate('Cart')}
              />
            )}
            {rightComponent}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingTop: 50,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  transparentTitle: {
    color: '#FFF',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
