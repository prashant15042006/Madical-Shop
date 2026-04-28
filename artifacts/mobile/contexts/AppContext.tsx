import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { DEFAULT_MEDICINES, Medicine } from "@/constants/medicines";

export type Role = "customer" | "shop" | null;

export type ShopProfile = {
  shopName: string;
  ownerName: string;
  mobile: string;
  address: string;
  upiId: string;
  qrImageUri: string | null;
  rating: number;
  ratingCount: number;
};

export type OrderItem = {
  medicineId: string;
  name: string;
  imageKey: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  item: OrderItem;
  total: number;
  paymentMethod: "upi" | "cod";
  status: "placed" | "delivered";
  createdAt: number;
  deliveredAt: number | null;
  customerRating: number | null;
  shopName: string;
  shopMobile: string;
  shopAddress: string;
};

type AppContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  resetRole: () => void;

  shop: ShopProfile;
  saveShopProfile: (profile: Partial<ShopProfile>) => Promise<void>;
  shopReady: boolean;

  medicines: Medicine[];
  addMedicine: (m: Omit<Medicine, "id" | "image">) => Promise<void>;
  updateMedicine: (id: string, m: Partial<Medicine>) => Promise<void>;
  removeMedicine: (id: string) => Promise<void>;

  orders: Order[];
  placeOrder: (
    o: Omit<
      Order,
      | "id"
      | "createdAt"
      | "status"
      | "deliveredAt"
      | "customerRating"
      | "shopName"
      | "shopMobile"
      | "shopAddress"
    >,
  ) => Order;
  markDelivered: (orderId: string) => Promise<void>;
  rateOrder: (orderId: string, rating: number) => Promise<void>;

  loaded: boolean;
};

const STORAGE_KEYS = {
  role: "@medigo/role",
  shop: "@medigo/shop",
  medicines: "@medigo/medicines",
  orders: "@medigo/orders",
};

