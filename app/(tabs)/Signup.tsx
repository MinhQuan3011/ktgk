import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

const handleRegister = async () => {
  if (!email || !password || !confirm) {
    return Alert.alert("Please fill all fields");
  }

  if (password !== confirm) {
    return Alert.alert("Passwords do not match");
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    //  Lưu vai trò và email vào Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      role: "user", //  Hoặc "admin" nếu bạn muốn chỉ định tài khoản là admin
    });

    Alert.alert("Đăng kí thành công");
    router.push("/Login");
  } catch (error: any) {
    Alert.alert("Registration failed", error.message);
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

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          style={styles.input}
          autoComplete="password"
          textContentType="password"
        />
      </View>

      <TouchableOpacity style={[styles.button, styles.signUp]} onPress={handleRegister}>
        <Text style={styles.signUpText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/Login")}>
        <Text style={styles.loginLink}>Already have an account? Sign In</Text>
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
  signUp: {
    backgroundColor: "#3f51b5",
  },
  signUpText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    textAlign: "center",
    color: "#3f51b5",
    fontWeight: "600",
    marginTop: 10,
  },
});
