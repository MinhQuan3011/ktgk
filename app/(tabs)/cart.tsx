import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useCartStore } from "./store";
export default function Cart() {
  const cartItems = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const router = useRouter();
  // Tính toán
  const itemTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const discount = itemTotal * 0.1; // 10%
  const tax = itemTotal * 0.05; // 5%
  const delivery = 10000;
  const grandTotal = itemTotal - discount + tax + delivery;

  const handleRemove = (id: string) => {
    Alert.alert(
      "Xóa món",
      "Bạn có chắc muốn xóa món này khỏi giỏ hàng không?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => removeItem(id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: typeof cartItems[0] }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => decreaseQuantity(item.id)}
            style={styles.qtyBtn}
          >
            <Ionicons name="remove-circle-outline" size={24} color="crimson" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => increaseQuantity(item.id)}
            style={styles.qtyBtn}
          >
            <Ionicons name="add-circle-outline" size={24} color="crimson" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleRemove(item.id)}
        style={styles.removeBtn}
      >
        <Ionicons name="trash-outline" size={24} color="crimson" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
     <View style={styles.header}>
  <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color="crimson" />
  </TouchableOpacity>
  <Text style={styles.title}>Giỏ hàng của bạn</Text>
</View>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 220 }}
          />
          <View style={styles.billContainer}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Total</Text>
              <Text style={styles.billValue}>{itemTotal.toLocaleString()} đ</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Offer Discount</Text>
              <Text style={styles.billValue}>-{discount.toLocaleString()} đ</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Taxes (5%)</Text>
              <Text style={styles.billValue}>+{tax.toLocaleString()} đ</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Charges</Text>
              <Text style={styles.billValue}>+{delivery.toLocaleString()} đ</Text>
            </View>

            <View style={styles.billRowTotal}>
              <Text style={styles.billLabelTotal}>Grand Total</Text>
              <Text style={styles.billValueTotal}>{grandTotal.toLocaleString()} đ</Text>
            </View>

            <TouchableOpacity
  style={styles.checkoutBtn}
  onPress={() => router.push("/checkout")}
>
  <Text style={styles.checkoutText}>Thanh toán</Text>
</TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "crimson",
    marginBottom: 15,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    elevation: 3,
    marginBottom: 15,
    padding: 10,
    alignItems: "center",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  price: {
    marginTop: 5,
    color: "crimson",
    fontSize: 14,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  qtyBtn: {
    paddingHorizontal: 5,
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  removeBtn: {
    paddingLeft: 10,
  },
  billContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 15,
    color: "#555",
  },
  billValue: {
    fontSize: 15,
    color: "#555",
  },
  billRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 10,
  },
  billLabelTotal: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#000",
  },
  billValueTotal: {
    fontSize: 17,
    fontWeight: "bold",
    color: "crimson",
  },
  checkoutBtn: {
    backgroundColor: "crimson",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 15,
},
backButton: {
  marginRight: 10,
},

});
