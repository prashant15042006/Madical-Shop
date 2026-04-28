import { ImageSourcePropType } from "react-native";

export type Medicine = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  stock: number;
  otc: boolean;
  imageKey: string;
  customImageUri: string | null;
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

export const DEFAULT_MEDICINES: Medicine[] = [
  {
    id: "med_paracetamol",
    name: "Paracetamol 500mg",
    description: "Bukhar aur sir dard ke liye",
    price: 25,
    discountPercent: 0,
    stock: 50,
    otc: true,
    imageKey: "paracetamol",
    customImageUri: null,
    image: MEDICINE_IMAGES.paracetamol,
  },
  {
    id: "med_crocin",
    name: "Crocin Advance",
    description: "Tej dard, OTC tablet",
    price: 35,
    discountPercent: 5,
    stock: 40,
    otc: true,
    imageKey: "blister",
    customImageUri: null,
    image: MEDICINE_IMAGES.blister,
  },
  {
    id: "med_amoxicillin",
    name: "Amoxicillin 250mg",
    description: "Antibiotic capsule",
    price: 85,
    discountPercent: 0,
    stock: 30,
    otc: false,
    imageKey: "capsule",
    customImageUri: null,
    image: MEDICINE_IMAGES.capsule,
  },
  {
    id: "med_benadryl",
    name: "Benadryl Cough Syrup",
    description: "Khansi ke liye syrup",
    price: 120,
    discountPercent: 10,
    stock: 25,
    otc: true,
    imageKey: "syrup",
    customImageUri: null,
    image: MEDICINE_IMAGES.syrup,
  },
  {
    id: "med_asthalin",
    name: "Asthalin Inhaler",
    description: "Asthma inhaler",
    price: 250,
    discountPercent: 0,
    stock: 15,
    otc: false,
    imageKey: "inhaler",
    customImageUri: null,
    image: MEDICINE_IMAGES.inhaler,
  },
  {
    id: "med_vitc",
    name: "Vitamin C 1000mg",
    description: "Immunity booster tablet",
    price: 180,
    discountPercent: 15,
    stock: 60,
    otc: true,
    imageKey: "vitamin",
    customImageUri: null,
    image: MEDICINE_IMAGES.vitamin,
  },
  {
    id: "med_eyedrop",
    name: "Refresh Eye Drops",
    description: "Aankh ki sukhan ke liye",
    price: 60,
    discountPercent: 0,
    stock: 35,
    otc: true,
    imageKey: "eyedrops",
    customImageUri: null,
    image: MEDICINE_IMAGES.eyedrops,
  },
];
