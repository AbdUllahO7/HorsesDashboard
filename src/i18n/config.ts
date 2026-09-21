export type Locale = "ar" | "en";
export type Direction = "rtl" | "ltr";

export const i18nConfig = {
  defaultLocale: "ar" as Locale,
  locales: ["ar", "en"] as const,
  directions: {
    ar: "rtl" as Direction,
    en: "ltr" as Direction,
  },
  cookieName: "horses_admin_locale",
  localeNames: {
    ar: "العربية",
    en: "English",
  },
};
