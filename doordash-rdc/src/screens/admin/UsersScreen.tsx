import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../theme';
import { adminService } from '../../services/adminService';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AdminUsersScreen() {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.users({ page: 1 });
      setUsers(Array.isArray(data.data.data) ? data.data.data : []);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Utilisateurs (Admin)</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.muted}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => String(u.id)}
          contentContainerStyle={users.length === 0 ? styles.empty : styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name ?? 'N/A'}</Text>
              <Text style={styles.line}>{item.email ?? ''}</Text>
              <Text style={styles.line}>{item.phone ? `Tél: ${item.phone}` : 'Tél: N/A'}</Text>
              <View style={styles.roles}>
                {!!item.is_admin && <Text style={styles.role}>ADMIN</Text>}
                {!!item.is_restaurant && <Text style={styles.role}>RESTAURANT</Text>}
                {!!item.is_driver && <Text style={styles.role}>DRIVER</Text>}
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.muted}>Aucun utilisateur.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  title: { flex: 1, textAlign: 'center', fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  muted: { color: COLORS.textLight },
  list: { padding: SPACING.md, gap: SPACING.md },
  empty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  name: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  line: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  roles: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm },
  role: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '900',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
});

