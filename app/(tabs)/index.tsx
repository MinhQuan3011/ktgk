import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import CartIconWithBadge from "./cartIconWithBadge";

// Define types
type MenuItem = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
};

type Category = {
  title: string;
  image: any;
};

const categories: Category[] = [
  { title: "Chinese", image: require("@/assets/images/lautuxuyen.jpg") },
  { title: "Japan", image: require("@/assets/images/launhatban.jpg") },
  { title: "Vietnam", image: require("@/assets/images/bundaumamtom.jpg") },
  { title: "Korea", image: require("@/assets/images/comcuonhanquoc.jpg") },
  { title: "Drink", image: require("@/assets/images/douong.png") },
  { title: "Rice", image: require("@/assets/images/com.png") },
];

export default function Home() {
  const router = useRouter();
  const { category } = useLocalSearchParams();

  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // state tìm kiếm

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/Login");
    }
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/Login");
    } catch (error) {
      const err = error as Error;
      Alert.alert("Đăng xuất thất bại", err.message);
    }
  };

  const handleNavigateToDetail = (item: MenuItem) => {
    router.push({
      pathname: "/foodDetail",
      params: {
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        category: category,
      },
    });
  };

  // Lấy dữ liệu menu từ Firestore 1 lần duy nhất khi component mount
  useEffect(() => {
    const initData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menu"));
        const data: MenuItem[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MenuItem, "id">),
        }));
        setMenuData(data);
      } catch (error) {
        console.error("Lỗi khi load dữ liệu:", error);
      }
    };

    initData();
  }, []);

  // Lọc menuData theo searchQuery
  const filteredMenuData = menuData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/userProfile")}>
          <Ionicons name="person-circle-outline" size={28} color="crimson" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Restaurant App</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleSignOut} style={styles.iconRight}>
            <MaterialIcons name="logout" size={24} color="crimson" />
          </TouchableOpacity>
          <CartIconWithBadge />
        </View>
      </View>

      {/* Location + Search */}
      <View style={styles.locationBar}>
        <Text style={styles.locationText}>📍 Phượng Hoàng Cổ Trấn </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Bạn muốn ăn gì nè?"
          value={searchQuery}
          onChangeText={setSearchQuery} // cập nhật tìm kiếm
        />
      </View>

      {/* Hiển thị kết quả tìm kiếm nếu có */}
      {searchQuery.length > 0 ? (
        <>
          <Text style={styles.subHeader}>
            Kết quả tìm kiếm cho "{searchQuery}"
          </Text>
          {filteredMenuData.length > 0 ? (
            <View style={styles.grid}>
              {filteredMenuData.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => handleNavigateToDetail(item)}
                >
                  <Image source={{ uri: item.image }} style={styles.image} />
                  <Text style={styles.label}>{item.name}</Text>
                  <Text style={{ color: "gray" }}>
                    {item.price.toLocaleString()}đ
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{ marginTop: 10, color: "gray", fontStyle: "italic" }}>
              Không tìm thấy món ăn phù hợp.
            </Text>
          )}
        </>
      ) : (
        <>
          {/* Danh mục món ăn */}
          <Text style={styles.subHeader}>Danh mục</Text>
          <View style={styles.grid}>
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
          </View>

          {/* Món ăn nổi bật theo từng quốc gia */}
          {categories.map((cat) => {
            const filtered = menuData.filter(
              (item) => item.category.toLowerCase() === cat.title.toLowerCase()
            );
            if (filtered.length === 0) return null;

            return (
              <View key={cat.title} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Món {cat.title} nổi bật</Text>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/categoryItems?category=${encodeURIComponent(cat.title)}`)
                    }
                  >
                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {filtered.slice(0, 5).map((item) => (
                    <View key={item.id} style={styles.foodCard}>
                      <TouchableOpacity onPress={() => handleNavigateToDetail(item)}>
                        <Image source={{ uri: item.image }} style={styles.foodImage} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleNavigateToDetail(item)}>
                        <Text style={styles.foodName}>{item.name}</Text>
                      </TouchableOpacity>
                      <Text style={styles.foodPrice}>
                        {item.price.toLocaleString()}đ
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
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
    marginBottom: 10,
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
  locationBar: {
    marginVertical: 10,
  },
  locationText: {
    fontWeight: "600",
    marginBottom: 5,
  },
  searchInput: {
    backgroundColor: "#eee",
    borderRadius: 10,
    padding: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginVertical: 15,
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
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  foodCard: {
    width: 120,
    marginRight: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  foodImage: {
    width: "100%",
    height: 80,
    borderRadius: 10,
    marginBottom: 5,
  },
  foodName: {
    fontWeight: "600",
    fontSize: 14,
  },
  foodPrice: {
    color: "gray",
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  viewAllText: {
    color: "crimson",
    fontWeight: "500",
  },
});
