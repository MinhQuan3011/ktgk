import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../firebaseConfig";
import CartIconWithBadge from "./cartIconWithBadge";

export default function UserProfile() {
  const user = auth.currentUser;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Chưa đăng nhập</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace("/Login");
    } catch (error) {
      Alert.alert("Đăng xuất thất bại", (error as Error).message);
    }
  };

  const handleGoBack = () => {
    router.push("/");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={28} color="crimson" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleLogout} style={styles.iconRight}>
            <MaterialIcons name="logout" size={24} color="crimson" />
          </TouchableOpacity>
          <CartIconWithBadge />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
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
    marginRight: 10,
  },
  text: {
    fontSize: 15,
    color: "#444",
  },
});
