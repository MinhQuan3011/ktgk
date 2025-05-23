import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";
import CartIconWithBadge from "./cartIconWithBadge";
import { useCartStore } from "./store";
type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

export default function CategoryItems() {
  const { category } = useLocalSearchParams();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(
          collection(db, "menu"),
          where("category", "==", (category as string).toLowerCase())
        );
        const querySnapshot = await getDocs(q);
        const data: MenuItem[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuItem[];

        setItems(data);
      } catch (error) {
        Alert.alert("Error", "Could not load items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [category]);

  const handleAddToCart = async (item: MenuItem) => {
    try {
      await addItem({ ...item, quantity: 1 });
      Alert.alert("Success", `${item.name} thêm vào giỏ hàng`);
    } catch (err) {
      Alert.alert("Error", "Failed to add to cart");
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


 const renderItem = ({ item }: { item: MenuItem }) => (
  <View style={styles.card}>
    {/* Bấm vào hình sẽ qua trang chi tiết */}
    <TouchableOpacity onPress={() => handleNavigateToDetail(item)}>
      <Image source={{ uri: item.image }} style={styles.image} />
    </TouchableOpacity>

    <View style={styles.info}>
      {/* Bấm vào tên cũng qua trang chi tiết */}
      <TouchableOpacity onPress={() => handleNavigateToDetail(item)}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>

      <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>

      <TouchableOpacity style={styles.button} onPress={() => handleAddToCart(item)}>
        <Text style={styles.buttonText}>+ Thêm vào giỏ</Text>
      </TouchableOpacity>
    </View>
  </View>
);


  if (loading) {
    return <ActivityIndicator size="large" color="#3f51b5" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Icon */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Ionicons name="arrow-back" size={28} color="#3f51b5" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{category}</Text>

          <TouchableOpacity onPress={() => router.push("/cart")}>
            <CartIconWithBadge />
          </TouchableOpacity>
        </View>

       
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
 header: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 15,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderColor: "#e0e0e0",
  backgroundColor: "#fff",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  justifyContent: "space-between",
},

headerTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#3f51b5",
  textTransform: "capitalize",
  flex: 1,
  textAlign: "center",
  marginHorizontal: 10, // tránh dính vào icon
},
  list: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  card: {
    flexDirection: "row",
    marginBottom: 18,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
  },
  image: {
    width: 110,
    height: 110,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  info: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#e91e63",
    marginVertical: 6,
  },
  button: {
    backgroundColor: "#3f51b5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    shadowColor: "#3f51b5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
