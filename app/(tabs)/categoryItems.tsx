import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState("");
  const addItem = useCartStore((state) => state.addItem);

  // Lấy user hiện tại
  const auth = getAuth();

  // Lấy role user từ Firestore
  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setIsAdmin(data.role === "admin");
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setIsAdmin(false);
      }
    };
    fetchUserRole();
  }, [auth.currentUser]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
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

  // --- Xử lý sửa món ---
  const openEditModal = (item: MenuItem) => {
    setEditItem(item);
    setNewName(item.name);
    setNewPrice(item.price.toString());
    setNewImage(item.image);
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    if (!newName || !newPrice) {
      Alert.alert("Lỗi", "Tên và giá không được để trống");
      return;
    }
    try {
      const itemRef = doc(db, "menu", editItem.id);
      await updateDoc(itemRef, {
        name: newName,
        price: Number(newPrice),
        image: newImage,
      });
      // Cập nhật local state để UI update luôn
      setItems((prev) =>
        prev.map((i) =>
          i.id === editItem.id
            ? { ...i, name: newName, price: Number(newPrice), image: newImage }
            : i
        )
      );
      setModalVisible(false);
      Alert.alert("Thành công", "Cập nhật món ăn thành công");
    } catch (error) {
      Alert.alert("Lỗi", "Cập nhật món ăn thất bại");
    }
  };

  // --- Xử lý xóa món ---
  const handleDelete = (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa món này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "menu", id));
            setItems((prev) => prev.filter((item) => item.id !== id));
            Alert.alert("Thành công", "Xóa món ăn thành công");
          } catch (error) {
            Alert.alert("Lỗi", "Xóa món ăn thất bại");
          }
        },
      },
    ]);
  };

  // --- Xử lý thêm món mới ---
  const openAddModal = () => {
    setEditItem(null);
    setNewName("");
    setNewPrice("");
    setNewImage("");
    setModalVisible(true);
  };

  const handleSaveAdd = async () => {
    if (!newName || !newPrice) {
      Alert.alert("Lỗi", "Tên và giá không được để trống");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "menu"), {
        name: newName,
        price: Number(newPrice),
        image: newImage,
        category: (category as string).toLowerCase(),
      });
      setItems((prev) => [
        ...prev,
        {
          id: docRef.id,
          name: newName,
          price: Number(newPrice),
          image: newImage,
          category: (category as string).toLowerCase(),
        },
      ]);
      setModalVisible(false);
      Alert.alert("Thành công", "Thêm món ăn thành công");
    } catch (error) {
      Alert.alert("Lỗi", "Thêm món ăn thất bại");
    }
  };

  // --- Render menu 3 chấm cho admin ---
  const renderAdminMenu = (item: MenuItem) => (
    <TouchableOpacity
      style={{ paddingHorizontal: 10 }}
      onPress={() =>
        Alert.alert("Chọn thao tác", "", [
          { text: "Sửa", onPress: () => openEditModal(item) },
          { text: "Xóa", onPress: () => handleDelete(item.id), style: "destructive" },
          { text: "Hủy", style: "cancel" },
        ])
      }
    >
      <Ionicons name="ellipsis-vertical" size={24} color="#333" />
    </TouchableOpacity>
  );

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

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.buttonText}>+ Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>

      {isAdmin && renderAdminMenu(item)}
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#3f51b5"
        style={{ marginTop: 50 }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Icon */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Ionicons name="arrow-back" size={28} color="#3f51b5" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{category}</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {isAdmin && (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={openAddModal}
              accessible
              accessibilityLabel="Thêm món"
            >
              <Ionicons name="add-circle-outline" size={28} color="#3f51b5" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => router.push("/cart")}>
            <CartIconWithBadge />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal cho sửa / thêm món */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editItem ? "Sửa món ăn" : "Thêm món ăn"}
            </Text>

            <TextInput
              placeholder="Tên món"
              value={newName}
              onChangeText={setNewName}
              style={styles.input}
            />
            <TextInput
              placeholder="Giá món"
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Link ảnh"
              value={newImage}
              onChangeText={setNewImage}
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={editItem ? handleSaveEdit : handleSaveAdd}
                style={[styles.modalButton, { backgroundColor: "#3f51b5" }]}
              >
                <Text style={{ color: "#fff" }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    color: "#3f51b5",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});

