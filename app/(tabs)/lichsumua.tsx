import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebaseConfig";

interface Product {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  transactionId: string;
  createdAt: number | string;
  amount: number;
  items?: Product[];
}

export default function History() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "payments"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const fetchedOrders: Order[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử mua hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const onRepeatOrder = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      alert("Đơn hàng không có sản phẩm để mua lại.");
      return;
    }

    // Chuyển sang trang thanh toán, truyền danh sách sản phẩm đã mua (serialize JSON)
    router.push({
      pathname: "/checkout",
      params: {
        products: JSON.stringify(order.items),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="crimson" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.orderTitle}>Mã giao dịch: {item.transactionId}</Text>
      <Text style={styles.orderDate}>
        Ngày: {new Date(item.createdAt).toLocaleString()}
      </Text>
      <Text style={styles.totalAmount}>Tổng tiền: {item.amount} VND</Text>

      {item.items &&
        item.items.map((product: Product, index: number) => (
          <View key={index} style={styles.productContainer}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text>Giá: {product.price} VND</Text>
              <Text>Số lượng: {product.quantity}</Text>
            </View>
          </View>
        ))}

     
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Icon */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/userProfile")}>
          <Ionicons name="arrow-back" size={28} color="crimson" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "gray",
  },
  orderContainer: {
    backgroundColor: "#fff",
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  orderTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 12,
    color: "gray",
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 16,
    marginBottom: 10,
    color: "crimson",
    fontWeight: "600",
  },
  productContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  productInfo: {
    justifyContent: "center",
  },
  productName: {
    fontWeight: "bold",
  },
  repeatButton: {
    marginTop: 10,
    backgroundColor: "crimson",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  repeatButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
