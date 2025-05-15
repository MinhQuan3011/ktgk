import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

const sampleData: MenuItem[] = [
  {
    id: "1",
    name: "Kung Pao Chicken",
    price: 120000,
    image: "https://via.placeholder.com/100",
    category: "chinese", // viết thường
  },
  {
    id: "2",
    name: "Spring Rolls",
    price: 60000,
    image: "https://via.placeholder.com/100",
    category: "chinese",
  },
  {
    id: "3",
    name: "Masala Dosa",
    price: 50000,
    image: "https://via.placeholder.com/100",
    category: "south indian",
  },
  {
    id: "4",
    name: "Idli Sambhar",
    price: 40000,
    image: "https://via.placeholder.com/100",
    category: "south indian",
  },
  {
    id: "5",
    name: "Pad Thai",
    price: 90000,
    image: "https://via.placeholder.com/100",
    category: "thai",
  },
];


export const seedMenuData = async () => {
  try {
    for (const item of sampleData) {
      const docRef = doc(db, "menu", item.id);
      await setDoc(docRef, item);
    }
    console.log("✅ Sample menu data uploaded to Firestore.");
  } catch (error) {
    console.error("❌ Failed to upload sample data:", error);
  }
};
