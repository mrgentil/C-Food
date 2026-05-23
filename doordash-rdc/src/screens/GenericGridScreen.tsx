import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'GenericGrid'>;

const { width } = Dimensions.get('window');
const numColumns = 3;
const gap = SPACING.sm;
const itemWidth = (width - SPACING.md * 2 - gap * (numColumns - 1)) / numColumns;

export default function GenericGridScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { title, type, data } = route.params;

  const handleItemPress = (item: any) => {
    let filter: any = {};
    if (type === 'shop_type') {
      filter = { category: item.name };
    } else if (type === 'brand') {
      filter = { brand: item.name };
    } else if (type === 'category') {
      // Pour les cuisines, on utilise CategoryDetail (qui existe déjà) ou on passe par StoreList
      navigation.navigate('CategoryDetail', { category: item.name });
      return;
    }
    navigation.navigate('StoreList', { title: item.name, filter });
  };

  const renderItem = ({ item }: { item: any }) => {
    if (type === 'brand') {
      return (
        <TouchableOpacity style={styles.brandCard} onPress={() => handleItemPress(item)}>
          <View style={styles.brandCircle}>
            <Image
              source={{ uri: item.logo || item.image || 'https://via.placeholder.com/100' }}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName} numberOfLines={2}>{item.name}</Text>
        </TouchableOpacity>
      );
    }

    // Default for shop_type or category
    return (
      <TouchableOpacity style={styles.gridItem} onPress={() => handleItemPress(item)}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/200' }}
          style={styles.itemImage}
        />
        <View style={styles.itemOverlay} />
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => (item.id || item.name).toString()}
        renderItem={renderItem}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
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
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerRight: {
    width: 32,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap,
    marginBottom: gap,
  },
  gridItem: {
    width: itemWidth,
    height: itemWidth * 1.2,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.backgroundSecondary,
  },
  itemImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  itemOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  itemName: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  brandCard: {
    width: itemWidth,
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
  },
  brandCircle: {
    width: itemWidth - 20,
    height: itemWidth - 20,
    borderRadius: (itemWidth - 20) / 2,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  brandLogo: {
    width: '80%',
    height: '80%',
  },
  brandName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
});
