import { ImageSourcePropType } from "react-native";

import type { Medicine as ApiMedicine } from "@workspace/api-client-react";

export type Medicine = ApiMedicine & {
  image: ImageSourcePropType;
};

export const MEDICINE_IMAGES: Record<string, ImageSourcePropType> = {
  paracetamol: require("../assets/images/med_paracetamol.png"),
  capsule: require("../assets/images/med_capsule.png"),
  syrup: require("../assets/images/med_syrup.png"),
  blister: require("../assets/images/med_blister.png"),
  inhaler: require("../assets/images/med_inhaler.png"),
  vitamin: require("../assets/images/med_vitamin.png"),
  eyedrops: require("../assets/images/med_eyedrops.png"),
};

export const IMAGE_OPTIONS: { key: string; label: string }[] = [
  { key: "paracetamol", label: "Tablet" },
  { key: "capsule", label: "Capsule" },
  { key: "syrup", label: "Syrup" },
  { key: "blister", label: "Blister Pack" },
  { key: "inhaler", label: "Inhaler" },
  { key: "vitamin", label: "Vitamin" },
  { key: "eyedrops", label: "Eye Drops" },
];

export function resolveImage(
  imageKey: string,
  customImageUri: string | null,
): ImageSourcePropType {
  if (customImageUri) return { uri: customImageUri };
  return MEDICINE_IMAGES[imageKey] ?? MEDICINE_IMAGES.paracetamol;
}

export function finalPrice(price: number, discountPercent: number): number {
  const safe = Math.max(0, Math.min(100, discountPercent || 0));
  const value = price * (1 - safe / 100);
  return Math.round(value * 100) / 100;
}

export function withImage(m: ApiMedicine): Medicine {
  return { ...m, image: resolveImage(m.imageKey, m.customImageUri) };
}
