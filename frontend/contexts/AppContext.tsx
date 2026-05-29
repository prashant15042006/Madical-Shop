import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  type CreateMedicineBody,
  type Order,
  type OrderItemInput,
  type Shop,
  type UpdateMedicineBody,
  type UpdateShopBody,
  getGetShopQueryKey,
  getListMedicinesQueryKey,
  getListOrdersQueryKey,
  useCreateMedicine,
  useCreateOrder,
  useDeleteMedicine,
  useGetShop,
  useListMedicines,
  useListOrders,
  useMarkOrderDelivered,
  useRateOrder,
  useUpdateMedicine,
  useUpdateShop,
} from "@workspace/api-client-react";

import { Medicine, withImage } from "@/constants/medicines";
import { ensureNotificationPermission, notify } from "@/lib/notifications";

export type Role = "customer" | "shop" | null;

type AppContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  resetRole: () => void;

  shop: Shop;
  saveShopProfile: (profile: UpdateShopBody) => Promise<void>;
  shopReady: boolean;

  medicines: Medicine[];
  medicinesLoading: boolean;
  addMedicine: (m: CreateMedicineBody) => Promise<void>;
  updateMedicine: (id: string, m: UpdateMedicineBody) => Promise<void>;
  removeMedicine: (id: string) => Promise<void>;

  orders: Order[];
  ordersLoading: boolean;
  customerMobile: string | null;
  placeOrder: (input: PlaceOrderInput) => Promise<Order>;
  markDelivered: (orderId: string) => Promise<void>;
  rateOrder: (orderId: string, rating: number) => Promise<void>;

  loaded: boolean;
};

export type PlaceOrderInput = {
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  customerLat?: number | null;
  customerLng?: number | null;
  item: OrderItemInput;
  total: number;
  deliveryCharge?: number;
  paymentMethod: "upi" | "cod";
};

const STORAGE_KEYS = {
  role: "@medigo/role",
  customerMobile: "@medigo/customerMobile",
};

