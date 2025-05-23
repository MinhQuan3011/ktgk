import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../firebaseConfig";

import { useCartStore } from "./store"; // import store của bạn

export default function Checkout() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy giỏ hàng trực tiếp từ zustand store
  const cartItems = useCartStore(state => state.items);
  const clearCart = useCartStore(state => state.clearCart);

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin thẻ.");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống.");
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const userId = user ? user.uid : null;

      if (!userId) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập để thanh toán.");
        setLoading(false);
        return;
      }

      // Tính tổng tiền
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const transactionId = uuidv4();

      // Lưu giao dịch thanh toán
      await addDoc(collection(db, "payments"), {
        userId,
        amount: totalAmount,
        status: "success",
        transactionId,
        createdAt: new Date().toISOString(),
        items: cartItems,
        cardNumber,  // có thể mã hóa nếu cần bảo mật hơn
      });

      // Xóa giỏ hàng ở cả local store và Firestore (clearCart của bạn đã xử lý cả 2)
      await clearCart();

      Alert.alert("Thành công", `Thanh toán thành công. Tổng: ${totalAmount} VND`);
      router.replace("/paymentSuccess");
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      Alert.alert("Lỗi", "Không thể xử lý thanh toán.");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán</Text>

      <TextInput
        style={styles.input}
        placeholder="Số thẻ"
        keyboardType="number-pad"
        value={cardNumber}
        onChangeText={setCardNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="Ngày hết hạn (MM/YY)"
        value={expiry}
        onChangeText={setExpiry}
      />

      <TextInput
        style={styles.input}
        placeholder="CVV"
        keyboardType="number-pad"
        secureTextEntry
        value={cvv}
        onChangeText={setCvv}
      />

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: "#aaa" }]}
        onPress={handlePayment}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Đang xử lý..." : "Thanh toán"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "crimson",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "crimson",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
