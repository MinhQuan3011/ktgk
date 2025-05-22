import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import { auth } from "../../firebaseConfig";
import { useCartStore } from "./store";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Please enter email and password");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Gọi fetchCartFromFirestore để tải giỏ hàng đúng người dùng
      await useCartStore.getState().fetchCartFromFirestore();

      Alert.alert("Đăng nhập thành công");
      router.replace("/"); // Chuyển về trang chính sau đăng nhập
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Login failed", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Restaurant App</Text>

      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Enter your password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.signIn]} onPress={handleLogin}>
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.signUp]}
        onPress={() => router.push("/Signup")}
      >
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "crimson",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16,
    marginBottom: 20,
    paddingVertical: 8,
    color: "#000",
  },
  forgot: {
    color: "#b58c00",
    textAlign: "right",
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },
  signIn: {
    backgroundColor: "#eee",
  },
  signInText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUp: {
    backgroundColor: "#3f51b5",
  },
  signUpText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
