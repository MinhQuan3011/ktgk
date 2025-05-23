import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { getAuth } from "firebase/auth";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    where,
} from "firebase/firestore";
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

// Định nghĩa kiểu dữ liệu cho một đánh giá
type Feedback = {
  id: string;
  foodName: string;
  rating: number;
  comment: string;
  userId: string;
  userEmail?: string;      // Thêm trường userEmail
  foodImage?: string;      // Thêm trường foodImage (URL hình ảnh)
  createdAt?: any;         // Có thể dùng Timestamp nếu bạn import từ firebase
};

export default function MyReviews() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string>("");
  const [editingRating, setEditingRating] = useState<number>(0);
  const navigation = useNavigation();
  const currentUser = getAuth().currentUser;

const fetchMyFeedbacks = async () => {
  if (!currentUser) {
    Alert.alert("Thông báo", "Bạn cần đăng nhập để xem đánh giá.");
    return;
  }
  setLoading(true);
  try {
    const q = query(
      collection(db, "feedbacks"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const list: Feedback[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Feedback, "id">),
    }));
    setFeedbacks(list);
  } catch (error: any) {
    console.error("Error fetching feedbacks:", error);
    Alert.alert(
      "Lỗi tải dữ liệu",
      `Không thể tải đánh giá của bạn. Lỗi: ${error.message || error}`
    );
  }
  setLoading(false);
};


  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "feedbacks", id));
      fetchMyFeedbacks();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xóa đánh giá.");
    }
  };

  const renderItem = ({ item }: { item: Feedback }) => (
    <View style={styles.itemContainer}>
      {/* Hiển thị hình ảnh món ăn nếu có */}
      {item.foodImage ? (
        <Image source={{ uri: item.foodImage }} style={styles.foodImage} />
      ) : null}

      <Text style={styles.title}>{item.foodName}</Text>

      {/* Hiển thị email người dùng */}
      {item.userEmail ? (
        <Text style={styles.email}>Đánh giá bởi: {item.userEmail}</Text>
      ) : null}

      {/* Hiển thị ngày đánh giá */}
      {item.createdAt?.toDate ? (
        <Text style={styles.date}>
          Ngày: {item.createdAt.toDate().toLocaleDateString()}
        </Text>
      ) : null}

      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= item.rating ? "star" : "star-outline"}
            size={20}
            color="#fbc02d"
          />
        ))}
      </View>

      <Text style={styles.comment}>{item.comment}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => {
            setEditingId(item.id);
            setEditingRating(item.rating);
            setEditingComment(item.comment);
          }}
        >
          <Text style={styles.edit}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.delete}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    fetchMyFeedbacks();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        style={{ marginTop: 50 }}
        size="large"
        color="#3f51b5"
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Icon */}
        <View style={styles.header}>
           <TouchableOpacity onPress={() => router.push("/userProfile")}>
              <Ionicons name="arrow-back" size={26} color="#3f51b5" />
              </TouchableOpacity>
            <Text style={styles.headerTitle}>Đánh giá của tôi</Text>
            <View style={{ width: 26 }} /> 
        </View>
        <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
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
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  foodImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  email: {
    fontSize: 12,
    color: "#777",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    marginVertical: 6,
  },
  comment: {
    fontSize: 14,
    color: "#444",
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
  },
  edit: {
    color: "#3f51b5",
    fontWeight: "600",
    fontSize: 14,
  },
  delete: {
    color: "#e53935",
    fontWeight: "600",
    fontSize: 14,
  },
});
