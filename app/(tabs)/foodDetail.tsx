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
        foodImage: imageUri,
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

          <TouchableOpacity
            onPress={() => router.push("/")}
          >
            <Ionicons name="home" size={28} color="crimson" />
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

        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Đánh giá và bình luận</Text>

          {/* Rating stars input */}
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                hitSlop={8}
                style={{ marginRight: 6 }}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={28}
                  color="#f1c40f"
                />
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Viết bình luận của bạn..."
            value={comment}
            onChangeText={setComment}
            editable={!sendingFeedback}
          />
          <TouchableOpacity
            style={[styles.sendButton, sendingFeedback && { opacity: 0.6 }]}
            onPress={handleSendFeedback}
            disabled={sendingFeedback}
          >
            {sendingFeedback ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Gửi bình luận</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.feedbackList}>
          <Text style={styles.sectionTitle}>Bình luận</Text>
          {loadingFeedbacks ? (
            <ActivityIndicator size="large" color="#3f51b5" />
          ) : feedbacks.length === 0 ? (
            <Text style={{ fontStyle: "italic" }}>Chưa có bình luận nào.</Text>
          ) : (
            feedbacks.map((fb) => {
              const isOwner = currentUser?.uid === fb.userId;
              const isEditingThis = editingId === fb.id;

              return (
                <View key={fb.id} style={styles.feedbackItem}>
                  <View style={styles.feedbackHeader}>
                    <Text style={styles.feedbackUser}>
                      {fb.userEmail || "Người dùng"}
                    </Text>

                    {/* Show menu button only if user owns this feedback */}
                    {isOwner && (
                      <TouchableOpacity
                        onPress={() =>
                          setMenuVisibleForId(menuVisibleForId === fb.id ? null : fb.id)
                        }
                        hitSlop={8}
                        style={{ padding: 4 }}
                      >
                        <Ionicons name="ellipsis-vertical" size={20} color="#333" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {menuVisibleForId === fb.id && isOwner && (
                    <View style={styles.menuOptions}>
                      <TouchableOpacity
                        onPress={() => startEditing(fb)}
                        style={styles.menuOptions}
                      >
                        <Text style={styles.menuOptions}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteFeedback(fb.id)}
                        style={[styles.menuOptions, { borderTopWidth: 1, borderTopColor: "#ccc" }]}
                      >
                        <Text style={[styles.menuOptions, { color: "red" }]}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* If editing this feedback, show editing inputs */}
                  {isEditingThis ? (
                    <View style={styles.editingContainer}>
                      <View style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Pressable
                            key={star}
                            onPress={() => setEditingRating(star)}
                            hitSlop={8}
                            style={{ marginRight: 6 }}
                          >
                            <Ionicons
                              name={star <= editingRating ? "star" : "star-outline"}
                              size={24}
                              color="#f1c40f"
                            />
                          </Pressable>
                        ))}
                      </View>
                      <TextInput
                        style={styles.textInput}
                        multiline
                        value={editingComment}
                        onChangeText={setEditingComment}
                        editable={!processingEdit}
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity
                          onPress={saveEditing}
                          style={[styles.sendButton, { flex: 1, marginRight: 5 }]}
                          disabled={processingEdit}
                        >
                          {processingEdit ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={styles.sendButtonText}>Lưu</Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={cancelEditing}
                          style={[
                            styles.sendButton,
                            { flex: 1, backgroundColor: "#ccc", marginLeft: 5 },
                          ]}
                          disabled={processingEdit}
                        >
                          <Text style={[styles.sendButtonText, { color: "#333" }]}>
                            Hủy
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= fb.rating ? "star" : "star-outline"}
                            size={20}
                            color="#f1c40f"
                          />
                        ))}
                      </View>
                      <Text style={styles.feedbackComment}>{fb.comment}</Text>
                    </>
                  )}
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3f51b5",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#eee",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: "#e74c3c",
    marginBottom: 12,
  },
  addToCartButton: {
    backgroundColor: "#3f51b5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  addToCartText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  feedbackSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: "row",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: "top",
    backgroundColor: "#fafafa",
  },
  sendButton: {
    backgroundColor: "#3f51b5",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  feedbackList: {
    marginBottom: 40,
  },
  feedbackItem: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  feedbackUser: {
    fontWeight: "700",
    color: "#333",
  },
  feedbackComment: {
    fontSize: 16,
    marginTop: 6,
    color: "#555",
  },
  menuOptions: {
    position: "absolute",
    top: 30,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  editingContainer: {
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    padding: 10,
  },
  editButtons: {
    flexDirection: "row",
    marginTop: 10,
  },
});
