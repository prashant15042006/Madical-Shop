import { ImageSourcePropType } from "react-native";

export type Medicine = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  otc: boolean;
  image: ImageSourcePropType;
  imageKey: string;
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

export const DEFAULT_MEDICINES: Medicine[] = [
  {
    id: "med_paracetamol",
    name: "Paracetamol 500mg",
    description: "Bukhar aur sir dard ke liye",
    price: 25,
    stock: 50,
    otc: true,
    imageKey: "paracetamol",
    image: MEDICINE_IMAGES.paracetamol,
  },
  {
    id: "med_crocin",
    name: "Crocin Advance",
    description: "Tej dard, OTC tablet",
    price: 35,
    stock: 40,
    otc: true,
    imageKey: "blister",
    image: MEDICINE_IMAGES.blister,
  },
  {
    id: "med_amoxicillin",
    name: "Amoxicillin 250mg",
    description: "Antibiotic capsule",
    price: 85,
    stock: 30,
    otc: false,
    imageKey: "capsule",
    image: MEDICINE_IMAGES.capsule,
  },
  {
    id: "med_benadryl",
    name: "Benadryl Cough Syrup",
    description: "Khansi ke liye syrup",
    price: 120,
    stock: 25,
    otc: true,
    imageKey: "syrup",
    image: MEDICINE_IMAGES.syrup,
  },
  {
    id: "med_asthalin",
    name: "Asthalin Inhaler",
    description: "Asthma inhaler",
    price: 250,
    stock: 15,
    otc: false,
    imageKey: "inhaler",
    image: MEDICINE_IMAGES.inhaler,
  },
  {
    id: "med_vitc",
    name: "Vitamin C 1000mg",
    description: "Immunity booster tablet",
    price: 180,
    stock: 60,
    otc: true,
    imageKey: "vitamin",
    image: MEDICINE_IMAGES.vitamin,
  },
  {
    id: "med_eyedrop",
    name: "Refresh Eye Drops",
    description: "Aankh ki sukhan ke liye",
    price: 60,
    stock: 35,
    otc: true,
    imageKey: "eyedrops",
    image: MEDICINE_IMAGES.eyedrops,
  },
];
