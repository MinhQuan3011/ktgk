import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import CartIconWithBadge from "./cartIconWithBadge";

export default function UserProfile() {
  const user = auth.currentUser;
  const userId = user?.uid;

  const [avatar, setAvatar] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.avatar) setAvatar(data.avatar);
          if (data.role) setRole(data.role);
        }
      } catch (error) {
        console.log("Lỗi lấy thông tin người dùng:", error);
        Alert.alert("Lỗi", "Không thể lấy thông tin người dùng.");
      }
    };
    fetchUserData();
  }, [userId]);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Cần quyền truy cập thư viện ảnh để chọn avatar");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      try {
        setLoading(true);

        const uri = result.assets[0].uri;
        const formData = new FormData();

        formData.append("file", {
          uri,
          type: "image/jpeg",
          name: "avatar.jpg",
        } as any);

        formData.append("upload_preset", "upload-gp2hjdke");
        formData.append("cloud_name", "dub6szgve");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dub6szgve/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const cloudinaryData = await response.json();
        if (cloudinaryData.secure_url) {
          const downloadURL = cloudinaryData.secure_url;
          setAvatar(downloadURL);

          const userDocRef = doc(db, "users", userId!);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            await updateDoc(userDocRef, { avatar: downloadURL });
          } else {
            await setDoc(userDocRef, { avatar: downloadURL });
          }
        } else {
          throw new Error("Không thể lấy URL ảnh từ Cloudinary.");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log("Chi tiết lỗi:", error);
          Alert.alert("Lỗi tải ảnh lên", error.message);
        } else {
          console.log("Chi tiết lỗi:", error);
          Alert.alert("Lỗi tải ảnh lên", String(error));
        }
      } finally {
        setLoading(false);
      }
    }
  };

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
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Đăng xuất thất bại", error.message);
      } else {
        Alert.alert("Đăng xuất thất bại", String(error));
      }
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

      {/* Avatar */}
      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={pickImage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="large" color="crimson" />
        ) : avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle" size={100} color="gray" />
        )}
      </TouchableOpacity>

      <Text style={styles.changeAvatarText}>
        Nhấn để thay đổi ảnh đại diện
      </Text>

      {/* Thông tin email và vai trò */}
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        {role === "admin" && (
          <Text style={{ color: "crimson", fontWeight: "bold", fontSize: 16 }}>
            Admin
          </Text>
        )}
        <Text style={{ fontSize: 16, color: "#333" }}>{user.email}</Text>
      </View>

      {/* Icon chức năng */}
      <View style={styles.iconRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/lichsumua")}
        >
          <Ionicons name="time-outline" size={40} color="crimson" />
          <Text style={styles.iconText}>Lịch sử mua hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/userReviews")}
        >
          <Ionicons name="star-outline" size={40} color="crimson" />
          <Text style={styles.iconText}>Đánh giá của tôi</Text>
        </TouchableOpacity>
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
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
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
  avatarWrapper: {
    borderRadius: 100,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "crimson",
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
  },
  changeAvatarText: {
    color: "gray",
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  iconButton: {
    alignItems: "center",
    flex: 1,
  },
  iconText: {
    marginTop: 8,
    fontSize: 16,
    color: "crimson",
    fontWeight: "600",
  },
});
