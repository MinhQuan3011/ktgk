import { doc, getDoc, setDoc } from "firebase/firestore";
import { create } from "zustand";
import { auth, db } from "../../firebaseConfig";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string; // Thêm image nếu bạn dùng hiển thị ảnh
};

type CartStore = {
  items: CartItem[];
  fetchCartFromFirestore: () => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  fetchCartFromFirestore: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ items: [] });
      return;
    }
    try {
      const cartRef = doc(db, "carts", user.uid);
      const docSnap = await getDoc(cartRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        set({ items: data.items || [] });
      } else {
        set({ items: [] });
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      set({ items: [] });
    }
  },

  addItem: async (item) => {
    const user = auth.currentUser;
    if (!user) {
      set({ items: [] });
      return;
    }

    try {
      const state = get();
      const existingItem = state.items.find((i) => i.id === item.id);
      let updatedItems;

      if (existingItem) {
        updatedItems = state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        updatedItems = [...state.items, item];
      }

      set({ items: updatedItems });

      const cartRef = doc(db, "carts", user.uid);
      await setDoc(cartRef, { items: updatedItems }, { merge: true });
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  },

  removeItem: async (id) => {
    const user = auth.currentUser;
    if (!user) {
      set({ items: [] });
      return;
    }

    try {
      const updatedItems = get().items.filter((i) => i.id !== id);
      set({ items: updatedItems });

      const cartRef = doc(db, "carts", user.uid);
      await setDoc(cartRef, { items: updatedItems }, { merge: true });
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  },

  clearCart: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ items: [] });
      return;
    }

    try {
      set({ items: [] });
      const cartRef = doc(db, "carts", user.uid);
      await setDoc(cartRef, { items: [] }, { merge: true });
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  },

  increaseQuantity: (id) => {
    const items = get().items.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    set({ items });
    const user = auth.currentUser;
    if (user) {
      const cartRef = doc(db, "carts", user.uid);
      setDoc(cartRef, { items }, { merge: true }).catch(console.error);
    }
  },

  decreaseQuantity: (id) => {
    let items = get().items.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity - 1 } : item
    );
    // Xóa item nếu quantity giảm về 0
    items = items.filter((item) => item.quantity > 0);
    set({ items });
    const user = auth.currentUser;
    if (user) {
      const cartRef = doc(db, "carts", user.uid);
      setDoc(cartRef, { items }, { merge: true }).catch(console.error);
    }
  },
}));
