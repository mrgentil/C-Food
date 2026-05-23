import { View, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import api from "../../services/api";

const DishInfo = ({ id, quantity }) => {
  const [dish, setDish] = useState(null);

  useEffect(() => {
    getDish();
  }, []);

  const getDish = async () => {
    try {
      // Best-effort: not critical for driver app; endpoint may not exist.
      const res = await api.get(`/menu-items/${id}`);
      setDish(res?.data?.data ?? null);
    } catch {
      setDish(null);
    }
  };
  if (!dish) {
    return <View />;
    }
    
  return (
    <View style={styles.orderDetailsContainer}>
      <Text style={styles.orderItemText}>{dish.name}</Text>
      <Text style={styles.orderItemText}>x {quantity}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  orderDetailsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderItemText: {
    fontSize: 20,
    color: "grey",
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
});

export default DishInfo;
