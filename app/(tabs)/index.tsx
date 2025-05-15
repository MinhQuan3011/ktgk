import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect } from "react";
import CartIconWithBadge from "./cartIconWithBadge"; // đúng đường dẫn

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebaseConfig";
import { seedMenuData } from "./seedMenuData";

const categories = [
  { title: "Chinese", image: require("@/assets/images/chinese.png") },
  { title: "South Indian", image: require("@/assets/images/south-indian.png") },
  { title: "Beverages", image: require("@/assets/images/beverages.png") },
  { title: "North India", image: require("@/assets/images/north-indian.png") },
  { title: "Roti", image: require("@/assets/images/cross.png") },
  { title: "Rice", image: require("@/assets/images/banana.png") },
];

export default function Home() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/Login");
    } catch (error) {
      const err = error as Error;
      Alert.alert("Đăng xuất thất bại", err.message);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        await seedMenuData();
      } catch (error) {
        console.error("Lỗi khi seed dữ liệu menu:", error);
      }
    };

    initData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Alert.alert("Menu clicked!")}>
          <Ionicons name="menu" size={28} color="crimson" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Restaurant App</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleSignOut} style={styles.iconRight}>
            <MaterialIcons name="logout" size={24} color="crimson" />
          </TouchableOpacity>

         <CartIconWithBadge />

        </View>
      </View>

      {/* Subheading */}
      <Text style={styles.subHeader}>Cuisine</Text>

      {/* Grid of categories */}
      <ScrollView contentContainerStyle={styles.grid}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.card}
            onPress={() =>
              router.push(`/categoryItems?category=${encodeURIComponent(item.title)}`)
            }
          >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.label}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "crimson",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconRight: {
    marginRight: 10, // sử dụng margin thay cho gap
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  card: {
    width: "47%",
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 10,
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});
