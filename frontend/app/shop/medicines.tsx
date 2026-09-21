import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Empty } from "@/components/Empty";
import { Field } from "@/components/Field";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  IMAGE_OPTIONS,
  MEDICINE_IMAGES,
  Medicine,
  finalPrice,
} from "@/constants/medicines";

export default function ShopMedicines() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { medicines, addMedicine, updateMedicine, removeMedicine } = useApp();
  const [editing, setEditing] = useState<Medicine | "new" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 8;

  const totalCount = medicines.length;
  const lowStockCount = medicines.filter((m) => m.stock <= 5).length;
  const discountCount = medicines.filter(
    (m) => (m.discountPercent ?? 0) > 0,
  ).length;

  const displayList = medicines.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  });

  const changeStock = async (item: Medicine, delta: number) => {
    const nextStock = Math.max(0, item.stock + delta);
    await updateMedicine(item.id, { stock: nextStock });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={displayList}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: bottomPad + 100,
          gap: 12,
        }}
        ListHeaderComponent={
          <View style={{ gap: 14, paddingBottom: 6 }}>
            {/* Top Stat Summary Cards */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }]}>
                <Text style={styles.statNumber}>{totalCount}</Text>
                <Text style={styles.statLabel}>Kul Dawaiyan</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: lowStockCount > 0 ? "#fffbeb" : "#f1f5f9", borderColor: lowStockCount > 0 ? "#fde68a" : "#e2e8f0" }]}>
                <Text style={[styles.statNumber, { color: lowStockCount > 0 ? "#b45309" : "#475569" }]}>
                  {lowStockCount}
                </Text>
                <Text style={styles.statLabel}>Low Stock (≤5)</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: "#fdf2f8", borderColor: "#fbcfe8" }]}>
                <Text style={[styles.statNumber, { color: "#be185d" }]}>{discountCount}</Text>
                <Text style={styles.statLabel}>Offers / Chhoot</Text>
              </View>
            </View>

            {/* Prominent Add Medicine Button */}
            <Pressable
              onPress={() => setEditing("new")}
              style={({ pressed }) => [
                styles.topAddBtn,
                {
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <Feather name="plus-circle" size={20} color="#ffffff" />
              <Text style={styles.topAddBtnText}>➕ Nayi Dawai Jodein (Add Medicine)</Text>
            </Pressable>

            {/* Search Bar for Dukandar */}
            <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Dawai ka naam search karein..."
                placeholderTextColor={colors.mutedForeground}
                style={[styles.searchInput, { color: colors.foreground }]}
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery("")} hitSlop={6}>
                  <Feather name="x-circle" size={16} color={colors.mutedForeground} />
                </Pressable>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          <Empty
            icon="grid"
            title="Dawai nahi mili"
            subtitle={searchQuery ? `"${searchQuery}" naam se koi dawai nahi hai` : "Pehli medicine add karein"}
          />
        }
        renderItem={({ item }) => {
          const final = finalPrice(item.price, item.discountPercent);
          const hasDiscount = (item.discountPercent ?? 0) > 0;
          const isLow = item.stock <= 5;

          return (
            <View
              style={[
                styles.itemCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {/* Image Container */}
              <View style={styles.itemImageBox}>
                <Image
                  source={item.image}
                  style={styles.itemImage}
                  contentFit="contain"
                />
              </View>

              {/* Medicine Info */}
              <View style={{ flex: 1, gap: 3 }}>
                <Text
                  style={[styles.name, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                {/* Price & Discount display */}
                <View style={styles.priceRow}>
                  <Text style={[styles.priceFinal, { color: colors.foreground }]}>
                    ₹{final}
                  </Text>
                  {hasDiscount ? (
                    <>
                      <Text
                        style={[
                          styles.priceOld,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        ₹{item.price}
                      </Text>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>
                          {item.discountPercent}% OFF
                        </Text>
                      </View>
                    </>
                  ) : null}
                </View>

                {/* Quick Stock Stepper right on card */}
                <View style={styles.stockContainer}>
                  <View style={styles.stockStepper}>
                    <Pressable
                      onPress={() => changeStock(item, -1)}
                      style={styles.stockStepBtn}
                      hitSlop={6}
                    >
                      <Feather name="minus" size={14} color="#475569" />
                    </Pressable>
                    <Text style={[styles.stockText, { color: isLow ? "#dc2626" : colors.foreground }]}>
                      Stock: {item.stock}
                    </Text>
                    <Pressable
                      onPress={() => changeStock(item, 1)}
                      style={styles.stockStepBtn}
                      hitSlop={6}
                    >
                      <Feather name="plus" size={14} color="#0aa672" />
                    </Pressable>
                  </View>

                  <View style={styles.otcTag}>
                    <Text style={styles.otcTagText}>
                      {item.otc ? "OTC" : "Rx"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons: Edit & Delete */}
              <View style={styles.actionsCol}>
                <Pressable
                  onPress={() => setEditing(item)}
                  hitSlop={6}
                  style={[
                    styles.editBtn,
                    { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
                  ]}
                >
                  <Feather name="edit-2" size={14} color="#1d4ed8" />
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Dawai Hatayein?",
                      `Kya aap sach me "${item.name}" ko dukan se hatana chahte hain?`,
                      [
                        { text: "Nahi (Cancel)", style: "cancel" },
                        {
                          text: "Hatao (Delete)",
                          style: "destructive",
                          onPress: () => removeMedicine(item.id),
                        },
                      ],
                    );
                  }}
                  hitSlop={6}
                  style={[styles.deleteBtn, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}
                >
                  <Feather name="trash-2" size={14} color="#dc2626" />
                  <Text style={styles.deleteBtnText}>Hatao</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      <Pressable
        onPress={() => setEditing("new")}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: bottomPad + 16,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Feather name="plus" size={20} color={colors.primaryForeground} />
        <Text style={[styles.fabText, { color: colors.primaryForeground }]}>
          Add Medicine
        </Text>
      </Pressable>

      <Modal
        visible={!!editing}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setEditing(null)}
      >
        {editing ? (
          <EditSheet
            medicine={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
            onSave={async (data) => {
              if (editing === "new") {
                await addMedicine(data);
              } else {
                await updateMedicine(editing.id, data);
              }
              setEditing(null);
            }}
          />
        ) : null}
      </Modal>
    </View>
  );
}

function EditSheet({
  medicine,
  onClose,
  onSave,
}: {
  medicine: Medicine | null;
  onClose: () => void;
  onSave: (data: Omit<Medicine, "id" | "image" | "shopId">) => Promise<void>;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(medicine?.name ?? "");
  const [description, setDescription] = useState(medicine?.description ?? "");
  const [price, setPrice] = useState(medicine ? String(medicine.price) : "");
  const [discount, setDiscount] = useState(
    medicine ? String(medicine.discountPercent ?? 0) : "0",
  );
  const [stock, setStock] = useState(medicine ? String(medicine.stock) : "10");
  const [otc, setOtc] = useState(medicine?.otc ?? true);
  const [imageKey, setImageKey] = useState(
    medicine?.imageKey ?? "paracetamol",
  );
  const [customImageUri, setCustomImageUri] = useState<string | null>(
    medicine?.customImageUri ?? null,
  );

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 8;
  const priceNum = Number(price) || 0;
  const discountNum = Number(discount) || 0;
  const previewFinal = finalPrice(priceNum, discountNum);

  const pickCustomImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission chahiye",
        "Apni medicine ki photo upload karne ke liye gallery ki permission de.",
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      setCustomImageUri(res.assets[0].uri);
    }
  };

  const submit = async () => {
    if (
      !name.trim() ||
      !description.trim() ||
      isNaN(priceNum) ||
      priceNum <= 0
    ) {
      Alert.alert(
        "Details adhure",
        "Naam, description aur sahi price daale.",
      );
      return;
    }
    if (discountNum < 0 || discountNum > 100) {
      Alert.alert("Galat discount", "0 se 100 ke beech ka % daale.");
      return;
    }
    const stockNum = Number(stock);
    await onSave({
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      discountPercent: discountNum,
      stock: isNaN(stockNum) ? 0 : stockNum,
      otc,
      imageKey,
      customImageUri,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.sheetHeader,
          { borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={onClose} hitSlop={8}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
          {medicine ? "Medicine Edit" : "New Medicine"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: bottomPad + 24,
          gap: 16,
        }}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 8 }}>
          <Text style={[styles.switchLabel, { color: colors.foreground }]}>
            Medicine ki photo
          </Text>
          <View style={styles.imageActions}>
            <View
              style={[
                styles.previewBox,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Image
                source={
                  customImageUri
                    ? { uri: customImageUri }
                    : MEDICINE_IMAGES[imageKey]
                }
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Pressable
                onPress={pickCustomImage}
                style={({ pressed }) => [
                  styles.uploadBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Feather
                  name="upload"
                  size={16}
                  color={colors.primaryForeground}
                />
                <Text
                  style={[
                    styles.uploadBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {customImageUri ? "Photo Badle" : "Photo Upload"}
                </Text>
              </Pressable>
              {customImageUri ? (
                <Pressable
                  onPress={() => setCustomImageUri(null)}
                  style={({ pressed }) => [
                    styles.removeImgBtn,
                    {
                      borderColor: colors.destructive,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Feather name="trash-2" size={14} color={colors.destructive} />
                  <Text
                    style={[
                      styles.removeImgText,
                      { color: colors.destructive },
                    ]}
                  >
                    Hatao (preset use karein)
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          {!customImageUri ? (
            <>
              <Text
                style={[styles.helpText, { color: colors.mutedForeground }]}
              >
                Ya neeche se preset image choose karein:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
              >
                {IMAGE_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => setImageKey(opt.key)}
                    style={({ pressed }) => [
                      styles.imgOption,
                      {
                        borderColor:
                          imageKey === opt.key
                            ? colors.primary
                            : colors.border,
                        backgroundColor: colors.card,
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    <Image
                      source={MEDICINE_IMAGES[opt.key]}
                      style={styles.imgOptionImage}
                      contentFit="cover"
                    />
                    <Text
                      style={[
                        styles.imgOptionLabel,
                        { color: colors.foreground },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}
        </View>

        <Field
          label="Medicine ka naam"
          value={name}
          onChange={setName}
          placeholder="e.g. Paracetamol 500mg"
        />
        <Field
          label="Kis kaam ke liye"
          value={description}
          onChange={setDescription}
          placeholder="Short description"
        />

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field
              label="Price (₹)"
              value={price}
              onChange={setPrice}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Discount (%)"
              value={discount}
              onChange={setDiscount}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>

        {priceNum > 0 ? (
          <View
            style={[
              styles.pricePreview,
              {
                backgroundColor: colors.accent,
                borderColor: colors.primary,
              },
            ]}
          >
            <View>
              <Text
                style={[
                  styles.previewLabel,
                  { color: colors.accentForeground },
                ]}
              >
                Final price (customer pays)
              </Text>
              <View style={styles.pricePreviewRow}>
                <Text
                  style={[styles.previewFinal, { color: colors.foreground }]}
                >
                  ₹{previewFinal}
                </Text>
                {discountNum > 0 ? (
                  <Text
                    style={[
                      styles.previewOld,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    ₹{priceNum}
                  </Text>
                ) : null}
              </View>
            </View>
            {discountNum > 0 ? (
              <View style={styles.savePill}>
                <Text style={styles.savePillText}>
                  Save ₹{(priceNum - previewFinal).toFixed(2)}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <Field
          label="Stock"
          value={stock}
          onChange={setStock}
          placeholder="0"
          keyboardType="numeric"
        />

        <View
          style={[
            styles.switchRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.switchLabel, { color: colors.foreground }]}>
              OTC (bina parche ke)
            </Text>
            <Text
              style={[styles.switchHelp, { color: colors.mutedForeground }]}
            >
              Off karein toh prescription wali medicine hogi
            </Text>
          </View>
          <Switch
            value={otc}
            onValueChange={setOtc}
            trackColor={{ true: colors.primary, false: colors.muted }}
          />
        </View>

        <PrimaryButton
          title={medicine ? "Save Changes" : "Add Medicine"}
          icon="check"
          onPress={submit}
        />
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#059669",
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "#475569",
    marginTop: 2,
    textAlign: "center",
  },
  topAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0aa672",
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: "#0aa672",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  topAddBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#ffffff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    padding: 0,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  itemImageBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  priceFinal: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  priceOld: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  discountBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#059669",
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  stockStepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    backgroundColor: "#f8fafc",
  },
  stockStepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stockText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    paddingHorizontal: 4,
  },
  otcTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  otcTagText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    color: "#475569",
  },
  actionsCol: {
    gap: 6,
    alignItems: "flex-end",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  editBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#1d4ed8",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#dc2626",
  },
  fab: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#0aa672",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  switchLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  switchHelp: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  imageActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  previewBox: {
    width: 80,
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 6,
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  uploadBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  removeImgBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  removeImgText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  helpText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },
  imgOption: {
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    width: 84,
  },
  imgOptionImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  imgOptionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    textAlign: "center",
  },
  pricePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  previewLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  pricePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  previewFinal: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  previewOld: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textDecorationLine: "line-through",
  },
  savePill: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  savePillText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#ffffff",
  },
});
