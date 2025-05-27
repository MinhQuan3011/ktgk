import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { useCartStore } from "./(tabs)/store";

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

    // Lấy role từ Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    if (userData?.role === "admin") {
      // Điều hướng đến giao diện admin nếu là admin
      router.replace("/");
    } else {
      await useCartStore.getState().fetchCartFromFirestore();
      router.replace("/"); // Trang chính
    }

    Alert.alert("Đăng nhập thành công");
  } catch (error: any) {
    console.error("Login error:", error);
    Alert.alert("Đăng nhập thất bại", error.message);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Restaurant App</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          autoComplete="password"
          textContentType="password"
        />
      </View>

      <TouchableOpacity onPress={() => router.push("/forgotPassword")} style={styles.forgotContainer}>
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
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "crimson",
    letterSpacing: 1.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    color: "#333",
  },
  forgotContainer: {
    marginBottom: 30,
    alignItems: "flex-end",
  },
  forgot: {
    color: "#3f51b5",
    fontWeight: "600",
  },
  button: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#3f51b5",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  signIn: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#3f51b5",
  },
  signInText: {
    color: "#3f51b5",
    fontSize: 18,
    fontWeight: "bold",
  },
  signUp: {
    backgroundColor: "#3f51b5",
  },
  signUpText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
