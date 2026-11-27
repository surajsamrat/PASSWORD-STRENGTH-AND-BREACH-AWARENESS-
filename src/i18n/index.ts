import { en, type TranslationSchema } from "./en";
import { hi } from "./hi";
import type { Language } from "@/types/security";

export const dictionaries: Record<Language, TranslationSchema> = {
  en,
  hi,
};
