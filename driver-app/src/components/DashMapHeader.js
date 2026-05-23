import { View, StyleSheet, Text, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { DRIVER_COLORS } from "../theme/driverTheme";

const KINSHASA_REGION = {
  latitude: -4.3217,
  longitude: 15.312,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export default function DashMapHeader({ driverLocation, orders = [], isOnline, driverProfile }) {
  const markers = orders
    .filter((o) => o.restaurantLatitude != null && o.restaurantLongitude != null)
    .slice(0, 8);

  const region = driverLocation
    ? {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }
    : KINSHASA_REGION;

  return (
    <View style={styles.wrap}>
      <MapView style={styles.map} region={region} showsUserLocation={false} showsMyLocationButton={false}>
        {driverLocation && (
          <Marker coordinate={driverLocation} title="Vous" anchor={{ x: 0.5, y: 0.5 }} zIndex={999}>
            {driverProfile?.photoURL ? (
              <Image source={{ uri: driverProfile.photoURL }} style={styles.driverPhoto} />
            ) : (
              <View style={styles.driverDot}>
                <Ionicons name="person" size={16} color="#FFF" />
              </View>
            )}
          </Marker>
        )}
        {isOnline && markers.map((o) => (
          <Marker
            key={String(o.id)}
            coordinate={{
              latitude: Number(o.restaurantLatitude),
              longitude: Number(o.restaurantLongitude),
            }}
            title={o.restaurantName}
            pinColor={o.driverId ? DRIVER_COLORS.primary : "#F59E0B"}
          />
        ))}
      </MapView>

      {!isOnline && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="moon" size={40} color="#94A3B8" />
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', marginTop: 12 }}>HORS LIGNE</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 14, marginTop: 4 }}>Vous ne recevez pas de commandes</Text>
          </View>
        </View>
      )}
      <View style={styles.overlay}>
        <View style={[styles.statusPill, isOnline ? styles.online : styles.offline]}>
          <View style={[styles.dot, isOnline ? styles.dotOn : styles.dotOff]} />
          <Text style={styles.statusLabel}>{isOnline ? "En ligne" : "Hors ligne"}</Text>
        </View>
        {markers.length > 0 ? (
          <View style={styles.countPill}>
            <Ionicons name="restaurant" size={14} color="#fff" />
            <Text style={styles.countText}>{markers.length} sur la carte</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 200, marginHorizontal: 16, marginBottom: 8, borderRadius: 16, overflow: "hidden" },
  map: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  online: { backgroundColor: "rgba(22, 163, 74, 0.92)" },
  offline: { backgroundColor: "rgba(127, 29, 29, 0.88)" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  dotOn: { backgroundColor: "#BBF7D0" },
  dotOff: { backgroundColor: "#FECACA" },
  statusLabel: { color: "#fff", fontSize: 12, fontWeight: "700" },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17, 28, 68, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  countText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  driverPhoto: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#0EA5E9' },
  driverDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0EA5E9', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
});
