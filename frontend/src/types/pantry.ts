export type Unit = "g" | "kg" | "ml" | "l" | "pcs" | "pack" | "bottle" | "can";

export type StorageLocation = "fridge" | "freezer" | "pantry" | "room";

export type Category =
  | "protein"
  | "vegetable"
  | "fruit"
  | "grain"
  | "dairy"
  | "condiment"
  | "beverage"
  | "other";

export type Status = "expired" | "expiring" | "fresh";

// Runtime constants derived from types
export const UNITS: readonly Unit[] = [
  "g",
  "kg",
  "ml",
  "l",
  "pcs",
  "pack",
  "bottle",
  "can",
] as const;

export const STORAGE_LOCATIONS: readonly StorageLocation[] = [
  "fridge",
  "freezer",
  "pantry",
  "room",
] as const;

export const CATEGORIES: readonly Category[] = [
  "protein",
  "vegetable",
  "fruit",
  "grain",
  "dairy",
  "condiment",
  "beverage",
  "other",
] as const;

export interface PantryItem {
  _id?: string; // MongoDB ObjectId
  user?: string; // ObjectId reference
  name: string;
  quantity: number;
  unit: Unit;
  storageLocation: StorageLocation;
  expiryDate: string; // ISO date string
  category: Category;
  openedDate?: string; // ISO date string, optional
  notes?: string;
  status?: Status; // Computed on backend
  daysToExpire?: number; // Computed on backend
  createdAt?: string;
  updatedAt?: string;
}

export interface PantrySummary {
  total: number;
  expired: number;
  expiring: number;
  fresh: number;
}

export interface PantryListResponse {
  success: boolean;
  data: PantryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    expiringDays: number;
    status: string;
    timezone: string;
  };
}

export interface PantrySummaryResponse {
  success: boolean;
  data: PantrySummary;
  meta: {
    expiringDays: number;
    timezone: string;
  };
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  matchPercentage: number;
  prepTime: string;
  imageUrl: string;
}
