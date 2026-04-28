import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
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
} from "@/constants/medicines";

export default function ShopMedicines() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { medicines, addMedicine, updateMedicine, removeMedicine } = useApp();
  const [editing, setEditing] = useState<Medicine | "new" | null>(null);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 8;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={medicines}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: bottomPad + 100,
          gap: 12,
        }}
        ListHeaderComponent={
          <View style={{ paddingBottom: 8 }}>
            <Text
              style={[styles.subtitle, { color: colors.mutedForeground }]}
            >
              Medicine add karein, price aur stock update karein
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Empty
            icon="grid"
            title="Inventory empty"
            subtitle="Pehli medicine add karein"
          />
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.row,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[styles.imageWrap, { backgroundColor: colors.secondary }]}
            >
              <Image
                source={item.image}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={[styles.name, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={[styles.meta, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                ₹{item.price} · Stock {item.stock} ·{" "}
                {item.otc ? "OTC" : "Rx"}
              </Text>
            </View>
            <Pressable
              onPress={() => setEditing(item)}
              hitSlop={6}
              style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
            >
              <Feather name="edit-2" size={16} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => {
                Alert.alert("Confirm", `${item.name} hatana hai?`, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Hatao",
                    style: "destructive",
                    onPress: () => removeMedicine(item.id),
                  },
                ]);
              }}
              hitSlop={6}
              style={[styles.iconBtn, { backgroundColor: "#fee2e2" }]}
            >
              <Feather name="trash-2" size={16} color={colors.destructive} />
            </Pressable>
          </View>
        )}
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
  onSave: (data: Omit<Medicine, "id" | "image">) => Promise<void>;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(medicine?.name ?? "");
  const [description, setDescription] = useState(medicine?.description ?? "");
  const [price, setPrice] = useState(
    medicine ? String(medicine.price) : "",
  );
  const [stock, setStock] = useState(
    medicine ? String(medicine.stock) : "10",
  );
  const [otc, setOtc] = useState(medicine?.otc ?? true);
  const [imageKey, setImageKey] = useState(
    medicine?.imageKey ?? "paracetamol",
  );

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 8;

  const submit = async () => {
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!name.trim() || !description.trim() || isNaN(priceNum) || priceNum <= 0) {
      Alert.alert(
        "Details adhure",
        "Naam, description aur sahi price daale.",
      );
      return;
    }
    await onSave({
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      stock: isNaN(stockNum) ? 0 : stockNum,
      otc,
      imageKey,
    });
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background }}
    >
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
              label="Stock"
              value={stock}
              onChange={setStock}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>

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

        <View>
          <Text
            style={[
              styles.switchLabel,
              { color: colors.foreground, marginBottom: 8 },
            ]}
          >
            Image type
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
                      imageKey === opt.key ? colors.primary : colors.border,
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
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  imageWrap: {
    width: 52,
    height: 52,
    borderRadius: 999,
    overflow: "hidden",
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  meta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
  imgOption: {
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 14,
    borderWidth: 2,
    width: 84,
  },
  imgOptionImage: {
    width: 56,
    height: 56,
    borderRadius: 999,
  },
  imgOptionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
});
