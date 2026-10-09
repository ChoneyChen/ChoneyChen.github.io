import * as zh from "./content";
import * as en from "./content.en";
import { useI18n } from "../i18n";

export function useContent() {
  const { language } = useI18n();
  return language === "en" ? en : zh;
}
