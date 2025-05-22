import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { getAuth } from "firebase/auth";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
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

type Feedback = {
  id: string;
  userId: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt?: any;
};

export default function FoodDetail() {
  const { id, name, image, price, category } = useLocalSearchParams();

  const idStr = Array.isArray(id) ? id[0] : id ?? "";
  const nameStr = Array.isArray(name) ? name[0] : name ?? "";
  const categoryStr = Array.isArray(category) ? category[0] : category ?? "";

  const addItem = useCartStore((state) => state.addItem);
  const priceNumber = Number(price);
  const imageUri =
    typeof image === "string" && image.startsWith("http") ? image : null;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Editing feedback
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState("");
  const [editingRating, setEditingRating] = useState(0);
  const [processingEdit, setProcessingEdit] = useState(false);

  // Show/hide 3-dot menu for each feedback
  const [menuVisibleForId, setMenuVisibleForId] = useState<string | null>(null);

  const currentUser = getAuth().currentUser;

  const currentItem: MenuItem = {
    id: idStr,
    name: nameStr,
    price: priceNumber,
    image: typeof image === "string" ? image : "",
    category: categoryStr,
  };

  // Fetch feedbacks from Firestore
  const fetchFeedbacks = async () => {
    if (!idStr) return;
    setLoadingFeedbacks(true);
    try {
      const q = query(
        collection(db, "feedbacks"),
        where("foodId", "==", idStr),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const loadedFeedbacks: Feedback[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedFeedbacks.push({
          id: doc.id,
          userId: data.userId,
          userEmail: data.userEmail,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt,
        });
      });

      setFeedbacks(loadedFeedbacks);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      Alert.alert("Lỗi", "Không thể tải đánh giá. Vui lòng thử lại sau.");
    }
    setLoadingFeedbacks(false);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [idStr]);

  const handleSendFeedback = async () => {
    if (!rating || !comment.trim()) {
      Alert.alert("Thông báo", "Vui lòng đánh giá sao và nhập bình luận.");
      return;
    }

    if (!currentUser) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }

    setSendingFeedback(true);
    try {
      await addDoc(collection(db, "feedbacks"), {
        foodId: idStr,
        foodName: nameStr,
        rating,
        comment: comment.trim(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Đã gửi", `Bạn đã đánh giá ${rating} sao và bình luận: ${comment}`);
      setComment("");
      setRating(0);
      await fetchFeedbacks();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại sau.");
      console.error("Error adding feedback: ", error);
    }
    setSendingFeedback(false);
  };

  const handleAddToCart = async (item: MenuItem) => {
    try {
      await addItem({ ...item, quantity: 1 });
      Alert.alert("Thành công", `${item.name} đã được thêm vào giỏ hàng.`);
    } catch (err) {
      Alert.alert("Lỗi", "Thêm vào giỏ hàng thất bại. Vui lòng thử lại.");
    }
  };

  // Start edit feedback mode
  const startEditing = (fb: Feedback) => {
    setEditingId(fb.id);
    setEditingComment(fb.comment);
    setEditingRating(fb.rating);
    setMenuVisibleForId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingComment("");
    setEditingRating(0);
  };

  const saveEditing = async () => {
    if (!editingComment.trim() || !editingRating) {
      Alert.alert("Thông báo", "Vui lòng nhập bình luận và đánh giá sao.");
      return;
    }
    if (!editingId) return;

    setProcessingEdit(true);
    try {
      const docRef = doc(db, "feedbacks", editingId);
      await updateDoc(docRef, {
        comment: editingComment.trim(),
        rating: editingRating,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Cập nhật thành công");
      cancelEditing();
      await fetchFeedbacks();
    } catch (error) {
      Alert.alert("Lỗi", "Cập nhật thất bại. Vui lòng thử lại.");
      console.error("Error updating feedback:", error);
    }
    setProcessingEdit(false);
  };

  // Delete feedback with confirmation
  const deleteFeedback = (fbId: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa bình luận này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "feedbacks", fbId));
            Alert.alert("Đã xóa bình luận");
            if (editingId === fbId) cancelEditing();
            await fetchFeedbacks();
          } catch (error) {
            Alert.alert("Lỗi", "Xóa thất bại. Vui lòng thử lại.");
            console.error("Error deleting feedback:", error);
          }
        },
      },
    ]);
    setMenuVisibleForId(null);
  };

  if (!idStr || !nameStr) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 18, color: "#f00" }}>
          Dữ liệu món ăn không hợp lệ.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.push(`/categoryItems?category=${encodeURIComponent(categoryStr)}`)
          }
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#3f51b5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết món ăn</Text>
        <TouchableOpacity onPress={() => router.push("/cart")}>
          <CartIconWithBadge />
        </TouchableOpacity>
      </View>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text>Ảnh không có sẵn</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{nameStr}</Text>
        <Text style={styles.price}>
          {isNaN(priceNumber) ? "Giá không hợp lệ" : priceNumber.toLocaleString() + " đ"}
        </Text>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(currentItem)}
          activeOpacity={0.8}
        >
          <Text style={styles.addToCartText}>+ Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Đánh giá và bình luận</Text>

        {/* Input feedback */}
        {!editingId && (
          <>
            <View style={styles.ratingInputRow}>
              <Text style={{ marginRight: 10 }}>Số sao:</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={28}
                    color="#fbc02d"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Viết bình luận..."
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendFeedback}
              disabled={sendingFeedback}
            >
              {sendingFeedback ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Gửi bình luận</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Editing feedback */}
        {editingId && (
          <>
            <View style={styles.ratingInputRow}>
              <Text style={{ marginRight: 10 }}>Số sao:</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setEditingRating(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= editingRating ? "star" : "star-outline"}
                    size={28}
                    color="#fbc02d"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Chỉnh sửa bình luận..."
              value={editingComment}
              onChangeText={setEditingComment}
              multiline
            />
            <View style={styles.editButtonsRow}>
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: "#ccc" }]}
                onPress={cancelEditing}
                disabled={processingEdit}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={saveEditing}
                disabled={processingEdit}
              >
                {processingEdit ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Danh sách bình luận</Text>
          {loadingFeedbacks ? (
            <ActivityIndicator size="large" />
          ) : feedbacks.length === 0 ? (
            <Text>Chưa có bình luận nào.</Text>
          ) : (
            feedbacks.map((fb) => (
              <View key={fb.id} style={styles.feedbackItem}>
                <View style={styles.feedbackHeader}>
                  <Text style={styles.feedbackUser}>{fb.userEmail}</Text>
                  <View style={styles.feedbackRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= fb.rating ? "star" : "star-outline"}
                        size={18}
                        color="#fbc02d"
                      />
                    ))}
                  </View>
                  {/* 3-dot menu chỉ hiện cho feedback của user hiện tại, và khi không đang sửa */}
                  {currentUser?.uid === fb.userId && editingId !== fb.id && (
                    <View style={styles.menuWrapper}>
                      <TouchableOpacity
                        onPress={() =>
                          setMenuVisibleForId(menuVisibleForId === fb.id ? null : fb.id)
                        }
                        style={styles.menuButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="ellipsis-vertical" size={24} color="#333" />
                      </TouchableOpacity>

                      {/* Popup menu */}
                      {menuVisibleForId === fb.id && (
                        <TouchableOpacity
                          style={styles.menuOverlay}
                          activeOpacity={1}
                          onPress={() => setMenuVisibleForId(null)}
                        >
                          <View style={styles.popupMenu}>
                            <Pressable
                              onPress={() => startEditing(fb)}
                              style={styles.popupMenuItem}
                            >
                              <Text style={styles.popupMenuText}>Sửa</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => deleteFeedback(fb.id)}
                              style={styles.popupMenuItem}
                            >
                              <Text style={[styles.popupMenuText, { color: "#f44336" }]}>
                                Xóa
                              </Text>
                            </Pressable>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                <Text style={styles.feedbackComment}>{fb.comment}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 10, backgroundColor: "#fff" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#3f51b5" },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },

  content: {
    marginVertical: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  price: {
    fontSize: 20,
    marginVertical: 10,
    color: "#f57c00",
    fontWeight: "600",
  },
  addToCartButton: {
    backgroundColor: "#3f51b5",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  addToCartText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  feedbackSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  ratingInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  input: {
    minHeight: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: "#3f51b5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  editButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  feedbackItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  feedbackUser: {
    fontWeight: "600",
    marginRight: 10,
  },
  feedbackRating: {
    flexDirection: "row",
    marginRight: "auto",
  },
  feedbackComment: {
    marginTop: 4,
  },

  menuWrapper: {
    position: "relative",
  },
  menuButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  menuOverlay: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.1)",
    width: 120,
    borderRadius: 8,
    zIndex: 1000,
  },
  popupMenu: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    paddingVertical: 4,
  },
  popupMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  popupMenuText: {
    fontSize: 16,
  },
});
