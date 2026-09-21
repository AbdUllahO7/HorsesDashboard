"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Locale, Direction, i18nConfig } from "./config";
import { ar, TranslationSchema } from "./locales/ar";
import { en } from "./locales/en";

const dictionaries: Record<Locale, TranslationSchema> = {
  ar,
  en,
};

// Nested path type helper
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationSchema>;

export interface LanguageContextType {
  locale: Locale;
  dir: Direction;
  isRTL: boolean;
  changeLanguage: (newLocale: Locale) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLocale = i18nConfig.defaultLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const dir: Direction = i18nConfig.directions[locale] || "rtl";
  const isRTL = dir === "rtl";

  const applyLanguageSettings = useCallback((targetLocale: Locale) => {
    const targetDir = i18nConfig.directions[targetLocale] || "rtl";
    document.documentElement.lang = targetLocale;
    document.documentElement.dir = targetDir;
    document.cookie = `${i18nConfig.cookieName}=${targetLocale}; path=/; max-age=31536000; SameSite=Lax;`;
    localStorage.setItem(i18nConfig.cookieName, targetLocale);
  }, []);

  useEffect(() => {
    // Read saved locale on mount
    const savedCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${i18nConfig.cookieName}=`))
      ?.split("=")[1] as Locale | undefined;

    const savedLocal = (typeof window !== "undefined"
      ? localStorage.getItem(i18nConfig.cookieName)
      : null) as Locale | null;

    const resolvedLocale = savedCookie || savedLocal || i18nConfig.defaultLocale;
    if (resolvedLocale && (resolvedLocale === "ar" || resolvedLocale === "en")) {
      setLocale(resolvedLocale);
      applyLanguageSettings(resolvedLocale);
    }
  }, [applyLanguageSettings]);

  const changeLanguage = (newLocale: Locale) => {
    if (newLocale === locale) return;
    setLocale(newLocale);
    applyLanguageSettings(newLocale);
  };

  const toggleLanguage = () => {
    const nextLocale: Locale = locale === "ar" ? "en" : "ar";
    changeLanguage(nextLocale);
  };

  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      const currentDict = dictionaries[locale] || dictionaries.ar;
      const keys = key.split(".");
      let current: unknown = currentDict;

      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = (current as Record<string, unknown>)[k];
        } else {
          return fallback || key;
        }
      }

      return typeof current === "string" ? current : fallback || key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider
      value={{
        locale,
        dir,
        isRTL,
        changeLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
