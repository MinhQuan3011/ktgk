import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PaymentSuccess() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán thành công!</Text>
      <Text style={styles.message}>Cảm ơn bạn đã mua hàng.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/")} // Quay về trang chủ
      >
        <Text style={styles.buttonText}>Về Trang Chủ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "green",
    marginBottom: 15,
  },
  message: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "crimson",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
