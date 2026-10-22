import type { StoreCountryOption } from "@/types/store";

export const STORE_COUNTRIES: StoreCountryOption[] = [
  { code: "TG", name: "Togo", dialCode: "+228", currency: "XOF", language: "French", timezone: "Africa/Lome" },
  { code: "GM", name: "Gambie", dialCode: "+220", currency: "GMD", language: "English", timezone: "Africa/Banjul" },
  { code: "BJ", name: "Bénin", dialCode: "+229", currency: "XOF", language: "French", timezone: "Africa/Porto-Novo" },
  { code: "GH", name: "Ghana", dialCode: "+233", currency: "GHS", language: "English", timezone: "Africa/Accra" },
  { code: "NG", name: "Nigeria", dialCode: "+234", currency: "NGN", language: "English", timezone: "Africa/Lagos" },
  { code: "CI", name: "Côte d’Ivoire", dialCode: "+225", currency: "XOF", language: "French", timezone: "Africa/Abidjan" },
  { code: "SN", name: "Sénégal", dialCode: "+221", currency: "XOF", language: "French", timezone: "Africa/Dakar" },
  { code: "ML", name: "Mali", dialCode: "+223", currency: "XOF", language: "French", timezone: "Africa/Bamako" },
  { code: "BF", name: "Burkina Faso", dialCode: "+226", currency: "XOF", language: "French", timezone: "Africa/Ouagadougou" },
  { code: "NE", name: "Niger", dialCode: "+227", currency: "XOF", language: "French", timezone: "Africa/Niamey" },
  { code: "CM", name: "Cameroun", dialCode: "+237", currency: "XAF", language: "French", timezone: "Africa/Douala" },
  { code: "GA", name: "Gabon", dialCode: "+241", currency: "XAF", language: "French", timezone: "Africa/Libreville" },
  { code: "CD", name: "RDC", dialCode: "+243", currency: "CDF", language: "French", timezone: "Africa/Kinshasa" },
  { code: "MA", name: "Maroc", dialCode: "+212", currency: "MAD", language: "French", timezone: "Africa/Casablanca" },
  { code: "FR", name: "France", dialCode: "+33", currency: "EUR", language: "French", timezone: "Europe/Paris" },
  { code: "US", name: "États-Unis", dialCode: "+1", currency: "USD", language: "English", timezone: "America/New_York" },
];

export const DEFAULT_STORE_COUNTRY = STORE_COUNTRIES[0];

export const findStoreCountry = (value: string | null | undefined) => {
  if (!value) return DEFAULT_STORE_COUNTRY;
  const normalized = value.trim().toLowerCase();
  return (
    STORE_COUNTRIES.find(
      (country) =>
        country.code.toLowerCase() === normalized ||
        country.name.toLowerCase() === normalized ||
        country.dialCode === value.trim(),
    ) ?? DEFAULT_STORE_COUNTRY
  );
};