const DEFAULT_SHOP: ShopProfile = {
  shopName: "",
  ownerName: "",
  mobile: "",
  address: "",
  upiId: "",
  qrImageUri: null,
  rating: 0,
  ratingCount: 0,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

function genId(prefix: string) {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);
  const [shop, setShop] = useState<ShopProfile>(DEFAULT_SHOP);
  const [medicines, setMedicines] = useState<Medicine[]>(DEFAULT_MEDICINES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [r, s, m, o] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.role),
          AsyncStorage.getItem(STORAGE_KEYS.shop),
          AsyncStorage.getItem(STORAGE_KEYS.medicines),
          AsyncStorage.getItem(STORAGE_KEYS.orders),
        ]);
        if (r) setRoleState(JSON.parse(r));
        if (s) setShop({ ...DEFAULT_SHOP, ...JSON.parse(s) });
        if (m) {
          const parsed: Medicine[] = JSON.parse(m);
          const withImages = parsed.map((med) => ({
            ...med,
            image:
              med.imageKey && med.imageKey.startsWith("http")
                ? { uri: med.imageKey }
                : require("../assets/images/med_paracetamol.png"),
          }));
          setMedicines(withImages);
        }
        if (o) setOrders(JSON.parse(o));
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persistMedicines = useCallback(async (list: Medicine[]) => {
    const serializable = list.map((m) => ({
      ...m,
      image: undefined as unknown,
    }));
    await AsyncStorage.setItem(
      STORAGE_KEYS.medicines,
      JSON.stringify(serializable),
    );
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    AsyncStorage.setItem(STORAGE_KEYS.role, JSON.stringify(r)).catch(() => {});
  }, []);

  const resetRole = useCallback(() => {
    setRoleState(null);
    AsyncStorage.removeItem(STORAGE_KEYS.role).catch(() => {});
  }, []);

  const saveShopProfile = useCallback(async (profile: Partial<ShopProfile>) => {
    setShop((prev) => {
      const next = { ...prev, ...profile };
      AsyncStorage.setItem(STORAGE_KEYS.shop, JSON.stringify(next)).catch(
        () => {},
      );
      return next;
    });
  }, []);

  const addMedicine = useCallback(
    async (m: Omit<Medicine, "id" | "image">) => {
      setMedicines((prev) => {
        const { MEDICINE_IMAGES } = require("@/constants/medicines");
        const img =
          MEDICINE_IMAGES[m.imageKey] ?? MEDICINE_IMAGES.paracetamol;
        const next = [...prev, { ...m, id: genId("med"), image: img }];
        persistMedicines(next).catch(() => {});
        return next;
      });
    },
    [persistMedicines],
  );

  const updateMedicine = useCallback(
    async (id: string, patch: Partial<Medicine>) => {
      setMedicines((prev) => {
        const { MEDICINE_IMAGES } = require("@/constants/medicines");
        const next = prev.map((m) => {
          if (m.id !== id) return m;
          const merged = { ...m, ...patch };
          if (patch.imageKey) {
            merged.image =
              MEDICINE_IMAGES[patch.imageKey] ?? MEDICINE_IMAGES.paracetamol;
          }
          return merged;
        });
        persistMedicines(next).catch(() => {});
        return next;
      });
    },
    [persistMedicines],
  );

  const removeMedicine = useCallback(
    async (id: string) => {
      setMedicines((prev) => {
        const next = prev.filter((m) => m.id !== id);
        persistMedicines(next).catch(() => {});
        return next;
      });
    },
    [persistMedicines],
  );

  const placeOrder = useCallback<AppContextValue["placeOrder"]>(
    (o) => {
      const newOrder: Order = {
        ...o,
        id: genId("ord"),
        createdAt: Date.now(),
        status: "placed",
        deliveredAt: null,
        customerRating: null,
        shopName: shop.shopName || "MediGo Shop",
        shopMobile: shop.mobile || "Not set",
        shopAddress: shop.address || "Not set",
      };
      setOrders((prev) => {
        const next = [newOrder, ...prev];
        AsyncStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(next)).catch(
          () => {},
        );
        return next;
      });
      // reduce stock
      setMedicines((prev) => {
        const next = prev.map((m) =>
          m.id === o.item.medicineId
            ? { ...m, stock: Math.max(0, m.stock - o.item.quantity) }
            : m,
        );
        persistMedicines(next).catch(() => {});
        return next;
      });
      return newOrder;
    },
    [shop, persistMedicines],
  );

  const markDelivered = useCallback(async (orderId: string) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "delivered" as const, deliveredAt: Date.now() }
          : o,
      );
      AsyncStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(next)).catch(
        () => {},
      );
      return next;
    });
  }, []);

  const rateOrder = useCallback(
    async (orderId: string, rating: number) => {
      let oldRating: number | null = null;
      setOrders((prev) => {
        const next = prev.map((o) => {
          if (o.id === orderId) {
            oldRating = o.customerRating;
            return { ...o, customerRating: rating };
          }
          return o;
        });
        AsyncStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(next)).catch(
          () => {},
        );
        return next;
      });
      // update shop average
      setShop((prev) => {
        let totalRating = prev.rating * prev.ratingCount;
        let count = prev.ratingCount;
        if (oldRating != null) {
          totalRating = totalRating - oldRating + rating;
        } else {
          totalRating = totalRating + rating;
          count = count + 1;
        }
        const next = {
          ...prev,
          rating: count > 0 ? totalRating / count : 0,
          ratingCount: count,
        };
        AsyncStorage.setItem(STORAGE_KEYS.shop, JSON.stringify(next)).catch(
          () => {},
        );
        return next;
      });
    },
    [],
  );

  const shopReady = !!(shop.shopName && shop.mobile && shop.upiId);

  const value = useMemo<AppContextValue>(
    () => ({
      role,
      setRole,
      resetRole,
      shop,
      saveShopProfile,
      shopReady,
      medicines,
      addMedicine,
      updateMedicine,
      removeMedicine,
      orders,
      placeOrder,
      markDelivered,
      rateOrder,
      loaded,
    }),
    [
      role,
      setRole,
      resetRole,
      shop,
      saveShopProfile,
      shopReady,
      medicines,
      addMedicine,
      updateMedicine,
      removeMedicine,
      orders,
      placeOrder,
      markDelivered,
      rateOrder,
      loaded,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
