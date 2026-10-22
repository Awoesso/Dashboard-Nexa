export type StoreStatus = "active" | "inactive";

export interface StoreRecord {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  language: string;
  timezone: string;
  status: StoreStatus;
  created_at: string;
  updated_at: string;
}

export type StoreFormValues = Pick<
  StoreRecord,
  "name" | "slug" | "country" | "currency" | "language" | "timezone"
>;

export interface StoreProductPreview {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  status: "published";
}

export type StoreTemplateId = "atelier" | "market" | "studio";

export interface StoreDesign {
  primaryColor: string;
  accentColor: string;
}

export type StoreFieldErrors = Partial<
  Record<keyof StoreFormValues, string>
>;

export type DskStoreTemplateId = "fashion" | "tech" | "general";

export type StorePreviewDevice = "mobile" | "tablet" | "desktop";

export interface StoreCountryOption {
  code: string;
  name: string;
  dialCode: string;
  currency: string;
  language: string;
  timezone: string;
}

export interface StoreSettingsDraft {
  template: DskStoreTemplateId;
  primaryColor: string;
  accentColor: string;
  countryCode: string;
  dialCode: string;
}