const DEFAULT_SHOP: Shop = {
  id: "main",
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);
  const [customerMobile, setCustomerMobile] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      try {
        const [r, m] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.role),
          AsyncStorage.getItem(STORAGE_KEYS.customerMobile),
        ]);
        if (r) setRoleState(JSON.parse(r));
        if (m) setCustomerMobile(JSON.parse(m));
      } catch {
        // ignore
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    AsyncStorage.setItem(STORAGE_KEYS.role, JSON.stringify(r)).catch(() => {});
    if (r) ensureNotificationPermission().catch(() => {});
  }, []);

  const resetRole = useCallback(() => {
    setRoleState(null);
    AsyncStorage.removeItem(STORAGE_KEYS.role).catch(() => {});
  }, []);

  // Queries
  const shopQuery = useGetShop();
  const medicinesQuery = useListMedicines();
  const ordersParams =
    role === "customer" && customerMobile ? { customerMobile } : undefined;
  const ordersQuery = useListOrders(ordersParams, {
    query: {
      queryKey: getListOrdersQueryKey(ordersParams),
      enabled: hydrated && (role === "shop" || !!customerMobile),
      // tez refresh — naye orders / status changes jaldi pakde
      refetchInterval: role === "shop" ? 8_000 : 12_000,
      refetchIntervalInBackground: false,
      staleTime: 3_000,
    },
  });

  // Mutations
  const updateShopMut = useUpdateShop();
  const createMedicineMut = useCreateMedicine();
  const updateMedicineMut = useUpdateMedicine();
  const deleteMedicineMut = useDeleteMedicine();
  const createOrderMut = useCreateOrder();
  const markDeliveredMut = useMarkOrderDelivered();
  const rateOrderMut = useRateOrder();

  const invalidateShop = useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: getGetShopQueryKey() }),
    [queryClient],
  );
  const invalidateMedicines = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: getListMedicinesQueryKey(),
      }),
    [queryClient],
  );
  const invalidateOrders = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: [getListOrdersQueryKey()[0]],
      }),
    [queryClient],
  );

  const saveShopProfile = useCallback<AppContextValue["saveShopProfile"]>(
    async (patch) => {
      await updateShopMut.mutateAsync({ data: patch });
      await invalidateShop();
    },
    [updateShopMut, invalidateShop],
  );

  const addMedicine = useCallback<AppContextValue["addMedicine"]>(
    async (m) => {
      await createMedicineMut.mutateAsync({ data: m });
      await invalidateMedicines();
    },
    [createMedicineMut, invalidateMedicines],
  );

  const updateMedicine = useCallback<AppContextValue["updateMedicine"]>(
    async (id, patch) => {
      await updateMedicineMut.mutateAsync({ id, data: patch });
      await invalidateMedicines();
    },
    [updateMedicineMut, invalidateMedicines],
  );

  const removeMedicine = useCallback<AppContextValue["removeMedicine"]>(
    async (id) => {
      await deleteMedicineMut.mutateAsync({ id });
      await invalidateMedicines();
    },
    [deleteMedicineMut, invalidateMedicines],
  );

  const placeOrder = useCallback<AppContextValue["placeOrder"]>(
    async (input) => {
      const order = await createOrderMut.mutateAsync({
        data: {
          customerName: input.customerName,
          customerMobile: input.customerMobile,
          customerAddress: input.customerAddress,
          customerLat: input.customerLat ?? null,
          customerLng: input.customerLng ?? null,
          item: input.item,
          total: input.total,
          deliveryCharge: input.deliveryCharge ?? 10,
          paymentMethod: input.paymentMethod,
        },
      });
      // remember customer mobile for "My Orders" filter
      setCustomerMobile(input.customerMobile);
      AsyncStorage.setItem(
        STORAGE_KEYS.customerMobile,
        JSON.stringify(input.customerMobile),
      ).catch(() => {});
      await Promise.all([invalidateOrders(), invalidateMedicines()]);
      notify(
        "Order place ho gaya",
        `${input.item.name} × ${input.item.quantity} — ₹${input.total}`,
        { orderId: order.id, kind: "placed" },
      );
      return order;
    },
    [createOrderMut, invalidateOrders, invalidateMedicines],
  );

  const markDelivered = useCallback<AppContextValue["markDelivered"]>(
    async (id) => {
      await markDeliveredMut.mutateAsync({ id });
      await invalidateOrders();
    },
    [markDeliveredMut, invalidateOrders],
  );

  const rateOrder = useCallback<AppContextValue["rateOrder"]>(
    async (id, rating) => {
      await rateOrderMut.mutateAsync({ id, data: { rating } });
      await Promise.all([invalidateOrders(), invalidateShop()]);
    },
    [rateOrderMut, invalidateOrders, invalidateShop],
  );

  const shop = shopQuery.data ?? DEFAULT_SHOP;
  const medicines = useMemo<Medicine[]>(
    () => (medicinesQuery.data ?? []).map(withImage),
    [medicinesQuery.data],
  );
  const orders = ordersQuery.data ?? [];

  // Detect changes to orders and fire local notifications.
  const seenIdsRef = React.useRef<Set<string>>(new Set());
  const seenStatusRef = React.useRef<Map<string, string>>(new Map());
  const initializedRef = React.useRef(false);

  useEffect(() => {
    if (!ordersQuery.data) return;
    const seenIds = seenIdsRef.current;
    const seenStatus = seenStatusRef.current;

    if (!initializedRef.current) {
      // first load — just record current state, don't notify
      for (const o of ordersQuery.data) {
        seenIds.add(o.id);
        seenStatus.set(o.id, o.status);
      }
      initializedRef.current = true;
      return;
    }

    for (const o of ordersQuery.data) {
      if (!seenIds.has(o.id)) {
        seenIds.add(o.id);
        seenStatus.set(o.id, o.status);
        if (role === "shop") {
          notify(
            "Naya order aaya!",
            `${o.customerName} — ${o.item.name} × ${o.item.quantity} (₹${o.total})`,
            { orderId: o.id, kind: "new_order" },
          );
        }
        continue;
      }
      const prev = seenStatus.get(o.id);
      if (prev && prev !== o.status) {
        seenStatus.set(o.id, o.status);
        if (role === "customer" && o.status === "delivered") {
          notify(
            "Order deliver ho gaya",
            `${o.item.name} pahuch gayi. Rating de kar batayein!`,
            { orderId: o.id, kind: "delivered" },
          );
        }
      }
    }
  }, [ordersQuery.data, role]);

  const shopReady = !!(shop.shopName && shop.mobile && shop.upiId);
  const loaded = hydrated && !shopQuery.isLoading && !medicinesQuery.isLoading;

  const value = useMemo<AppContextValue>(
    () => ({
      role,
      setRole,
      resetRole,
      shop,
      saveShopProfile,
      shopReady,
      medicines,
      medicinesLoading: medicinesQuery.isLoading,
      addMedicine,
      updateMedicine,
      removeMedicine,
      orders,
      ordersLoading: ordersQuery.isLoading,
      customerMobile,
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
      medicinesQuery.isLoading,
      addMedicine,
      updateMedicine,
      removeMedicine,
      orders,
      ordersQuery.isLoading,
      customerMobile,
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

export type { Order, OrderItemInput };
